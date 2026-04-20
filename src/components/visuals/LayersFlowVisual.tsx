import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Play, ArrowCounterClockwise } from '@phosphor-icons/react'

/**
 * Data-transformation pipeline visual.
 * Shows a tensor flowing through: Input → Linear → ReLU → Linear → Softmax
 * with live shapes and activations.
 */

type Stage = { name: string; shape: string; color: string; note: string }

const STAGES: Stage[] = [
  { name: 'Input image', shape: '(1, 3, 32, 32)', color: '#3b82f6', note: 'RGB image, 32×32' },
  { name: 'Conv 3×3 + ReLU', shape: '(1, 16, 30, 30)', color: '#8b5cf6', note: '16 feature maps' },
  { name: 'MaxPool 2×2', shape: '(1, 16, 15, 15)', color: '#a855f7', note: 'Spatial halved' },
  { name: 'Conv 3×3 + ReLU', shape: '(1, 32, 13, 13)', color: '#d946ef', note: '32 feature maps' },
  { name: 'Flatten', shape: '(1, 5408)', color: '#ec4899', note: 'Tensor → vector' },
  { name: 'Linear + ReLU', shape: '(1, 128)', color: '#f97316', note: 'Compressed features' },
  { name: 'Linear', shape: '(1, 10)', color: '#eab308', note: '10 class scores' },
  { name: 'Softmax', shape: '(1, 10)', color: '#22c55e', note: 'Probabilities (sum=1)' },
]

// final class probabilities (demo)
const probs = [0.02, 0.01, 0.04, 0.03, 0.78, 0.01, 0.03, 0.05, 0.02, 0.01]
const classes = ['plane', 'car', 'bird', 'cat', 'dog', 'frog', 'horse', 'ship', 'truck', 'deer']

export function LayersFlowVisual() {
  const [stage, setStage] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    if (stage >= STAGES.length - 1) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setStage((s) => s + 1), 900)
    return () => clearTimeout(t)
  }, [playing, stage])

  const current = STAGES[stage]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => { setStage(0); setPlaying(true) }}>
          <Play size={14} className="mr-1" /> Play pipeline
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setStage(0); setPlaying(false) }}>
          <ArrowCounterClockwise size={14} className="mr-1" /> Reset
        </Button>
      </div>

      {/* Pipeline */}
      <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STAGES.map((s, i) => (
            <div key={i} className="flex items-center">
              <motion.button
                onClick={() => { setStage(i); setPlaying(false) }}
                animate={{ scale: stage === i ? 1.1 : 1, opacity: stage >= i ? 1 : 0.35 }}
                className="rounded-xl px-3 py-2 text-xs text-white font-semibold min-w-[100px] text-center shadow"
                style={{ backgroundColor: s.color }}
              >
                <div>{s.name}</div>
                <code className="text-[10px] opacity-90 font-mono">{s.shape}</code>
              </motion.button>
              {i < STAGES.length - 1 && (
                <motion.div animate={{ opacity: stage > i ? 1 : 0.2 }} className="text-xl mx-0.5">→</motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live current-stage card */}
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-4"
        style={{ borderColor: current.color, backgroundColor: current.color + '10' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: current.color }} />
          <h4 className="font-bold">{current.name}</h4>
          <code className="ml-auto text-xs bg-background px-2 py-0.5 rounded">{current.shape}</code>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{current.note}</p>

        {/* visual representation of the tensor at this stage */}
        <div className="flex justify-center">
          {stage === 0 && (
            <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(16, 0.6rem)' }}>
              {Array.from({ length: 16 * 16 }).map((_, i) => (
                <div key={i} className="w-[0.6rem] h-[0.6rem] rounded-sm" style={{ backgroundColor: `hsl(${(i * 7) % 360},70%,65%)` }} />
              ))}
            </div>
          )}
          {stage >= 1 && stage <= 3 && (
            <div className="flex gap-0.5">
              {Array.from({ length: Math.min(8, [16, 16, 32, 32][stage - 1]) }).map((_, c) => (
                <div key={c} className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(8, 0.45rem)' }}>
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[0.45rem] h-[0.45rem] rounded-sm"
                      style={{ backgroundColor: current.color, opacity: 0.3 + 0.7 * Math.random() }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
          {stage === 4 && (
            <div className="flex gap-0.5 flex-wrap max-w-[520px]">
              {Array.from({ length: 80 }).map((_, i) => (
                <div key={i} className="w-2 h-6 rounded-sm" style={{ backgroundColor: current.color, opacity: 0.3 + 0.7 * Math.random() }} />
              ))}
              <span className="text-xs text-muted-foreground self-center ml-2">…5408 values</span>
            </div>
          )}
          {stage === 5 && (
            <div className="flex gap-0.5 flex-wrap max-w-[520px]">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="w-2.5 h-8 rounded-sm" style={{ backgroundColor: current.color, opacity: 0.3 + 0.7 * Math.random() }} />
              ))}
              <span className="text-xs text-muted-foreground self-center ml-2">…128 values</span>
            </div>
          )}
          {stage === 6 && (
            <div className="flex gap-1">
              {classes.map((c, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-7 h-10 rounded-sm" style={{ backgroundColor: current.color, opacity: 0.3 + 0.7 * Math.random() }} />
                  <span className="text-[9px] text-muted-foreground mt-0.5">{c}</span>
                </div>
              ))}
            </div>
          )}
          {stage === 7 && (
            <div className="flex gap-1 items-end">
              {classes.map((c, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="w-7 rounded-t"
                    style={{ height: `${Math.max(6, probs[i] * 120)}px`, backgroundColor: probs[i] > 0.5 ? '#22c55e' : current.color }}
                  />
                  <span className="text-[9px] text-muted-foreground mt-1">{c}</span>
                  <span className="text-[9px] font-mono">{(probs[i] * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {stage === STAGES.length - 1 && (
          <div className="mt-3 text-center text-sm">
            <span className="font-bold text-emerald-600">Prediction: dog 🐕 (78%)</span>
          </div>
        )}
      </motion.div>

      <p className="text-xs text-muted-foreground">
        Every layer is a <em>differentiable function</em>: it transforms a tensor into another tensor of a new shape, preserving enough info for the next layer to use.
      </p>
    </div>
  )
}
