/**
 * AttentionStepVisual
 * ───────────────────
 * Self-attention, the engine of every modern LLM, shown as a 4-step animation
 * for ONE query token at a time:
 *
 *   1. Query picks a token → dot products against every Key.
 *   2. Scale by √d_k.
 *   3. Softmax → attention weights (probabilities, sum to 1).
 *   4. Weighted sum of Values → the new representation for that query.
 *
 * We use a tiny 6-token sentence ("the cat sat on the mat") with 3-dim Q/K/V
 * drawn from a small hand-picked table so the numbers stay legible. The bar
 * chart of attention weights animates as softmax is applied, and the
 * highlighted key/value tokens pulse in sync with the running sum.
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ArrowClockwise, SkipForward, Eye } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const TOKENS = ['the', 'cat', 'sat', 'on', 'the', 'mat']
const D = 3 // tiny so we can show the vectors

// Hand-picked so "cat" attends strongly to "sat" and "mat", etc.
const Q: number[][] = [
  [0.2, 0.1, -0.1],  // the
  [0.9, 0.1, 0.4],   // cat      ← interesting query
  [0.3, 0.8, 0.1],   // sat
  [-0.1, 0.2, 0.5],  // on
  [0.2, 0.1, -0.1],  // the
  [0.5, 0.4, -0.2],  // mat
]
const K: number[][] = [
  [0.1, 0.0, 0.0],
  [0.8, 0.2, 0.3],
  [0.5, 0.7, 0.1],
  [0.0, 0.3, 0.4],
  [0.1, 0.0, 0.0],
  [0.7, 0.3, 0.2],
]
const V: number[][] = [
  [0.0, 0.1, 0.0],
  [0.9, 0.2, 0.1],
  [0.3, 0.8, 0.2],
  [0.1, 0.2, 0.5],
  [0.0, 0.1, 0.0],
  [0.6, 0.3, 0.4],
]

function dot(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

function softmax(xs: number[]): number[] {
  const m = Math.max(...xs)
  const exps = xs.map((x) => Math.exp(x - m))
  const s = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / s)
}

type Phase = 'idle' | 'dots' | 'scale' | 'softmax' | 'mix' | 'done'

export function AttentionStepVisual() {
  const [queryIdx, setQueryIdx] = useState(1) // "cat"
  const [phase, setPhase] = useState<Phase>('idle')
  const [playing, setPlaying] = useState(false)

  const rawScores = useMemo(() => K.map((k) => dot(Q[queryIdx], k)), [queryIdx])
  const scaled = useMemo(() => rawScores.map((s) => s / Math.sqrt(D)), [rawScores])
  const weights = useMemo(() => softmax(scaled), [scaled])
  const output = useMemo(() => {
    const o = new Array(D).fill(0)
    for (let t = 0; t < TOKENS.length; t++)
      for (let d = 0; d < D; d++) o[d] += weights[t] * V[t][d]
    return o
  }, [weights])

  const order: Phase[] = ['idle', 'dots', 'scale', 'softmax', 'mix', 'done']
  function next() {
    const i = order.indexOf(phase)
    if (i < order.length - 1) setPhase(order[i + 1])
    else setPlaying(false)
  }
  function reset() {
    setPhase('idle')
    setPlaying(false)
  }
  function changeQuery(i: number) {
    setQueryIdx(i)
    reset()
  }

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(next, 900)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, phase])

  const showDots = phase !== 'idle'
  const showScale = phase === 'scale' || phase === 'softmax' || phase === 'mix' || phase === 'done'
  const showWeights = phase === 'softmax' || phase === 'mix' || phase === 'done'
  const showMix = phase === 'mix' || phase === 'done'

  return (
    <Card className="p-5 border-2 bg-gradient-to-br from-background via-violet/5 to-pink/5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Eye size={18} weight="fill" className="text-violet" />
            Self-Attention — what every transformer does
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            For the highlighted <b>query</b> token, see how it scores every other token, turns those
            into probabilities, and mixes their <b>values</b> into a new representation.
          </p>
        </div>
      </div>

      {/* tokens — click to change query */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
        {TOKENS.map((t, i) => (
          <button
            key={i}
            onClick={() => changeQuery(i)}
            className={cn(
              'px-3 py-1.5 rounded-lg border-2 text-sm font-mono transition',
              queryIdx === i
                ? 'bg-violet/20 border-violet text-violet font-bold'
                : 'bg-card border-border hover:border-violet/40',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* main table: rows = target tokens, columns = score • scaled • weight • contribution */}
      <div className="rounded-lg border-2 bg-card overflow-x-auto">
        <table className="w-full text-[11px] md:text-xs font-mono">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-1.5 text-left">key token</th>
              <th className="px-2 py-1.5 text-right">Q·K</th>
              <th className="px-2 py-1.5 text-right">÷√d</th>
              <th className="px-2 py-1.5 text-left">weight</th>
              <th className="px-2 py-1.5 text-right">w·V₀</th>
            </tr>
          </thead>
          <tbody>
            {TOKENS.map((tok, t) => {
              const w = weights[t]
              const barPct = Math.max(4, w * 100)
              return (
                <motion.tr
                  key={t}
                  animate={{
                    backgroundColor:
                      showMix && w > 0.15
                        ? 'oklch(0.70 0.28 340 / 0.08)'
                        : 'rgba(0,0,0,0)',
                  }}
                  className="border-t border-border/40"
                >
                  <td className="px-2 py-1.5">{tok}</td>
                  <td className="px-2 py-1.5 text-right">
                    <AnimatePresence>
                      {showDots && (
                        <motion.span
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="inline-block px-1.5 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/30"
                        >
                          {rawScores[t].toFixed(2)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <AnimatePresence>
                      {showScale && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-block px-1.5 py-0.5 rounded bg-lime/15 text-lime border border-lime/30"
                        >
                          {scaled[t].toFixed(2)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </td>
                  <td className="px-2 py-1.5">
                    <AnimatePresence>
                      {showWeights && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barPct}%` }}
                          transition={{ duration: 0.5 }}
                          className="rounded bg-gradient-to-r from-pink to-violet text-white text-[10px] px-1.5 py-0.5 whitespace-nowrap"
                          style={{ minWidth: 34 }}
                        >
                          {(w * 100).toFixed(0)}%
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <AnimatePresence>
                      {showMix && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-muted-foreground"
                        >
                          {(w * V[t][0]).toFixed(3)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* output vector */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-lg bg-muted/40 border p-3 font-mono text-xs"
          >
            <span className="text-muted-foreground">output[{TOKENS[queryIdx]}] = Σ w·V = </span>
            <span className="px-2 py-0.5 rounded bg-violet/15 text-violet border border-violet/30 font-bold">
              [{output.map((v) => v.toFixed(2)).join(', ')}]
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* phase label + controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="text-xs text-muted-foreground">
          step:{' '}
          <span className="font-mono text-foreground capitalize">
            {phase === 'idle' ? 'start — press Play' : phase}
          </span>
        </div>
        <div className="flex-1" />
        <Button
          size="sm"
          variant={playing ? 'secondary' : 'default'}
          onClick={() => setPlaying((p) => !p)}
          disabled={phase === 'done'}
          className="gap-1"
        >
          {playing ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
          {playing ? 'Pause' : phase === 'done' ? 'Done' : 'Play'}
        </Button>
        <Button size="sm" variant="outline" onClick={next} disabled={phase === 'done' || playing} className="gap-1">
          <SkipForward size={14} weight="fill" /> Step
        </Button>
        <Button size="sm" variant="ghost" onClick={reset} className="gap-1">
          <ArrowClockwise size={14} /> Reset
        </Button>
      </div>

      <div className="text-[11px] text-center text-muted-foreground mt-2">
        Click any token to make it the query. &quot;cat&quot; should pay most attention to
        &quot;sat&quot; and &quot;mat&quot; — that&apos;s the model learning context.
      </div>
    </Card>
  )
}

export default AttentionStepVisual
