/**
 * RNNStepVisual
 * ─────────────
 * Recurrent networks process a sequence by rolling a hidden state h forward
 * one token at a time:
 *
 *   h_t = tanh( W_hh · h_{t-1}  +  W_xh · x_t )
 *   y_t =  W_hy · h_t
 *
 * Learners rarely see that h is *the same vector slot* updated in place —
 * they imagine discrete boxes side by side. We fix that by animating a single
 * hidden-state pill that morphs its values as each token flows in, while the
 * processed tokens stack up in a "memory" strip behind it.
 *
 * No real weights — we fake the update with a bounded, deterministic mixer so
 * the visual stays legible: the chosen token influences the hidden state
 * proportionally to a small mixing weight.
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ArrowClockwise, SkipForward, Waveform } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type TokenVec = { word: string; x: number[] }

const HIDDEN_DIM = 4
const DEFAULT_SENTENCE: TokenVec[] = [
  { word: 'the', x: [0.1, 0.0, 0.0, 0.2] },
  { word: 'cat', x: [0.9, 0.3, 0.1, 0.2] },
  { word: 'sat', x: [0.2, 0.8, 0.3, 0.1] },
  { word: 'on', x: [-0.1, 0.2, 0.4, 0.0] },
  { word: 'a', x: [0.1, 0.1, 0.0, 0.2] },
  { word: 'mat', x: [0.5, 0.1, 0.2, 0.7] },
]

function tanh(x: number): number {
  return Math.tanh(x)
}

// Deterministic fake "weights" baked in; produces legible small numbers.
const W_HH = [
  [0.6, -0.1, 0.2, 0.0],
  [0.1, 0.7, 0.0, -0.1],
  [0.0, 0.1, 0.6, 0.2],
  [0.1, 0.0, 0.1, 0.7],
]
const W_XH = [
  [0.8, 0.1, 0.0, 0.0],
  [0.0, 0.8, 0.1, 0.0],
  [0.1, 0.0, 0.8, 0.1],
  [0.0, 0.1, 0.0, 0.8],
]

function step(h: number[], x: number[]): number[] {
  const hNext = new Array(HIDDEN_DIM).fill(0)
  for (let i = 0; i < HIDDEN_DIM; i++) {
    let s = 0
    for (let j = 0; j < HIDDEN_DIM; j++) s += W_HH[i][j] * h[j]
    for (let j = 0; j < x.length; j++) s += W_XH[i][j] * x[j]
    hNext[i] = tanh(s)
  }
  return hNext
}

export function RNNStepVisual() {
  const sentence = DEFAULT_SENTENCE
  const [t, setT] = useState(-1) // -1 = initial zeros
  const [playing, setPlaying] = useState(false)

  const hSeries = useMemo(() => {
    const hs: number[][] = [[0, 0, 0, 0]]
    for (const tok of sentence) hs.push(step(hs[hs.length - 1], tok.x))
    return hs
  }, [sentence])

  const h = hSeries[Math.max(0, t + 1)]
  const done = t >= sentence.length - 1

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => {
      if (t < sentence.length - 1) setT((v) => v + 1)
      else setPlaying(false)
    }, 700)
    return () => window.clearTimeout(id)
  }, [playing, t, sentence.length])

  function advance() {
    if (t < sentence.length - 1) setT((v) => v + 1)
  }
  function reset() {
    setT(-1)
    setPlaying(false)
  }

  return (
    <Card className="p-5 border-2 bg-gradient-to-br from-background via-cyan/5 to-violet/5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Waveform size={18} weight="fill" className="text-cyan" />
            RNN Hidden State — memory rolling through time
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            The SAME 4-dim hidden vector is updated token by token:
            <code className="ml-1 bg-muted px-1 rounded">h_t = tanh(W_hh · h_{'{t-1}'} + W_xh · x_t)</code>
          </p>
        </div>
      </div>

      {/* sentence strip */}
      <div className="flex justify-center flex-wrap gap-1.5 mb-5">
        {sentence.map((tok, i) => {
          const state =
            i < t ? 'past' : i === t ? 'current' : i === t + 1 ? 'next' : 'future'
          return (
            <motion.div
              key={i}
              animate={{
                y: state === 'current' ? -4 : 0,
                scale: state === 'current' ? 1.05 : 1,
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg border-2 text-sm font-mono',
                state === 'past' && 'bg-muted/30 border-border text-muted-foreground',
                state === 'current' && 'bg-cyan/20 border-cyan text-cyan font-bold shadow-md',
                state === 'next' && 'bg-card border-dashed border-cyan/40',
                state === 'future' && 'bg-card border-border text-muted-foreground/60',
              )}
            >
              {tok.word}
            </motion.div>
          )
        })}
      </div>

      {/* hidden state pill */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs text-muted-foreground">
          hidden state h<sub>{Math.max(0, t + 1)}</sub>
          {t === -1 && <span className="ml-1">(zeros — no input yet)</span>}
        </div>
        <motion.div
          className="flex gap-1 p-2 rounded-xl bg-gradient-to-br from-violet/10 to-cyan/10 border-2 border-violet/30"
          animate={{ boxShadow: t >= 0 ? '0 0 24px oklch(0.62 0.24 300 / 0.35)' : 'none' }}
        >
          {h.map((v, i) => (
            <motion.div
              key={i}
              animate={{ scale: t >= 0 ? [1, 1.15, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 rounded-lg flex items-center justify-center text-xs font-mono border relative overflow-hidden"
              style={{
                background: `oklch(0.62 0.24 300 / ${0.08 + Math.abs(v) * 0.35})`,
                borderColor: `oklch(0.62 0.24 300 / ${0.3 + Math.abs(v) * 0.5})`,
              }}
            >
              <span className="relative z-10 font-semibold">{v.toFixed(2)}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* live formula */}
      <AnimatePresence mode="wait">
        {t >= 0 && (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-lg bg-muted/40 border p-3 font-mono text-[11px] md:text-xs overflow-x-auto"
          >
            <div className="text-muted-foreground mb-1">step {t + 1}:</div>
            <div className="flex flex-wrap items-center gap-1">
              <span>h<sub>{t + 1}</sub> = tanh(</span>
              <span className="px-1.5 py-0.5 rounded bg-violet/15 text-violet border border-violet/30">
                W_hh · h<sub>{t}</sub>
              </span>
              <span>+</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/30">
                W_xh · x(&quot;{sentence[t].word}&quot;)
              </span>
              <span>)</span>
              <span className="mx-1 text-muted-foreground">=</span>
              <span className="px-2 py-0.5 rounded bg-lime/15 text-lime border border-lime/30 font-bold">
                [{h.map((v) => v.toFixed(2)).join(', ')}]
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* controls */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant={playing ? 'secondary' : 'default'}
          onClick={() => setPlaying((p) => !p)}
          disabled={done}
          className="gap-1"
        >
          {playing ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
          {playing ? 'Pause' : done ? 'Done' : 'Play'}
        </Button>
        <Button size="sm" variant="outline" onClick={advance} disabled={done || playing} className="gap-1">
          <SkipForward size={14} weight="fill" /> Step
        </Button>
        <Button size="sm" variant="ghost" onClick={reset} className="gap-1">
          <ArrowClockwise size={14} /> Reset
        </Button>
      </div>

      <div className="text-[11px] text-center text-muted-foreground mt-3">
        Watch the pill — the hidden state accumulates information about everything seen so far.
        Long sequences cause <b>vanishing gradients</b>; LSTMs fix this with gates.
      </div>
    </Card>
  )
}

export default RNNStepVisual
