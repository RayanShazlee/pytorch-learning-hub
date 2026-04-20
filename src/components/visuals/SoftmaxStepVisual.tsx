/**
 * SoftmaxStepVisual
 * ─────────────────
 * Softmax turns arbitrary real-valued logits into a probability distribution.
 * Every classifier, every policy network, every attention head ends with one.
 *
 * The animation plays out four discrete phases:
 *   1. Raw logits (can be any real numbers)
 *   2. exp(logit / T) — the "amplification" step, temperature T controls sharpness
 *   3. Divide by the sum — normalise to [0,1]
 *   4. Result bars that add up to 100%
 *
 * A temperature slider (0.1 → 3.0) teaches the intuition from RL/LLM sampling:
 *   • Low T (0.3) → distribution collapses to argmax (confident / greedy)
 *   • T = 1      → "honest" softmax
 *   • High T (2) → distribution flattens (exploration / creativity)
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  ArrowClockwise,
  SkipForward,
  Thermometer,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const CLASSES = ['cat', 'dog', 'bird', 'fish', 'rabbit']
const LOGITS = [2.3, 1.7, 0.8, -0.5, -1.2]

type Phase = 'raw' | 'exp' | 'sum' | 'probs'

function softmaxWithTemp(xs: number[], T: number): { exps: number[]; probs: number[]; sum: number } {
  const m = Math.max(...xs)
  const exps = xs.map((x) => Math.exp((x - m) / T))
  const sum = exps.reduce((a, b) => a + b, 0)
  const probs = exps.map((e) => e / sum)
  return { exps, probs, sum }
}

export function SoftmaxStepVisual() {
  const [T, setT] = useState(1.0)
  const [phase, setPhase] = useState<Phase>('raw')
  const [playing, setPlaying] = useState(false)

  const { exps, probs, sum } = useMemo(() => softmaxWithTemp(LOGITS, T), [T])

  const order: Phase[] = ['raw', 'exp', 'sum', 'probs']

  function next() {
    const i = order.indexOf(phase)
    if (i < order.length - 1) setPhase(order[i + 1])
    else setPlaying(false)
  }
  function reset() {
    setPhase('raw')
    setPlaying(false)
  }

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(next, 850)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, phase])

  const maxExp = Math.max(...exps)
  const maxLogit = Math.max(...LOGITS.map(Math.abs))

  const phaseDescription: Record<Phase, string> = {
    raw: 'Raw logits — any real number, positive or negative.',
    exp: `exp(logit / T) — lifts everything positive, amplifies differences. T=${T.toFixed(2)}.`,
    sum: `Total = ${sum.toFixed(3)}. We will divide each exp by this.`,
    probs: 'Normalised — every bar is a probability, they sum to 1.',
  }

  return (
    <Card className="p-5 border-2 bg-gradient-to-br from-background via-lime/5 to-cyan/5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Thermometer size={18} weight="fill" className="text-cyan" />
            Softmax — turn logits into probabilities
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Every classification head and every LLM token-picker ends with this. Temperature
            controls how confident the distribution looks.
          </p>
        </div>
      </div>

      {/* bars for each phase */}
      <div className="rounded-lg border-2 bg-card p-3 space-y-2 mb-3">
        {CLASSES.map((c, i) => {
          const l = LOGITS[i]
          const e = exps[i]
          const p = probs[i]
          const leftBar = phase === 'raw' || phase === 'exp'
          return (
            <div key={c} className="flex items-center gap-2 text-xs font-mono">
              <div className="w-14 text-right text-muted-foreground">{c}</div>
              {/* raw logit bar */}
              <div className="relative flex-1 h-6">
                {/* zero line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />

                <AnimatePresence mode="wait">
                  {leftBar ? (
                    <motion.div
                      key="logit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-0.5 bottom-0.5 rounded"
                      style={{
                        left: l >= 0 ? '50%' : `${50 - (Math.abs(l) / maxLogit) * 48}%`,
                        width: `${(Math.abs(l) / maxLogit) * 48}%`,
                        background: l >= 0 ? 'oklch(0.72 0.18 200 / 0.5)' : 'oklch(0.70 0.28 340 / 0.5)',
                      }}
                    />
                  ) : (
                    <motion.div
                      key="exp"
                      initial={{ width: 0 }}
                      animate={{ width: `${(e / maxExp) * 96}%` }}
                      className="absolute top-0.5 bottom-0.5 left-0.5 rounded bg-gradient-to-r from-lime to-cyan"
                    />
                  )}
                </AnimatePresence>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-foreground font-bold mix-blend-difference pointer-events-none">
                  {phase === 'raw' && l.toFixed(2)}
                  {phase === 'exp' && e.toFixed(2)}
                  {phase === 'sum' && `${e.toFixed(2)} / ${sum.toFixed(2)}`}
                  {phase === 'probs' && `${(p * 100).toFixed(1)}%`}
                </div>
              </div>
              {phase === 'probs' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    'px-1.5 py-0.5 rounded border text-[10px]',
                    p > 0.3 ? 'bg-lime/20 text-lime border-lime/40' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {(p * 100).toFixed(1)}%
                </motion.div>
              )}
            </div>
          )
        })}
      </div>

      <div className="text-xs text-center text-muted-foreground mb-3">{phaseDescription[phase]}</div>

      {/* temperature */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <Thermometer size={14} className="text-muted-foreground" />
          <label className="text-muted-foreground">temperature T</label>
          <input
            type="range"
            min={0.1}
            max={3.0}
            step={0.05}
            value={T}
            onChange={(e) => {
              setT(parseFloat(e.target.value))
            }}
            className="accent-cyan w-40"
          />
          <span className="font-mono w-10 text-right">{T.toFixed(2)}</span>
          <span
            className={cn(
              'ml-1 px-1.5 py-0.5 rounded border text-[10px] uppercase tracking-wide',
              T < 0.5
                ? 'bg-pink/20 text-pink border-pink/40'
                : T < 1.3
                  ? 'bg-lime/20 text-lime border-lime/40'
                  : 'bg-cyan/20 text-cyan border-cyan/40',
            )}
          >
            {T < 0.5 ? 'confident' : T < 1.3 ? 'balanced' : 'exploratory'}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={playing ? 'secondary' : 'default'}
            onClick={() => setPlaying((p) => !p)}
            disabled={phase === 'probs'}
            className="gap-1"
          >
            {playing ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
            {playing ? 'Pause' : phase === 'probs' ? 'Done' : 'Play'}
          </Button>
          <Button size="sm" variant="outline" onClick={next} disabled={phase === 'probs' || playing} className="gap-1">
            <SkipForward size={14} weight="fill" /> Step
          </Button>
          <Button size="sm" variant="ghost" onClick={reset} className="gap-1">
            <ArrowClockwise size={14} /> Reset
          </Button>
        </div>
      </div>

      <div className="text-[11px] text-center text-muted-foreground">
        Try T = 0.2 (model becomes decisive) vs T = 2.5 (nearly uniform, creative). That single knob
        is why LLMs feel &quot;precise&quot; or &quot;imaginative&quot;.
      </div>
    </Card>
  )
}

export default SoftmaxStepVisual
