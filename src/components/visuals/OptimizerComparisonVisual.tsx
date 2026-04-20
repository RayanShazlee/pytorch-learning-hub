import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, ArrowClockwise } from '@phosphor-icons/react'

interface Point { x: number; y: number }

const WIDTH = 500
const HEIGHT = 400
const GRID = 20

// 2D bowl function: f(x,y) = x² + 3y²  (global min at 0,0)
function loss(p: Point) { return p.x ** 2 + 3 * p.y ** 2 }
function grad(p: Point): Point { return { x: 2 * p.x, y: 6 * p.y } }

function toSvg(p: Point): Point {
  return { x: WIDTH / 2 + p.x * GRID, y: HEIGHT / 2 + p.y * GRID }
}

interface Optimizer {
  name: string
  color: string
  desc: string
  state: any
  step: (pos: Point, g: Point, lr: number, state: any) => { pos: Point; state: any }
}

function makeOptimizers(): Optimizer[] {
  return [
    {
      name: 'SGD',
      color: 'oklch(0.7 0.2 200)',
      desc: 'Simple gradient descent — same step size in every direction',
      state: {},
      step: (pos, g, lr) => ({
        pos: { x: pos.x - lr * g.x, y: pos.y - lr * g.y },
        state: {},
      }),
    },
    {
      name: 'Momentum',
      color: 'oklch(0.65 0.25 350)',
      desc: 'Adds velocity — accelerates in consistent directions',
      state: { vx: 0, vy: 0 },
      step: (pos, g, lr, state) => {
        const mu = 0.9
        const vx = mu * (state.vx || 0) + lr * g.x
        const vy = mu * (state.vy || 0) + lr * g.y
        return { pos: { x: pos.x - vx, y: pos.y - vy }, state: { vx, vy } }
      },
    },
    {
      name: 'Adam',
      color: 'oklch(0.72 0.19 140)',
      desc: 'Adapts learning rate per-parameter — the standard default',
      state: { mx: 0, my: 0, vx: 0, vy: 0, t: 0 },
      step: (pos, g, lr, state) => {
        const b1 = 0.9, b2 = 0.999, eps = 1e-8
        const t = (state.t || 0) + 1
        const mx = b1 * (state.mx || 0) + (1 - b1) * g.x
        const my = b1 * (state.my || 0) + (1 - b1) * g.y
        const vx = b2 * (state.vx || 0) + (1 - b2) * g.x ** 2
        const vy = b2 * (state.vy || 0) + (1 - b2) * g.y ** 2
        const mxh = mx / (1 - b1 ** t), myh = my / (1 - b1 ** t)
        const vxh = vx / (1 - b2 ** t), vyh = vy / (1 - b2 ** t)
        return {
          pos: { x: pos.x - lr * mxh / (Math.sqrt(vxh) + eps), y: pos.y - lr * myh / (Math.sqrt(vyh) + eps) },
          state: { mx, my, vx, vy, t },
        }
      },
    },
  ]
}

