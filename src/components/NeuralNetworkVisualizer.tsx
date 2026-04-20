import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, ArrowCounterClockwise, Lightbulb } from '@phosphor-icons/react'

/**
 * TF-Playground-style interactive neural network.
 * Real forward/backprop on a small MLP, classifying 2D points.
 * - Switch between datasets (circle, xor, spiral, moons)
 * - Adjust hidden layer sizes (layer 2 may be turned off)
 * - Adjust learning rate
 * - See live decision boundary, weights (line thickness/color), node activations, and loss curve.
 */

type Dataset = 'circle' | 'xor' | 'spiral' | 'moons'

const TANH = {
  f: (x: number) => Math.tanh(x),
  df: (x: number) => 1 - Math.tanh(x) ** 2,
}

function makeDataset(kind: Dataset, n = 180): { x: number; y: number; label: number }[] {
  const pts: { x: number; y: number; label: number }[] = []
  const rand = (a: number, b: number) => a + Math.random() * (b - a)
  if (kind === 'circle') {
    // Two concentric rings — a visually unambiguous "circle" problem
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const inner = i < n / 2
      const r = inner ? rand(0.15, 0.35) : rand(0.65, 0.9)
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, label: inner ? 1 : 0 })
    }
  } else if (kind === 'xor') {
    for (let i = 0; i < n; i++) {
      const x = rand(-0.9, 0.9)
      const y = rand(-0.9, 0.9)
      if (Math.abs(x) < 0.08 || Math.abs(y) < 0.08) continue
      const label = x * y >= 0 ? 1 : 0
      pts.push({ x, y, label })
    }
  } else if (kind === 'spiral') {
    for (let i = 0; i < n / 2; i++) {
      const t = (i / (n / 2)) * 4
      const r = t * 0.22
      const a = t * 2.2
      pts.push({ x: r * Math.cos(a) + rand(-0.05, 0.05), y: r * Math.sin(a) + rand(-0.05, 0.05), label: 1 })
      pts.push({ x: -r * Math.cos(a) + rand(-0.05, 0.05), y: -r * Math.sin(a) + rand(-0.05, 0.05), label: 0 })
    }
  } else {
    for (let i = 0; i < n / 2; i++) {
      const a = rand(0, Math.PI)
      pts.push({ x: Math.cos(a) * 0.7 - 0.25, y: Math.sin(a) * 0.7 - 0.2 + rand(-0.08, 0.08), label: 1 })
      pts.push({ x: Math.cos(a + Math.PI) * 0.7 + 0.25, y: Math.sin(a + Math.PI) * 0.7 + 0.2 + rand(-0.08, 0.08), label: 0 })
    }
  }
  return pts
}

type Net = {
  W: number[][][]
  b: number[][]
  sizes: number[]
}

function initNet(sizes: number[]): Net {
  const W: number[][][] = []
  const b: number[][] = []
  for (let l = 0; l < sizes.length - 1; l++) {
    const nIn = sizes[l]
    const nOut = sizes[l + 1]
    const limit = Math.sqrt(6 / (nIn + nOut))
    W.push(
      Array.from({ length: nOut }, () =>
        Array.from({ length: nIn }, () => (Math.random() * 2 - 1) * limit)
      )
    )
    b.push(Array.from({ length: nOut }, () => 0))
  }
  return { W, b, sizes }
}

function forward(net: Net, x: number[]): { acts: number[][]; zs: number[][] } {
  const acts: number[][] = [x]
  const zs: number[][] = []
  let a = x
  const L = net.sizes.length - 1
  for (let l = 0; l < L; l++) {
    const z: number[] = []
    const out: number[] = []
    for (let i = 0; i < net.sizes[l + 1]; i++) {
      let s = net.b[l][i]
      for (let j = 0; j < net.sizes[l]; j++) s += net.W[l][i][j] * a[j]
      z.push(s)
      if (l === L - 1) out.push(1 / (1 + Math.exp(-s)))
      else out.push(TANH.f(s))
    }
    zs.push(z)
    acts.push(out)
    a = out
  }
  return { acts, zs }
}

