/**
 * DiffusionStepVisual
 * ───────────────────
 * Diffusion models (DDPM / Stable Diffusion) work in two directions:
 *
 *   FORWARD  (training):  image → progressively add Gaussian noise over T steps
 *   REVERSE  (sampling):  pure noise → model predicts & removes the noise step
 *                         by step to reconstruct an image
 *
 * We show a tiny 12×12 pixel canvas with a colourful smiley so the learner can
 * SEE the signal degrade and then reassemble. A schedule strip along the
 * bottom shows β_t — a noise-level vs step chart — with a marker that follows
 * the current step. Toggle Forward / Reverse, scrub the step, or press Play.
 */

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Pause,
  ArrowClockwise,
  ArrowsLeftRight,
  CloudArrowDown,
  CloudArrowUp,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const SIZE = 12
const T_STEPS = 20

// Base "image" — encode colour IDs for a pastel smiley on sky background.
// 0 = sky, 1 = sun, 2 = cheek, 3 = eye, 4 = mouth
const BASE: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
function drawCircle(cx: number, cy: number, r: number, v: number) {
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) BASE[y][x] = v
}
drawCircle(6, 6, 5, 1) // face
// eyes
BASE[5][4] = 3
BASE[5][8] = 3
// cheeks
BASE[7][3] = 2
BASE[7][9] = 2
// mouth
for (let x = 4; x <= 8; x++) BASE[8][x] = 4

// Base colours for the clean image (OKLCH).
const PALETTE = [
  'oklch(0.78 0.08 230)', // 0 sky
  'oklch(0.82 0.18 85)', // 1 sun (yellow)
  'oklch(0.78 0.18 30)', // 2 cheek
  'oklch(0.30 0.05 260)', // 3 eye
  'oklch(0.60 0.18 20)', // 4 mouth
]

// Base RGB-ish numeric signal per class for noise math (just luminance).
const CLASS_VAL = [0.6, 0.9, 0.7, 0.2, 0.45]

// Seeded noise so scrubbing the step reproduces the same pattern.
function noiseField(seed: number): number[][] {
  const out: number[][] = []
  let s = seed
  for (let y = 0; y < SIZE; y++) {
    const row: number[] = []
    for (let x = 0; x < SIZE; x++) {
      s = (s * 9301 + 49297) % 233280
      row.push((s / 233280) * 2 - 1) // [-1, 1]
    }
    out.push(row)
  }
  return out
}

// Linear β schedule
const betas = Array.from({ length: T_STEPS }, (_, t) => 0.0001 + (0.02 - 0.0001) * (t / (T_STEPS - 1)))
// α_t and cumulative ᾱ_t (standard DDPM convention)
const alphas = betas.map((b) => 1 - b)
const alphaBars: number[] = []
let running = 1
for (const a of alphas) {
  running *= a
  alphaBars.push(running)
}

