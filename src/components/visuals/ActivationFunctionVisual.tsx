import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

type FnKey = 'relu' | 'leaky' | 'sigmoid' | 'tanh' | 'gelu'

interface FnDef {
  key: FnKey
  label: string
  emoji: string
  color: string
  f: (x: number) => number
  df: (x: number) => number
  formula: string
  notes: string
}

const FNS: FnDef[] = [
  {
    key: 'relu',
    label: 'ReLU',
    emoji: '⚡',
    color: '#22c55e',
    f: (x) => Math.max(0, x),
    df: (x) => (x > 0 ? 1 : 0),
    formula: 'max(0, x)',
    notes: 'Fast, simple. Dies if input stays negative.',
  },
  {
    key: 'leaky',
    label: 'Leaky ReLU',
    emoji: '💧',
    color: '#14b8a6',
    f: (x) => (x >= 0 ? x : 0.1 * x),
    df: (x) => (x >= 0 ? 1 : 0.1),
    formula: 'x if x≥0 else 0.1·x',
    notes: 'Fixes dead ReLU by letting small negative flow through.',
  },
  {
    key: 'sigmoid',
    label: 'Sigmoid',
    emoji: '📊',
    color: '#f59e0b',
    f: (x) => 1 / (1 + Math.exp(-x)),
    df: (x) => {
      const s = 1 / (1 + Math.exp(-x))
      return s * (1 - s)
    },
    formula: '1 / (1 + e⁻ˣ)',
    notes: 'Squashes to (0,1). Good for probabilities. Saturates at extremes.',
  },
  {
    key: 'tanh',
    label: 'Tanh',
    emoji: '🌊',
    color: '#3b82f6',
    f: (x) => Math.tanh(x),
    df: (x) => 1 - Math.tanh(x) ** 2,
    formula: 'tanh(x)',
    notes: 'Zero-centered in (−1, 1). Still saturates for large |x|.',
  },
  {
    key: 'gelu',
    label: 'GELU',
    emoji: '✨',
    color: '#a855f7',
    // Tanh approximation used in GPT-2
    f: (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))),
    df: (x) => {
      const k = Math.sqrt(2 / Math.PI)
      const t = Math.tanh(k * (x + 0.044715 * x ** 3))
      const dt = 1 - t * t
      const inner = k * (1 + 3 * 0.044715 * x * x)
      return 0.5 * (1 + t) + 0.5 * x * dt * inner
    },
    formula: '½x(1 + tanh(√(2/π)(x+0.044715x³)))',
    notes: 'Smooth ReLU-like shape. Used in GPT, BERT.',
  },
]