function trainStep(net: Net, batch: { x: number; y: number; label: number }[], lr: number): number {
  const L = net.sizes.length - 1
  const gradW = net.W.map((M) => M.map((row) => row.map(() => 0)))
  const gradB = net.b.map((row) => row.map(() => 0))
  let lossSum = 0
  for (const p of batch) {
    const { acts, zs } = forward(net, [p.x, p.y])
    const yHat = acts[acts.length - 1][0]
    const y = p.label
    const eps = 1e-7
    lossSum += -(y * Math.log(yHat + eps) + (1 - y) * Math.log(1 - yHat + eps))

    let delta: number[] = [yHat - y]
    for (let l = L - 1; l >= 0; l--) {
      for (let i = 0; i < net.sizes[l + 1]; i++) {
        gradB[l][i] += delta[i]
        for (let j = 0; j < net.sizes[l]; j++) {
          gradW[l][i][j] += delta[i] * acts[l][j]
        }
      }
      if (l > 0) {
        const newDelta: number[] = Array(net.sizes[l]).fill(0)
        for (let j = 0; j < net.sizes[l]; j++) {
          let s = 0
          for (let i = 0; i < net.sizes[l + 1]; i++) s += net.W[l][i][j] * delta[i]
          newDelta[j] = s * TANH.df(zs[l - 1][j])
        }
        delta = newDelta
      }
    }
  }
  const n = batch.length
  for (let l = 0; l < L; l++) {
    for (let i = 0; i < net.sizes[l + 1]; i++) {
      net.b[l][i] -= (lr * gradB[l][i]) / n
      for (let j = 0; j < net.sizes[l]; j++) {
        net.W[l][i][j] -= (lr * gradW[l][i][j]) / n
      }
    }
  }
  return lossSum / n
}

// Mean |activation| across the dataset for each node — drives node brightness.
function sampleActivations(net: Net, data: { x: number; y: number }[]): number[][] {
  const sums: number[][] = net.sizes.map((n) => Array(n).fill(0))
  for (const p of data) {
    const { acts } = forward(net, [p.x, p.y])
    for (let l = 0; l < net.sizes.length; l++)
      for (let i = 0; i < net.sizes[l]; i++) sums[l][i] += Math.abs(acts[l][i])
  }
  return sums.map((row) => row.map((v) => v / data.length))
}