export function DiffusionStepVisual() {
  const [direction, setDirection] = useState<'forward' | 'reverse'>('forward')
  const [t, setT] = useState(0) // 0 = clean, T_STEPS = pure noise (in forward sense)
  const [playing, setPlaying] = useState(false)

  const noise = useMemo(() => noiseField(42), [])

  // Progress 0..1 used by both directions (0 = clean, 1 = pure noise).
  const progress = useMemo(() => {
    const step = direction === 'forward' ? t : T_STEPS - t
    const aBar = alphaBars[Math.min(T_STEPS - 1, Math.max(0, step - 1))]
    if (step <= 0) return 0
    if (step >= T_STEPS) return 1
    return 1 - Math.sqrt(aBar)
  }, [t, direction])

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => {
      setT((v) => {
        if (v < T_STEPS) return v + 1
        setPlaying(false)
        return v
      })
    }, 180)
    return () => window.clearTimeout(id)
  }, [playing, t])

  function reset() {
    setT(0)
    setPlaying(false)
  }
  function flip() {
    setDirection((d) => (d === 'forward' ? 'reverse' : 'forward'))
    setT(0)
    setPlaying(false)
  }

  const done = t >= T_STEPS

  return (
    <Card className="p-5 border-2 bg-gradient-to-br from-background via-pink/5 to-violet/5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            {direction === 'forward' ? (
              <CloudArrowUp size={18} weight="fill" className="text-pink" />
            ) : (
              <CloudArrowDown size={18} weight="fill" className="text-violet" />
            )}
            Diffusion — {direction === 'forward' ? 'add noise' : 'denoise'} step by step
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {direction === 'forward'
              ? 'Training: take a real image and corrupt it with Gaussian noise over T steps.'
              : 'Sampling: start from pure noise and let the model predict & remove noise, step by step.'}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={flip} className="gap-1">
          <ArrowsLeftRight size={14} /> Flip direction
        </Button>
      </div>

      {/* image canvas */}
      <div className="flex justify-center mb-4">
        <div
          className="grid gap-[1px] p-2 rounded-lg border-2 bg-card"
          style={{ gridTemplateColumns: `repeat(${SIZE}, 1.4rem)` }}
        >
          {BASE.flatMap((row, y) =>
            row.map((cls, x) => {
              const base = CLASS_VAL[cls]
              const n = noise[y][x]
              const mixed = base * (1 - progress) + (n * 0.5 + 0.5) * progress
              // Colour interpolates from palette → grey noise.
              return (
                <motion.div
                  key={`${y}-${x}`}
                  className="w-[1.4rem] h-[1.4rem] rounded-[2px]"
                  animate={{
                    backgroundColor: progress < 0.05
                      ? PALETTE[cls]
                      : progress > 0.95
                        ? `oklch(${(n * 0.3 + 0.7).toFixed(2)} 0 0)`
                        : `oklch(${(mixed * 0.9 + 0.1).toFixed(2)} ${(0.15 * (1 - progress)).toFixed(2)} ${cls === 1 ? 85 : cls === 4 ? 20 : 230})`,
                  }}
                  transition={{ duration: 0.18 }}
                />
              )
            }),
          )}
        </div>
      </div>

      {/* schedule strip */}
      <div className="rounded-lg border bg-muted/20 p-2 mb-3">
        <div className="text-[10px] text-muted-foreground mb-1 px-1">β schedule (noise level per step)</div>
        <div className="flex items-end gap-[1px] h-10">
          {betas.map((b, i) => {
            const pct = b / 0.02
            const active = direction === 'forward' ? i < t : i >= T_STEPS - t
            return (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-sm transition-colors',
                  active
                    ? direction === 'forward'
                      ? 'bg-gradient-to-t from-pink/80 to-pink/30'
                      : 'bg-gradient-to-t from-violet/80 to-violet/30'
                    : 'bg-muted/60',
                )}
                style={{ height: `${15 + pct * 85}%` }}
                title={`t=${i}  β=${b.toFixed(4)}`}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
          <span>t=0 (clean)</span>
          <span>t={T_STEPS} (pure noise)</span>
        </div>
      </div>

      {/* controls */}
      <div className="flex items-center gap-2">
        <div className="text-xs font-mono text-muted-foreground">
          step {t}/{T_STEPS}
        </div>
        <input
          type="range"
          min={0}
          max={T_STEPS}
          value={t}
          onChange={(e) => setT(parseInt(e.target.value))}
          className="accent-pink flex-1"
        />
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
        <Button size="sm" variant="ghost" onClick={reset} className="gap-1">
          <ArrowClockwise size={14} /> Reset
        </Button>
      </div>

      <div className="text-[11px] text-center text-muted-foreground mt-3">
        Train the reverse: for any noisy image, predict the noise that was added. At sampling, start
        from random noise and iteratively remove the predicted noise — Stable Diffusion, in one
        sentence.
      </div>
    </Card>
  )
}

export default DiffusionStepVisual
