import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, ArrowRight, ArrowLeft } from '@phosphor-icons/react'

interface Neuron {
  x: number
  y: number
  value: number
  gradient: number
  label: string
}

interface Connection {
  from: number
  to: number
  weight: number
  gradWeight: number
}

type Phase = 'idle' | 'forward' | 'loss' | 'backward' | 'update' | 'done'

const LAYERS = [
  [{ label: 'x₁', baseVal: 0.5 }, { label: 'x₂', baseVal: 0.8 }],
  [{ label: 'h₁', baseVal: 0 }, { label: 'h₂', baseVal: 0 }],
  [{ label: 'ŷ', baseVal: 0 }],
]

export function BackpropVisualizer() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [step, setStep] = useState(0)
  const [neurons, setNeurons] = useState<Neuron[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [lossValue, setLossValue] = useState(0)
  const [epoch, setEpoch] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const WIDTH = 600
  const HEIGHT = 300
  const layerX = [80, 300, 520]
  const target = 1.0

  useEffect(() => {
    resetNetwork()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  function resetNetwork() {
    const neurs: Neuron[] = []
    LAYERS.forEach((layer, li) => {
      const ySpacing = HEIGHT / (layer.length + 1)
      layer.forEach((n, ni) => {
        neurs.push({
          x: layerX[li],
          y: ySpacing * (ni + 1),
          value: n.baseVal,
          gradient: 0,
          label: n.label,
        })
      })
    })
    const conns: Connection[] = []
    const idxBase = [0, 2, 4]
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        conns.push({ from: idxBase[0] + i, to: idxBase[1] + j, weight: +(Math.random() * 0.8 + 0.1).toFixed(2), gradWeight: 0 })
      }
    }
    for (let j = 0; j < 2; j++) {
      conns.push({ from: idxBase[1] + j, to: idxBase[2], weight: +(Math.random() * 0.8 + 0.1).toFixed(2), gradWeight: 0 })
    }
    setNeurons(neurs)
    setConnections(conns)
    setPhase('idle')
    setStep(0)
    setLossValue(0)
  }

  function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)) }

  function runForward() {
    setPhase('forward')
    const n = [...neurons]
    const c = [...connections]
    // Hidden layer
    for (let hi = 2; hi < 4; hi++) {
      let sum = 0
      c.filter(cc => cc.to === hi).forEach(cc => { sum += n[cc.from].value * cc.weight })
      n[hi].value = +sigmoid(sum).toFixed(3)
    }
    // Output
    let sum = 0
    c.filter(cc => cc.to === 4).forEach(cc => { sum += n[cc.from].value * cc.weight })
    n[4].value = +sigmoid(sum).toFixed(3)
    setNeurons(n)

    timerRef.current = setTimeout(() => {
      const loss = +((target - n[4].value) ** 2).toFixed(4)
      setLossValue(loss)
      setPhase('loss')

      timerRef.current = setTimeout(() => runBackward(n, c, loss), 1200)
    }, 1200)
  }

  function runBackward(n: Neuron[], c: Connection[], loss: number) {
    setPhase('backward')
    const nOut = n[4].value
    const dLoss = -2 * (target - nOut)
    const dSigOut = nOut * (1 - nOut)
    n[4].gradient = +(dLoss * dSigOut).toFixed(4)

    c.filter(cc => cc.to === 4).forEach(cc => {
      cc.gradWeight = +(n[4].gradient * n[cc.from].value).toFixed(4)
    })

    for (let hi = 2; hi < 4; hi++) {
      const conn = c.find(cc => cc.from === hi && cc.to === 4)!
      const upstream = n[4].gradient * conn.weight
      const dSig = n[hi].value * (1 - n[hi].value)
      n[hi].gradient = +(upstream * dSig).toFixed(4)
      c.filter(cc => cc.to === hi).forEach(cc => {
        cc.gradWeight = +(n[hi].gradient * n[cc.from].value).toFixed(4)
      })
    }
    setNeurons([...n])
    setConnections([...c])

    timerRef.current = setTimeout(() => runUpdate(n, c), 1500)
  }

  function runUpdate(n: Neuron[], c: Connection[]) {
    setPhase('update')
    const lr = 0.5
    c.forEach(cc => { cc.weight = +(cc.weight - lr * cc.gradWeight).toFixed(3) })
    n.forEach(nn => { nn.gradient = 0 })
    setConnections([...c])
    setNeurons([...n])
    setEpoch(e => e + 1)

    timerRef.current = setTimeout(() => setPhase('done'), 1000)
  }

  function handleStart() {
    if (phase === 'done') {
      setPhase('idle')
      setTimeout(() => runForward(), 100)
    } else {
      runForward()
    }
  }

  const phaseColors: Record<Phase, string> = {
    idle: 'text-muted-foreground',
    forward: 'text-cyan',
    loss: 'text-orange',
    backward: 'text-pink',
    update: 'text-lime',
    done: 'text-violet',
  }

  const phaseLabels: Record<Phase, string> = {
    idle: 'Ready — click Start to begin',
    forward: '➡️ Forward Pass: computing outputs...',
    loss: '📊 Computing Loss (MSE)...',
    backward: '⬅️ Backward Pass: computing gradients...',
    update: '✏️ Updating Weights (lr=0.5)...',
    done: '✅ Epoch complete! Run again to see improvement.',
  }

  return (
    <Card className="bg-gradient-to-br from-violet/5 to-pink/5 border-violet/20">
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-violet to-pink bg-clip-text text-transparent">
          Backpropagation Visualizer
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Watch data flow forward, loss calculated, then gradients flow backward to update weights.
        </p>

        <div className="flex items-center gap-3 mb-4">
          <Button
            size="sm"
            onClick={handleStart}
            disabled={phase !== 'idle' && phase !== 'done'}
            className="gap-2"
          >
            <Play size={16} weight="fill" />
            {phase === 'done' ? 'Run Again' : 'Start'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); resetNetwork(); setEpoch(0) }}>
            Reset
          </Button>
          <span className="text-xs font-semibold bg-violet/10 px-3 py-1 rounded-full">
            Epoch: {epoch}
          </span>
          {lossValue > 0 && (
            <span className="text-xs font-semibold bg-orange/10 text-orange px-3 py-1 rounded-full">
              Loss: {lossValue}
            </span>
          )}
        </div>

        <motion.p
          key={phase}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm font-semibold mb-3 ${phaseColors[phase]}`}
        >
          {phaseLabels[phase]}
        </motion.p>

        <svg width="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="bg-card rounded-xl border">
          {/* Connections */}
          {connections.map((c, i) => {
            const from = neurons[c.from]
            const to = neurons[c.to]
            if (!from || !to) return null
            const isBackward = phase === 'backward'
            const isUpdating = phase === 'update'
            // Midpoint + perpendicular offset so labels sit consistently off the line
            const mx = (from.x + to.x) / 2
            const my = (from.y + to.y) / 2
            const dx = to.x - from.x
            const dy = to.y - from.y
            const len = Math.max(1, Math.hypot(dx, dy))
            // Perpendicular unit vector (points "above" the line in SVG's y-down space)
            const px = -dy / len
            const py = dx / len
            // Flip so the label is always on the upper/left side for readability
            const sign = py > 0 ? -1 : 1
            const OFFSET_W = 12
            const OFFSET_G = 26
            const wx = mx + px * OFFSET_W * sign
            const wy = my + py * OFFSET_W * sign
            const gx = mx + px * OFFSET_G * sign
            const gy = my + py * OFFSET_G * sign
            return (
              <g key={`c-${i}`}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isBackward ? 'oklch(0.65 0.25 350)' : isUpdating ? 'oklch(0.72 0.19 140)' : 'oklch(0.6 0.05 280 / 0.3)'}
                  strokeWidth={isBackward || isUpdating ? 2.5 : 1.5}
                  strokeDasharray={isBackward ? '6 3' : 'none'}
                />
                {/* Weight label with background pill for legibility */}
                <rect
                  x={wx - 18} y={wy - 7}
                  width={36} height={13}
                  rx={3}
                  fill="oklch(0.18 0.02 280 / 0.85)"
                  stroke="oklch(0.3 0.04 280)"
                  strokeWidth={0.5}
                />
                <text
                  x={wx} y={wy + 3}
                  fontSize="9"
                  fill="oklch(0.85 0.06 280)"
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                >
                  w={c.weight}
                </text>
                {isBackward && c.gradWeight !== 0 && (
                  <g>
                    <rect
                      x={gx - 22} y={gy - 7}
                      width={44} height={13}
                      rx={3}
                      fill="oklch(0.18 0.04 350 / 0.85)"
                      stroke="oklch(0.45 0.15 350)"
                      strokeWidth={0.5}
                    />
                    <text
                      x={gx} y={gy + 3}
                      fontSize="8"
                      fill="oklch(0.8 0.18 350)"
                      textAnchor="middle"
                      fontFamily="ui-monospace, monospace"
                    >
                      ∇w={c.gradWeight}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Forward arrow */}
          {phase === 'forward' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.2, times: [0, 0.1, 0.8, 1] }}
            >
              <text x={WIDTH / 2} y={HEIGHT - 10} fontSize="12" fill="oklch(0.7 0.2 200)" textAnchor="middle" fontWeight="bold">
                ➡️ Data flowing forward
              </text>
            </motion.g>
          )}

          {/* Backward arrow */}
          {phase === 'backward' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.5, times: [0, 0.1, 0.8, 1] }}
            >
              <text x={WIDTH / 2} y={HEIGHT - 10} fontSize="12" fill="oklch(0.65 0.25 350)" textAnchor="middle" fontWeight="bold">
                ⬅️ Gradients flowing backward
              </text>
            </motion.g>
          )}

          {/* Neurons */}
          {neurons.map((n, i) => {
            const isActive = (phase === 'forward' && i >= 2) || (phase === 'backward' && n.gradient !== 0)
            const layerIdx = i < 2 ? 0 : i < 4 ? 1 : 2
            const color = layerIdx === 0 ? 'oklch(0.7 0.2 200)' : layerIdx === 1 ? 'oklch(0.6 0.22 280)' : 'oklch(0.72 0.19 140)'
            return (
              <g key={`n-${i}`}>
                <motion.circle
                  cx={n.x} cy={n.y} r={22}
                  fill={isActive ? color : 'oklch(0.3 0.02 280)'}
                  stroke={color}
                  strokeWidth={2}
                  animate={{ scale: isActive ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                />
                <text x={n.x} y={n.y - 6} fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">
                  {n.label}
                </text>
                <text x={n.x} y={n.y + 8} fontSize="9" fill="oklch(0.8 0.05 280)" textAnchor="middle">
                  {n.value.toFixed(3)}
                </text>
                {phase === 'backward' && n.gradient !== 0 && (
                  <motion.text
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    x={n.x} y={n.y + 38}
                    fontSize="8"
                    fill="oklch(0.65 0.25 350)"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    ∇={n.gradient}
                  </motion.text>
                )}
              </g>
            )
          })}

          {/* Layer labels */}
          {['Input', 'Hidden', 'Output'].map((label, i) => (
            <text key={label} x={layerX[i]} y={20} fontSize="11" fill="oklch(0.6 0.08 280)" textAnchor="middle" fontWeight="bold">
              {label}
            </text>
          ))}

          {/* Target label */}
          <text x={WIDTH - 30} y={HEIGHT / 2 + 5} fontSize="10" fill="oklch(0.65 0.2 140)" textAnchor="middle">
            target={target}
          </text>
        </svg>

        {/* Step explanation */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: 'Forward', icon: '➡️', desc: 'Compute outputs', color: phase === 'forward' ? 'border-cyan bg-cyan/10' : 'border-muted' },
            { label: 'Loss', icon: '📊', desc: 'Measure error', color: phase === 'loss' ? 'border-orange bg-orange/10' : 'border-muted' },
            { label: 'Backward', icon: '⬅️', desc: 'Compute gradients', color: phase === 'backward' ? 'border-pink bg-pink/10' : 'border-muted' },
            { label: 'Update', icon: '✏️', desc: 'Adjust weights', color: phase === 'update' ? 'border-lime bg-lime/10' : 'border-muted' },
          ].map(s => (
            <div key={s.label} className={`text-center p-2 rounded-lg border-2 ${s.color} transition-all`}>
              <div className="text-lg">{s.icon}</div>
              <div className="text-xs font-bold">{s.label}</div>
              <div className="text-[10px] text-muted-foreground">{s.desc}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