export function NeuralNetworkVisualizer() {
  const [dataset, setDataset] = useState<Dataset>('circle')
  const [h1, setH1] = useState(5)
  const [h2, setH2] = useState(4)
  const [lr, setLr] = useState(0.1)
  const [running, setRunning] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [loss, setLoss] = useState(0.7)
  const [lossHistory, setLossHistory] = useState<number[]>([])
  const data = useMemo(() => makeDataset(dataset), [dataset])

  // Filter zero-size layers so [2, 5, 0, 1] becomes [2, 5, 1].
  const sizes = useMemo(() => [2, ...[h1, h2].filter((n) => n > 0), 1], [h1, h2])

  const netRef = useRef<Net>(initNet(sizes))
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const reset = useCallback(() => {
    netRef.current = initNet(sizes)
    setEpoch(0)
    setLoss(0.7)
    setLossHistory([])
  }, [sizes])

  useEffect(() => {
    reset()
  }, [sizes, dataset, reset])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const l = trainStep(netRef.current, data, lr)
      setEpoch((e) => e + 1)
      setLoss(l)
      setLossHistory((h) => {
        const n = [...h, l]
        return n.length > 240 ? n.slice(-240) : n
      })
    }, 35)
    return () => clearInterval(id)
  }, [running, data, lr])

  // Draw decision boundary + points.
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width
    const H = c.height
    const RES = 80
    const cell = W / RES

    const img = ctx.createImageData(W, H)
    for (let gy = 0; gy < RES; gy++) {
      for (let gx = 0; gx < RES; gx++) {
        const px = (gx / (RES - 1)) * 2 - 1
        const py = (gy / (RES - 1)) * 2 - 1
        const { acts } = forward(netRef.current, [px, py])
        const v = acts[acts.length - 1][0]
        // Blue -> white -> orange lerp for a crisp boundary feel
        const r = Math.round(37 * (1 - v) + 249 * v)
        const g = Math.round(99 * (1 - v) + 115 * v)
        const b = Math.round(235 * (1 - v) + 22 * v)
        // Darker band right at the boundary
        const band = Math.abs(v - 0.5) < 0.02 ? 0.55 : 1
        const sr = Math.round(r * band)
        const sg = Math.round(g * band)
        const sb = Math.round(b * band)
        for (let sy = 0; sy < cell; sy++) {
          for (let sx = 0; sx < cell; sx++) {
            const ix = Math.floor(gx * cell + sx)
            const iy = Math.floor(gy * cell + sy)
            const idx = (iy * W + ix) * 4
            img.data[idx] = sr
            img.data[idx + 1] = sg
            img.data[idx + 2] = sb
            img.data[idx + 3] = 200
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0)

    // Axis lines
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W / 2, 0)
    ctx.lineTo(W / 2, H)
    ctx.moveTo(0, H / 2)
    ctx.lineTo(W, H / 2)
    ctx.stroke()

    // Data points
    for (const p of data) {
      const cx = ((p.x + 1) / 2) * W
      const cy = ((p.y + 1) / 2) * H
      ctx.beginPath()
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2)
      ctx.fillStyle = p.label === 1 ? '#f97316' : '#2563eb'
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'white'
      ctx.stroke()
    }
  }, [data, epoch])

  const net = netRef.current
  const nodeActs = useMemo(() => sampleActivations(net, data), [data, epoch, net])

  const SVG_W = 640
  const SVG_H = 300
  const layerXs = sizes.map((_, i) => 70 + i * ((SVG_W - 140) / Math.max(1, sizes.length - 1)))
  const nodeY = (layer: number, idx: number) => {
    const n = sizes[layer]
    return (SVG_H / (n + 1)) * (idx + 1)
  }

  const lossPath = (() => {
    if (lossHistory.length < 2) return ''
    const max = Math.max(...lossHistory, 0.7)
    const min = Math.min(...lossHistory, 0)
    return lossHistory
      .map((v, i) => {
        const x = (i / (lossHistory.length - 1)) * 200
        const y = 60 - ((v - min) / Math.max(0.01, max - min)) * 60
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  })()

  return (
    <div className="space-y-4">
      {/* Guide */}
      <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 flex gap-2 items-start">
        <Lightbulb size={18} className="text-violet-500 mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Try this:</strong> press <em>Train</em>, then switch datasets.
          A 2-5-4-1 network solves <em>circle</em> and <em>moons</em> easily. <em>XOR</em> needs hidden ≥ 2. <em>Spiral</em> is
          famously hard — try pushing both hidden layers to 8. Line thickness = weight magnitude; node size/brightness = mean activation strength.
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button size="sm" onClick={() => setRunning(!running)}>
          {running ? <Pause size={14} className="mr-1" /> : <Play size={14} className="mr-1" />}
          {running ? 'Pause' : 'Train'}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <ArrowCounterClockwise size={14} className="mr-1" /> Reset
        </Button>
        <div className="flex gap-1 ml-2">
          {(['circle', 'xor', 'spiral', 'moons'] as Dataset[]).map((d) => (
            <Button key={d} size="sm" variant={dataset === d ? 'default' : 'outline'} onClick={() => setDataset(d)}>
              {d}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Network architecture */}
        <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-3">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Network (live weights + activations)</div>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H + 20}`} className="w-full h-auto">
            {net.W.map((M, l) =>
              M.map((row, i) =>
                row.map((w, j) => {
                  const x1 = layerXs[l]
                  const x2 = layerXs[l + 1]
                  const y1 = nodeY(l, j)
                  const y2 = nodeY(l + 1, i)
                  const mag = Math.min(1, Math.abs(w) / 2)
                  const color = w >= 0 ? '#f97316' : '#2563eb'
                  return (
                    <line
                      key={`e${l}-${i}-${j}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={color}
                      strokeOpacity={0.15 + mag * 0.75}
                      strokeWidth={0.5 + mag * 3.5}
                    />
                  )
                })
              )
            )}
            {sizes.map((n, l) =>
              Array.from({ length: n }).map((_, i) => {
                const act = nodeActs[l]?.[i] ?? 0
                const intensity = Math.min(1, act)
                const fill = l === 0 ? '#2563eb' : l === sizes.length - 1 ? '#f97316' : '#a855f7'
                return (
                  <g key={`n${l}-${i}`}>
                    <circle
                      cx={layerXs[l]}
                      cy={nodeY(l, i)}
                      r={14}
                      fill="white"
                      stroke="#0f172a"
                      strokeOpacity={0.8}
                      strokeWidth={1.5}
                    />
                    <circle
                      cx={layerXs[l]}
                      cy={nodeY(l, i)}
                      r={4 + intensity * 8}
                      fill={fill}
                      fillOpacity={0.35 + intensity * 0.65}
                    />
                  </g>
                )
              })
            )}
            {sizes.map((n, l) => (
              <text
                key={`lbl${l}`}
                x={layerXs[l]}
                y={SVG_H + 14}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                opacity="0.6"
              >
                {l === 0 ? `input (${n})` : l === sizes.length - 1 ? `output (${n})` : `hidden (${n})`}
              </text>
            ))}
          </svg>
        </div>

        <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-3">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Decision boundary (live)</div>
          <canvas ref={canvasRef} width={320} height={320} className="w-full h-auto rounded-lg bg-white" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>🟦 class 0</span>
            <span>🟧 class 1</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border p-3">
          <div className="text-xs text-muted-foreground mb-1">
            Learning rate: <span className="font-mono">{lr.toFixed(3)}</span>
          </div>
          <Slider min={0.01} max={1} step={0.01} value={[lr]} onValueChange={(v) => setLr(v[0])} />
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-xs text-muted-foreground mb-1">
            Hidden layer 1: <span className="font-mono">{h1}</span>
          </div>
          <Slider min={1} max={8} step={1} value={[h1]} onValueChange={(v) => setH1(v[0])} />
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-xs text-muted-foreground mb-1">
            Hidden layer 2: <span className="font-mono">{h2 === 0 ? 'off' : h2}</span>
          </div>
          <Slider min={0} max={8} step={1} value={[h2]} onValueChange={(v) => setH2(v[0])} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border p-3 flex items-center gap-4">
          <div>
            <div className="text-xs text-muted-foreground">epoch</div>
            <div className="text-2xl font-mono font-bold">{epoch}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">loss</div>
            <div className="text-2xl font-mono font-bold text-violet-500">{loss.toFixed(4)}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-muted-foreground">arch</div>
            <div className="text-sm font-mono font-semibold">{sizes.join('→')}</div>
          </div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-xs text-muted-foreground mb-1">loss curve</div>
          <svg viewBox="0 0 200 64" className="w-full h-12">
            <path d={lossPath} fill="none" stroke="#a855f7" strokeWidth={1.5} />
          </svg>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        This is a <strong>real</strong> MLP trained in your browser with backprop. Line thickness = weight magnitude; color = sign (🟧 positive, 🟦 negative). Node size/opacity = mean activation magnitude across the dataset.
      </p>
    </div>
  )
}