export function OptimizerComparisonVisual() {
  const [optimizers, setOptimizers] = useState(makeOptimizers)
  const [paths, setPaths] = useState<Point[][]>([])
  const [running, setRunning] = useState(false)
  const [stepCount, setStepCount] = useState(0)
  const stepRef = useRef(0)
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const start: Point = { x: -8, y: -6 }
  const lr = 0.05

  const reset = useCallback(() => {
    if (animRef.current) clearInterval(animRef.current)
    setRunning(false)
    stepRef.current = 0
    setStepCount(0)
    setOptimizers(makeOptimizers())
    setPaths(optimizers.map(() => [start]))
  }, [])

  useEffect(() => {
    setPaths(optimizers.map(() => [start]))
    return () => { if (animRef.current) clearInterval(animRef.current) }
  }, [])

  function run() {
    if (running) return
    setRunning(true)
    const currentPaths = optimizers.map(() => [start])
    const currentOpts = makeOptimizers()
    const positions = optimizers.map(() => ({ ...start }))

    setPaths([...currentPaths])
    setOptimizers([...currentOpts])

    animRef.current = setInterval(() => {
      stepRef.current++
      if (stepRef.current > 100) {
        if (animRef.current) clearInterval(animRef.current)
        setRunning(false)
        return
      }
      setStepCount(stepRef.current)
      positions.forEach((pos, i) => {
        const g = grad(pos)
        const result = currentOpts[i].step(pos, g, lr, currentOpts[i].state)
        positions[i] = result.pos
        currentOpts[i].state = result.state
        currentPaths[i] = [...currentPaths[i], { ...result.pos }]
      })
      setPaths(currentPaths.map(p => [...p]))
    }, 60)
  }

  // Generate contour lines
  const contourLevels = [1, 5, 15, 30, 50, 80, 120]

  return (
    <Card className="bg-gradient-to-br from-cyan/5 to-lime/5 border-cyan/20">
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-cyan to-lime bg-clip-text text-transparent">
          Optimizer Comparison
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Watch SGD, Momentum, and Adam navigate a loss landscape to find the minimum at the center.
        </p>

        <div className="flex items-center gap-3 mb-4">
          <Button size="sm" onClick={run} disabled={running} className="gap-2">
            <Play size={16} weight="fill" /> {running ? 'Running...' : 'Start'}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="gap-2">
            <ArrowClockwise size={16} /> Reset
          </Button>
          <span className="text-xs font-semibold bg-muted px-3 py-1 rounded-full">
            Step: {stepCount}
          </span>
        </div>

        <svg width="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="bg-card rounded-xl border">
          {/* Contour lines (ellipses because f=x²+3y²) */}
          {contourLevels.map(level => {
            const rx = Math.sqrt(level) * GRID
            const ry = Math.sqrt(level / 3) * GRID
            return (
              <ellipse
                key={level}
                cx={WIDTH / 2} cy={HEIGHT / 2}
                rx={rx} ry={ry}
                fill="none"
                stroke="oklch(0.5 0.05 280 / 0.2)"
                strokeWidth={1}
              />
            )
          })}

          {/* Minimum marker */}
          <circle cx={WIDTH / 2} cy={HEIGHT / 2} r={4} fill="oklch(0.8 0.2 60)" />
          <text x={WIDTH / 2 + 8} y={HEIGHT / 2 + 4} fontSize="10" fill="oklch(0.8 0.2 60)">min</text>

          {/* Paths */}
          {paths.map((path, oi) => (
            <g key={oi}>
              {path.length > 1 && (
                <polyline
                  points={path.map(p => { const s = toSvg(p); return `${s.x},${s.y}` }).join(' ')}
                  fill="none"
                  stroke={optimizers[oi].color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  opacity={0.8}
                />
              )}
              {/* Current position */}
              {path.length > 0 && (() => {
                const last = toSvg(path[path.length - 1])
                return (
                  <circle
                    cx={last.x} cy={last.y} r={5}
                    fill={optimizers[oi].color}
                    stroke="white" strokeWidth={1.5}
                  />
                )
              })()}
            </g>
          ))}

          {/* Start marker */}
          {(() => { const s = toSvg(start); return (
            <g>
              <circle cx={s.x} cy={s.y} r={4} fill="white" stroke="oklch(0.6 0.08 280)" strokeWidth={1.5} />
              <text x={s.x - 15} y={s.y - 8} fontSize="9" fill="oklch(0.7 0.08 280)">start</text>
            </g>
          ) })()}

          {/* Axis labels */}
          <text x={WIDTH - 15} y={HEIGHT / 2 + 15} fontSize="10" fill="oklch(0.5 0.05 280)">x</text>
          <text x={WIDTH / 2 + 5} y={15} fontSize="10" fill="oklch(0.5 0.05 280)">y</text>
        </svg>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {optimizers.map((opt, i) => (
            <div key={opt.name} className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: opt.color }} />
                <span className="text-sm font-bold">{opt.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
              {paths[i] && paths[i].length > 0 && (
                <p className="text-[10px] mt-1 font-mono">
                  loss: {loss(paths[i][paths[i].length - 1]).toFixed(4)}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
