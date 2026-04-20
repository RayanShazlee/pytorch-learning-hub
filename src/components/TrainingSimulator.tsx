import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, ArrowCounterClockwise, Trophy } from '@phosphor-icons/react'

/**
 * Real gradient descent on a 1D line-fit problem.
 * Shows: points, current line, loss curve, gradient arrow, live w & b.
 */

type DataPoint = { x: number; y: number }

function makeData(): DataPoint[] {
  const trueW = 1.4
  const trueB = -0.3
  const pts: DataPoint[] = []
  for (let i = 0; i < 20; i++) {
    const x = -1 + (i / 19) * 2
    const noise = (Math.random() - 0.5) * 0.4
    pts.push({ x, y: trueW * x + trueB + noise })
  }
  return pts
}

export function TrainingSimulator() {
  const [data] = useState<DataPoint[]>(() => makeData())
  const [w, setW] = useState(-1.0)
  const [b, setB] = useState(0.8)
  const [lr, setLr] = useState(0.08)
  const [running, setRunning] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [lossHist, setLossHist] = useState<number[]>([])
  const [celebrated, setCelebrated] = useState(false)
  const rafRef = useRef<number | null>(null)

  const loss = useMemo(() => {
    let s = 0
    for (const p of data) {
      const pred = w * p.x + b
      s += (pred - p.y) ** 2
    }
    return s / data.length
  }, [data, w, b])

  const reset = useCallback(() => {
    setW(-1.0)
    setB(0.8)
    setEpoch(0)
    setLossHist([])
    setCelebrated(false)
  }, [])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      // compute grads
      let gW = 0
      let gB = 0
      for (const p of data) {
        const pred = w * p.x + b
        const err = pred - p.y
        gW += 2 * err * p.x
        gB += 2 * err
      }
      gW /= data.length
      gB /= data.length
      const nW = w - lr * gW
      const nB = b - lr * gB
      setW(nW)
      setB(nB)
      setEpoch((e) => e + 1)
      setLossHist((h) => {
        const n = [...h, loss]
        return n.length > 120 ? n.slice(-120) : n
      })
      if (loss < 0.02 && !celebrated) {
        setCelebrated(true)
        setRunning(false)
      }
    }, 60)
    return () => clearInterval(id)
  }, [running, w, b, lr, data, loss, celebrated])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  // plot geometry
  const W = 320
  const H = 240
  const xToPx = (x: number) => ((x + 1.2) / 2.4) * W
  const yToPx = (y: number) => H - ((y + 2) / 4) * H

  // line endpoints
  const line = { x1: -1.1, x2: 1.1 }

  // loss landscape (simplified: just show path of (w,b) in 2D)

  // loss curve path
  const maxL = Math.max(...lossHist, loss, 0.01)
  const lossPath = lossHist
    .map((v, i) => {
      const x = (i / Math.max(1, lossHist.length - 1)) * 200
      const y = 60 - (v / maxL) * 58
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  // Sample (w,b) landscape for contours (coarse)
  const contourCells = useMemo(() => {
    const cells: { i: number; j: number; l: number }[] = []
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const wv = -2 + (i / 19) * 4
        const bv = -2 + (j / 19) * 4
        let s = 0
        for (const p of data) {
          const pr = wv * p.x + bv
          s += (pr - p.y) ** 2
        }
        s /= data.length
        cells.push({ i, j, l: s })
      }
    }
    return cells
  }, [data])

  const maxContour = Math.max(...contourCells.map((c) => c.l))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setRunning(!running)}>
          {running ? <Pause size={14} className="mr-1" /> : <Play size={14} className="mr-1" />}
          {running ? 'Pause' : 'Train'}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <ArrowCounterClockwise size={14} className="mr-1" /> Reset
        </Button>
        {celebrated && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-sm font-bold text-emerald-600">
            <Trophy size={16} /> Converged!
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Data + fitted line */}
        <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-3">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Data & fitted line</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* axes */}
            <line x1={0} y1={yToPx(0)} x2={W} y2={yToPx(0)} stroke="currentColor" strokeOpacity={0.2} />
            <line x1={xToPx(0)} y1={0} x2={xToPx(0)} y2={H} stroke="currentColor" strokeOpacity={0.2} />
            {/* data points */}
            {data.map((p, i) => (
              <circle key={i} cx={xToPx(p.x)} cy={yToPx(p.y)} r={4} fill="#2563eb" opacity={0.75} />
            ))}
            {/* residual lines */}
            {data.map((p, i) => {
              const pred = w * p.x + b
              return (
                <line
                  key={`r${i}`}
                  x1={xToPx(p.x)}
                  y1={yToPx(p.y)}
                  x2={xToPx(p.x)}
                  y2={yToPx(pred)}
                  stroke="#f97316"
                  strokeOpacity={0.4}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
              )
            })}
            {/* fitted line */}
            <motion.line
              x1={xToPx(line.x1)}
              y1={yToPx(w * line.x1 + b)}
              x2={xToPx(line.x2)}
              y2={yToPx(w * line.x2 + b)}
              stroke="#a855f7"
              strokeWidth={3}
            />
          </svg>
        </div>

        {/* Loss landscape (w,b) with trajectory */}
        <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-3">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Loss landscape (w, b)</div>
          <svg viewBox="0 0 200 200" className="w-full h-auto">
            {contourCells.map((c) => {
              const ratio = c.l / maxContour
              const r = Math.round(30 + ratio * 180)
              const g = Math.round(80 + (1 - ratio) * 80)
              const bl = Math.round(200 - ratio * 150)
              return (
                <rect key={`${c.i}-${c.j}`} x={c.i * 10} y={200 - (c.j + 1) * 10} width={10} height={10} fill={`rgb(${r},${g},${bl})`} opacity={0.7} />
              )
            })}
            {/* current (w,b) */}
            <circle cx={((w + 2) / 4) * 200} cy={200 - ((b + 2) / 4) * 200} r={6} fill="#fbbf24" stroke="white" strokeWidth={2} />
            <text x={4} y={12} fontSize="9" fill="white" opacity={0.9}>w →</text>
            <text x={4} y={196} fontSize="9" fill="white" opacity={0.9}>↑ b</text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border p-3 text-center">
          <div className="text-xs text-muted-foreground">epoch</div>
          <div className="font-mono text-lg font-bold">{epoch}</div>
        </div>
        <div className="rounded-xl border p-3 text-center">
          <div className="text-xs text-muted-foreground">loss (MSE)</div>
          <div className="font-mono text-lg font-bold text-violet-500">{loss.toFixed(4)}</div>
        </div>
        <div className="rounded-xl border p-3 text-center">
          <div className="text-xs text-muted-foreground">weight w</div>
          <div className="font-mono text-lg font-bold">{w.toFixed(3)}</div>
        </div>
        <div className="rounded-xl border p-3 text-center">
          <div className="text-xs text-muted-foreground">bias b</div>
          <div className="font-mono text-lg font-bold">{b.toFixed(3)}</div>
        </div>
      </div>

      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground mb-1">Learning rate: <span className="font-mono">{lr.toFixed(3)}</span></div>
        <Slider min={0.001} max={0.4} step={0.001} value={[lr]} onValueChange={(v) => setLr(v[0])} />
        <div className="mt-3 text-xs text-muted-foreground">loss curve</div>
        <svg viewBox="0 0 200 64" className="w-full h-12">
          <path d={lossPath} fill="none" stroke="#a855f7" strokeWidth={1.5} />
        </svg>
      </div>

      <p className="text-xs text-muted-foreground">
        The model learns <code>y = w·x + b</code> from noisy points. Orange dashes = residuals (prediction errors).
        The loss landscape on the right is the bird's-eye view; the yellow dot rolls downhill toward the minimum using real gradients.
      </p>
    </div>
  )
}