export function ActivationFunctionVisual() {
  const [active, setActive] = useState<FnKey>('relu')
  const [x, setX] = useState(1.2)
  const [showDerivative, setShowDerivative] = useState(true)
  const [compare, setCompare] = useState(false)

  const current = FNS.find((f) => f.key === active)!

  // plot geometry
  const W = 520
  const H = 260
  const xMin = -6
  const xMax = 6
  const yMin = -2
  const yMax = 2
  const pxX = (v: number) => ((v - xMin) / (xMax - xMin)) * W
  const pxY = (v: number) => H - ((v - yMin) / (yMax - yMin)) * H

  const makePath = (f: (v: number) => number) => {
    const steps = 240
    let d = ''
    for (let i = 0; i <= steps; i++) {
      const v = xMin + (i / steps) * (xMax - xMin)
      const y = f(v)
      const cy = pxY(Math.max(yMin, Math.min(yMax, y)))
      d += `${i === 0 ? 'M' : 'L'}${pxX(v).toFixed(2)},${cy.toFixed(2)} `
    }
    return d
  }

  const pathFn = useMemo(() => makePath(current.f), [current])
  const pathDf = useMemo(() => makePath(current.df), [current])

  const y = current.f(x)
  const dy = current.df(x)

  return (
    <div className="space-y-5">
      {/* Function selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {FNS.map((fn) => (
          <Button
            key={fn.key}
            size="sm"
            variant={active === fn.key ? 'default' : 'outline'}
            onClick={() => setActive(fn.key)}
            style={active === fn.key ? { backgroundColor: fn.color, color: 'white' } : {}}
          >
            {fn.emoji} {fn.label}
          </Button>
        ))}
      </div>

      {/* Plot */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 border">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* grid */}
          {[-4, -2, 0, 2, 4].map((gx) => (
            <line key={`vx${gx}`} x1={pxX(gx)} y1={0} x2={pxX(gx)} y2={H} stroke="currentColor" strokeOpacity={gx === 0 ? 0.4 : 0.08} strokeWidth={gx === 0 ? 1.5 : 1} />
          ))}
          {[-1, 0, 1].map((gy) => (
            <line key={`hy${gy}`} x1={0} y1={pxY(gy)} x2={W} y2={pxY(gy)} stroke="currentColor" strokeOpacity={gy === 0 ? 0.4 : 0.08} strokeWidth={gy === 0 ? 1.5 : 1} />
          ))}

          {/* compare other curves faded */}
          {compare &&
            FNS.filter((f) => f.key !== active).map((fn) => (
              <path key={fn.key} d={makePath(fn.f)} fill="none" stroke={fn.color} strokeWidth={1.5} strokeOpacity={0.35} />
            ))}

          {/* derivative curve */}
          {showDerivative && (
            <path d={pathDf} fill="none" stroke={current.color} strokeWidth={2} strokeDasharray="4 4" strokeOpacity={0.6} />
          )}

          {/* main curve */}
          <path d={pathFn} fill="none" stroke={current.color} strokeWidth={3.5} strokeLinecap="round" />

          {/* live point */}
          <motion.g animate={{ cx: pxX(x), cy: pxY(y) }} transition={{ type: 'spring', stiffness: 250, damping: 25 }}>
            <circle cx={pxX(x)} cy={pxY(y)} r={8} fill={current.color} stroke="white" strokeWidth={3} />
            <circle cx={pxX(x)} cy={pxY(y)} r={14} fill={current.color} fillOpacity={0.25} />
          </motion.g>

          {/* vertical drop line */}
          <line x1={pxX(x)} y1={pxY(0)} x2={pxX(x)} y2={pxY(y)} stroke={current.color} strokeWidth={1.5} strokeDasharray="2 3" strokeOpacity={0.7} />

          {/* axis labels */}
          <text x={W - 4} y={pxY(0) - 4} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.5">x</text>
          <text x={pxX(0) + 4} y={10} fontSize="10" fill="currentColor" opacity="0.5">y</text>
        </svg>
      </div>

      {/* Input slider + live numbers */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground w-16">input x</span>
          <div className="flex-1">
            <Slider min={-6} max={6} step={0.1} value={[x]} onValueChange={(v) => setX(v[0])} />
          </div>
          <span className="font-mono text-sm w-16 text-right">{x.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <div className="text-xs text-muted-foreground">f(x) output</div>
            <div className="font-mono text-2xl font-bold" style={{ color: current.color }}>{y.toFixed(3)}</div>
          </div>
          <div className="rounded-xl border p-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <div className="text-xs text-muted-foreground">f'(x) gradient</div>
            <div className="font-mono text-2xl font-bold opacity-80" style={{ color: current.color }}>{dy.toFixed(3)}</div>
          </div>
        </div>
      </div>

      {/* Toggles + info */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button size="sm" variant={showDerivative ? 'default' : 'outline'} onClick={() => setShowDerivative(!showDerivative)}>
          {showDerivative ? '✓' : '○'} derivative
        </Button>
        <Button size="sm" variant={compare ? 'default' : 'outline'} onClick={() => setCompare(!compare)}>
          {compare ? '✓' : '○'} compare all
        </Button>
      </div>

      <div className="rounded-xl border bg-muted/30 p-4 text-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{current.emoji}</span>
          <span className="font-bold">{current.label}</span>
          <code className="ml-2 text-xs bg-background rounded px-2 py-0.5">{current.formula}</code>
        </div>
        <p className="text-muted-foreground">{current.notes}</p>
        <p className="text-xs text-muted-foreground pt-1 border-t">
          The <span className="font-semibold">solid line</span> shows the function. The{' '}
          <span className="font-semibold">dashed line</span> shows its derivative — this is the <em>gradient signal</em>{' '}
          that backprop uses to update weights. Where the derivative is 0 (flat), no learning happens.
        </p>
      </div>
    </div>
  )
}
