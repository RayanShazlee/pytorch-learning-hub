/**
 * GradientDescentStepVisual
 * ─────────────────────────
 * The single best way to internalise `optimizer.step()` is to WATCH a ball
 * roll down a loss curve while the update formula writes itself out.
 *
 * We plot a 1-D loss L(w) = (w - target)² + 0.3·sin(3w)·noise so there's a
 * local minimum AND a global one — the learner can see that:
 *   • A high learning rate can bounce out of a local min (or diverge).
 *   • A low learning rate converges but is slow.
 *   • The gradient arrow always points UPhill; we subtract it.
 *
 * Controls:
 *   • Learning-rate slider 0.01 … 0.8
 *   • Reset starting point (random click anywhere on the curve also works)
 *   • Step / Play / Reset
 *
 * At every step we render the actual formula with live numbers:
 *   w ← w − lr · dL/dw   =   0.62 − 0.10 · 1.44   =   0.476
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, ArrowClockwise, SkipForward, TrendDown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Loss landscape — two minima so the LR matters.
function loss(w: number): number {
  // a parabola + a sinusoidal ripple to create a local min near w ≈ -1.2
  return 0.5 * (w - 1.3) ** 2 + 0.6 * Math.cos(1.8 * w)
}
function grad(w: number): number {
  return (w - 1.3) - 0.6 * 1.8 * Math.sin(1.8 * w)
}

const W_MIN = -3
const W_MAX = 3.5
const WIDTH = 520
const HEIGHT = 220
const PAD = 18

export function GradientDescentStepVisual() {
  const [lr, setLr] = useState(0.1)
  const [w, setW] = useState(-2.3)
  const [playing, setPlaying] = useState(false)
  const [history, setHistory] = useState<number[]>([-2.3])
  const [step, setStep] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)

  // plot sampling
  const samples = useMemo(() => {
    const pts: Array<[number, number]> = []
    const N = 140
    for (let i = 0; i <= N; i++) {
      const x = W_MIN + (W_MAX - W_MIN) * (i / N)
      pts.push([x, loss(x)])
    }
    return pts
  }, [])

  const lossRange = useMemo(() => {
    const ys = samples.map(([, y]) => y)
    return { min: Math.min(...ys) - 0.2, max: Math.max(...ys) + 0.2 }
  }, [samples])

  function toScreen(x: number, y: number): [number, number] {
    const sx = PAD + ((x - W_MIN) / (W_MAX - W_MIN)) * (WIDTH - 2 * PAD)
    const sy =
      HEIGHT - PAD - ((y - lossRange.min) / (lossRange.max - lossRange.min)) * (HEIGHT - 2 * PAD)
    return [sx, sy]
  }

  const g = grad(w)
  const wNext = w - lr * g

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => stepOnce(), 420)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, w, lr])

  function stepOnce() {
    const next = w - lr * grad(w)
    const clamped = Math.max(W_MIN + 0.01, Math.min(W_MAX - 0.01, next))
    setW(clamped)
    setHistory((h) => [...h, clamped])
    setStep((s) => s + 1)
    // stop if essentially converged
    if (Math.abs(clamped - w) < 1e-4) setPlaying(false)
  }

  function reset(startW?: number) {
    const s = startW ?? -2.3
    setW(s)
    setHistory([s])
    setStep(0)
    setPlaying(false)
  }

  function onClickCurve(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const sx = ((e.clientX - rect.left) / rect.width) * WIDTH
    const x = W_MIN + ((sx - PAD) / (WIDTH - 2 * PAD)) * (W_MAX - W_MIN)
    reset(Math.max(W_MIN + 0.2, Math.min(W_MAX - 0.2, x)))
  }

  // build SVG path for the loss curve
  const curvePath = samples
    .map(([x, y], i) => {
      const [sx, sy] = toScreen(x, y)
      return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`
    })
    .join(' ')

  const [ballX, ballY] = toScreen(w, loss(w))
  const gradArrowEnd = toScreen(w + 0.35 * Math.sign(g), loss(w))
  const nextDot = toScreen(wNext, loss(wNext))

  return (
    <Card className="p-5 border-2 bg-gradient-to-br from-background via-pink/5 to-violet/5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <TrendDown size={18} weight="fill" className="text-pink" />
            Gradient Descent — roll the ball downhill
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Click anywhere on the curve to drop the ball there. Push Play and watch the update
            rule <code className="bg-muted px-1 rounded">w ← w − lr · ∂L/∂w</code> run.
          </p>
        </div>
      </div>

      {/* loss landscape */}
      <div className="rounded-lg border-2 bg-card overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full cursor-crosshair"
          onClick={onClickCurve}
        >
          {/* subtle grid */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = PAD + (i / 4) * (HEIGHT - 2 * PAD)
            return (
              <line key={i} x1={PAD} y1={y} x2={WIDTH - PAD} y2={y} stroke="currentColor" strokeOpacity={0.08} />
            )
          })}

          {/* trace of visited points */}
          <polyline
            fill="none"
            stroke="oklch(0.70 0.28 340 / 0.6)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            points={history
              .map((wi) => {
                const [x, y] = toScreen(wi, loss(wi))
                return `${x.toFixed(1)},${y.toFixed(1)}`
              })
              .join(' ')}
          />

          {/* loss curve */}
          <path
            d={curvePath}
            fill="none"
            stroke="oklch(0.62 0.24 300)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* gradient arrow at current ball */}
          <defs>
            <marker
              id="grad-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.78 0.20 130)" />
            </marker>
          </defs>
          <line
            x1={ballX}
            y1={ballY}
            x2={gradArrowEnd[0]}
            y2={gradArrowEnd[1]}
            stroke="oklch(0.78 0.20 130)"
            strokeWidth={2.5}
            markerEnd="url(#grad-arrow)"
          />

          {/* ghost of next position */}
          <circle cx={nextDot[0]} cy={nextDot[1]} r={4} fill="oklch(0.72 0.18 200 / 0.5)" />

          {/* ball */}
          <motion.circle
            cx={ballX}
            cy={ballY}
            r={8}
            fill="oklch(0.70 0.28 340)"
            stroke="white"
            strokeWidth={2}
            animate={{ cx: ballX, cy: ballY }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          />
        </svg>
      </div>

      {/* live formula */}
      <div className="mt-3 rounded-lg bg-muted/40 border p-3 font-mono text-xs md:text-sm overflow-x-auto">
        <div className="text-muted-foreground mb-1">Step {step}:</div>
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-foreground">w ←</span>
          <span className="px-1.5 py-0.5 rounded bg-violet/15 text-violet border border-violet/30">
            {w.toFixed(3)}
          </span>
          <span>−</span>
          <span className="px-1.5 py-0.5 rounded bg-pink/15 text-pink border border-pink/30">
            {lr.toFixed(2)}
          </span>
          <span>·</span>
          <span className="px-1.5 py-0.5 rounded bg-lime/15 text-lime border border-lime/30">
            {g.toFixed(3)}
          </span>
          <span className="text-muted-foreground">=</span>
          <span className="px-2 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/30 font-bold">
            {wNext.toFixed(3)}
          </span>
          <span className="ml-3 text-muted-foreground">
            loss={loss(w).toFixed(3)}
          </span>
        </div>
      </div>

      {/* controls */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <label className="text-muted-foreground">learning rate</label>
          <input
            type="range"
            min={0.01}
            max={0.8}
            step={0.01}
            value={lr}
            onChange={(e) => setLr(parseFloat(e.target.value))}
            className="accent-pink w-40"
          />
          <span className="font-mono w-10 text-right">{lr.toFixed(2)}</span>
          <LrTag lr={lr} />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={playing ? 'secondary' : 'default'}
            onClick={() => setPlaying((p) => !p)}
            className="gap-1"
          >
            {playing ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
            {playing ? 'Pause' : 'Play'}
          </Button>
          <Button size="sm" variant="outline" onClick={stepOnce} disabled={playing} className="gap-1">
            <SkipForward size={14} weight="fill" /> Step
          </Button>
          <Button size="sm" variant="ghost" onClick={() => reset()} className="gap-1">
            <ArrowClockwise size={14} /> Reset
          </Button>
        </div>
      </div>

      <div className="text-[11px] text-center text-muted-foreground mt-2">
        Try <span className="font-mono">lr = 0.80</span> from <span className="font-mono">w = -2</span> — the
        ball overshoots and can get stuck. That&apos;s why we tune it.
      </div>
    </Card>
  )
}

function LrTag({ lr }: { lr: number }) {
  const label = lr < 0.06 ? 'very small' : lr < 0.15 ? 'healthy' : lr < 0.4 ? 'bold' : 'risky'
  const cls =
    lr < 0.06
      ? 'bg-muted text-muted-foreground'
      : lr < 0.15
        ? 'bg-lime/20 text-lime border-lime/40'
        : lr < 0.4
          ? 'bg-cyan/20 text-cyan border-cyan/40'
          : 'bg-pink/20 text-pink border-pink/40'
  return <span className={cn('ml-1 px-1.5 py-0.5 rounded border text-[10px] uppercase tracking-wide', cls)}>{label}</span>
}

export default GradientDescentStepVisual
