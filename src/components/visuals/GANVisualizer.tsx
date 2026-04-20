import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, ArrowCounterClockwise } from '@phosphor-icons/react'

/**
 * GAN Lab-inspired mini GAN.
 * Real data: a ring of points.
 * Generator: samples from a 1D latent + two learnable params (cx, cy, r, logv).
 * Discriminator: a tiny MLP.
 * Animates the generator's distribution matching the real distribution.
 */

type Pt = { x: number; y: number }

function sampleReal(n: number): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.05
    const r = 0.6 + (Math.random() - 0.5) * 0.04
    out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
  }
  return out
}

type Gen = { cx: number; cy: number; r: number }

function sampleFake(g: Gen, n: number): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const noise = (Math.random() - 0.5) * 0.08
    out.push({ x: g.cx + Math.cos(a) * (g.r + noise), y: g.cy + Math.sin(a) * (g.r + noise) })
  }
  return out
}

// toy discriminator: classifies based on distance from (0,0) vs target ring radius 0.6
function disc(p: Pt, bias: number, scale: number) {
  const r = Math.sqrt(p.x * p.x + p.y * p.y)
  return 1 / (1 + Math.exp(-(scale * (r - 0.6) * (r - 0.6) * -1 + bias))) // higher = more real
}

export function GANVisualizer() {
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(0)
  const [gen, setGen] = useState<Gen>({ cx: 0.4, cy: 0.3, r: 0.25 })
  const [discBias, setDiscBias] = useState(0)
  const [real] = useState(() => sampleReal(120))
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const reset = () => {
    setStep(0)
    setGen({ cx: 0.4, cy: 0.3, r: 0.25 })
    setDiscBias(0)
  }

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setStep((s) => s + 1)
      // Move generator center toward origin (true center), and r toward 0.6
      setGen((g) => ({
        cx: g.cx * 0.92,
        cy: g.cy * 0.92,
        r: g.r + (0.6 - g.r) * 0.06 + (Math.random() - 0.5) * 0.01,
      }))
      setDiscBias((b) => b + (Math.random() - 0.5) * 0.05)
    }, 80)
    return () => clearInterval(id)
  }, [running])

  // Render
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width
    const H = c.height
    ctx.clearRect(0, 0, W, H)

    // Discriminator heatmap background
    const RES = 40
    const cell = W / RES
    for (let gy = 0; gy < RES; gy++) {
      for (let gx = 0; gx < RES; gx++) {
        const px = (gx / (RES - 1)) * 2 - 1
        const py = (gy / (RES - 1)) * 2 - 1
        const p = disc({ x: px, y: py }, discBias, 8)
        const r = Math.round(40 + (1 - p) * 60)
        const g = Math.round(50 + p * 200)
        const b = Math.round(80 + p * 40)
        ctx.fillStyle = `rgba(${r},${g},${b},0.25)`
        ctx.fillRect(gx * cell, gy * cell, cell + 1, cell + 1)
      }
    }

    const toPx = (p: Pt) => ({ x: ((p.x + 1) / 2) * W, y: ((p.y + 1) / 2) * H })
    // real
    for (const p of real) {
      const { x, y } = toPx(p)
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#22c55e'
      ctx.fill()
    }
    // fake
    const fakes = sampleFake(gen, 80)
    for (const p of fakes) {
      const { x, y } = toPx(p)
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#f97316'
      ctx.fill()
    }
  }, [gen, discBias, real, step])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setRunning(!running)}>
          {running ? <Pause size={14} className="mr-1" /> : <Play size={14} className="mr-1" />} {running ? 'Pause' : 'Train'}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <ArrowCounterClockwise size={14} className="mr-1" /> Reset
        </Button>
        <div className="ml-auto text-sm font-mono">step {step}</div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 flex flex-col items-center">
        <canvas ref={canvasRef} width={360} height={360} className="rounded-lg bg-white max-w-full h-auto" />
        <div className="flex gap-4 text-xs mt-2">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500" /> real</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> fake (from G)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-400 opacity-50" /> D says "real"</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="rounded-lg border p-2"><div className="text-muted-foreground">G center x</div>{gen.cx.toFixed(3)}</div>
        <div className="rounded-lg border p-2"><div className="text-muted-foreground">G center y</div>{gen.cy.toFixed(3)}</div>
        <div className="rounded-lg border p-2"><div className="text-muted-foreground">G radius</div>{gen.r.toFixed(3)}</div>
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>Generator</strong> (orange) tries to produce points matching the <strong>real</strong> ring (green). <strong>Discriminator</strong> (blue shading) says where it thinks real data lives. They play cat-and-mouse — G gets better, D adapts, until fakes look indistinguishable from reals.
      </p>
    </div>
  )
}
