import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface TensorVisualizerProps {
  title: string
  description: string
}

type Mode = 'scalar' | 'vector' | 'matrix' | 'cube' | 'image' | 'batch'

const MODES: { key: Mode; label: string; emoji: string; dim: string; shape: string; desc: string }[] = [
  { key: 'scalar', label: '0D — Scalar', emoji: '🔴', dim: '0D', shape: '()', desc: 'A single number. Like a temperature or a loss value.' },
  { key: 'vector', label: '1D — Vector', emoji: '📏', dim: '1D', shape: '(5,)', desc: 'A list of numbers. Audio, a word embedding, a feature vector.' },
  { key: 'matrix', label: '2D — Matrix', emoji: '🧮', dim: '2D', shape: '(4, 5)', desc: 'Rows × columns. Spreadsheets, grayscale images, weight matrices.' },
  { key: 'cube', label: '3D — Cube', emoji: '🎲', dim: '3D', shape: '(3, 4, 5)', desc: 'Stacks of matrices. RGB images [C, H, W] or sequences [T, B, F].' },
  { key: 'image', label: 'Image tensor', emoji: '🖼️', dim: '3D', shape: '(3, 8, 8)', desc: 'A real image: 3 channels (R,G,B), each an H×W matrix of pixels.' },
  { key: 'batch', label: '4D — Batch', emoji: '📦', dim: '4D', shape: '(N, C, H, W)', desc: 'A batch of images fed to the GPU in parallel.' },
]

function cellColor(v: number, max = 9) {
  const t = v / max
  const r = Math.round(99 + t * 150)
  const g = Math.round(102 + t * 40)
  const b = Math.round(241 - t * 80)
  return `rgb(${r},${g},${b})`
}

function ScalarView() {
  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center py-8">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 text-white text-3xl font-mono font-bold flex items-center justify-center shadow-xl">
        7
      </div>
    </motion.div>
  )
}

function VectorView() {
  const vals = [2, 7, 1, 8, 4]
  return (
    <div className="flex justify-center gap-2 py-6">
      {vals.map((v, i) => (
        <motion.div
          key={i}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="w-14 h-14 rounded-xl text-white text-xl font-mono font-bold flex items-center justify-center shadow"
          style={{ backgroundColor: cellColor(v) }}
        >
          {v}
        </motion.div>
      ))}
    </div>
  )
}

function MatrixView() {
  const rows = 4
  const cols = 5
  return (
    <div className="flex justify-center py-4">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 2.75rem)` }}>
        {Array.from({ length: rows * cols }).map((_, i) => {
          const v = (i * 3 + 1) % 10
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="w-11 h-11 rounded-lg text-white text-base font-mono font-bold flex items-center justify-center shadow"
              style={{ backgroundColor: cellColor(v) }}
            >
              {v}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function CubeView() {
  const depth = 3
  const rows = 4
  const cols = 5
  return (
    <div className="flex justify-center py-4">
      <div className="relative" style={{ paddingTop: (depth - 1) * 10, paddingLeft: (depth - 1) * 10 }}>
        {Array.from({ length: depth }).map((_, d) => (
          <div
            key={d}
            className="absolute grid gap-1"
            style={{
              top: (depth - 1 - d) * 10,
              left: (depth - 1 - d) * 10,
              gridTemplateColumns: `repeat(${cols}, 2.25rem)`,
              filter: `brightness(${1 - d * 0.1})`,
            }}
          >
            {Array.from({ length: rows * cols }).map((_, i) => {
              const v = (i + d * 2) % 10
              return (
                <div key={i} className="w-9 h-9 rounded text-white text-xs font-mono font-bold flex items-center justify-center shadow" style={{ backgroundColor: cellColor(v) }}>
                  {v}
                </div>
              )
            })}
          </div>
        ))}
        <div className="grid gap-1 opacity-0" style={{ gridTemplateColumns: `repeat(${cols}, 2.25rem)` }}>
          {Array.from({ length: rows * cols }).map((_, i) => (
            <div key={i} className="w-9 h-9" />
          ))}
        </div>
      </div>
    </div>
  )
}

function ImageView() {
  // make a tiny "smiley" RGB image 8x8
  const H = 8
  const W = 8
  const channels = useMemo(() => {
    const R = Array(H * W).fill(0.95)
    const G = Array(H * W).fill(0.85)
    const B = Array(H * W).fill(0.4)
    const setPx = (y: number, x: number, r: number, g: number, b: number) => {
      R[y * W + x] = r
      G[y * W + x] = g
      B[y * W + x] = b
    }
    setPx(2, 2, 0.1, 0.1, 0.15) // eye
    setPx(2, 5, 0.1, 0.1, 0.15) // eye
    setPx(5, 2, 0.9, 0.3, 0.3)
    setPx(5, 3, 0.9, 0.3, 0.3)
    setPx(5, 4, 0.9, 0.3, 0.3)
    setPx(5, 5, 0.9, 0.3, 0.3)
    setPx(6, 1, 0.9, 0.3, 0.3)
    setPx(6, 6, 0.9, 0.3, 0.3)
    return { R, G, B }
  }, [])

  const renderChannel = (arr: number[], label: string, color: string) => (
    <div className="flex flex-col items-center">
      <div className="text-xs font-bold mb-1" style={{ color }}>{label}</div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${W}, 1.1rem)` }}>
        {arr.map((v, i) => (
          <div key={i} className="w-[1.1rem] h-[1.1rem] rounded-sm" style={{ backgroundColor: `rgba(${color === 'red' ? 255 : 0},${color === 'green' ? 255 : 0},${color === 'blue' ? 255 : 0},${v})` }} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="py-4">
      <div className="flex flex-wrap justify-center gap-4 items-end">
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold mb-1">Combined</div>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${W}, 1.1rem)` }}>
            {channels.R.map((_, i) => (
              <div
                key={i}
                className="w-[1.1rem] h-[1.1rem] rounded-sm border border-black/5"
                style={{ backgroundColor: `rgb(${Math.round(channels.R[i] * 255)},${Math.round(channels.G[i] * 255)},${Math.round(channels.B[i] * 255)})` }}
              />
            ))}
          </div>
        </div>
        {renderChannel(channels.R, 'R', 'red')}
        {renderChannel(channels.G, 'G', 'green')}
        {renderChannel(channels.B, 'B', 'blue')}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-3">
        Shape <code className="bg-muted px-1 rounded">(3, 8, 8)</code> = 3 channels × 8 rows × 8 cols = 192 numbers.
      </p>
    </div>
  )
}

function BatchView() {
  const N = 4
  return (
    <div className="flex justify-center gap-2 py-4 flex-wrap">
      {Array.from({ length: N }).map((_, n) => (
        <motion.div
          key={n}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: n * 0.1 }}
          className="rounded-xl p-2 bg-gradient-to-br from-violet-500 to-blue-500 shadow"
        >
          <div className="text-[10px] text-white text-center mb-1">sample #{n}</div>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(6, 0.65rem)' }}>
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="w-[0.65rem] h-[0.65rem] rounded-sm" style={{ backgroundColor: `hsl(${(n * 80 + i * 6) % 360}, 70%, 65%)` }} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function TensorVisualizer({ title, description }: TensorVisualizerProps) {
  const [mode, setMode] = useState<Mode>('matrix')
  const current = MODES.find((m) => m.key === mode)!

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 space-y-4">
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        {MODES.map((m) => (
          <Button key={m.key} size="sm" variant={mode === m.key ? 'default' : 'outline'} onClick={() => setMode(m.key)}>
            {m.emoji} {m.dim}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
        <span className="font-bold">{current.label}</span>
        <code className="bg-muted px-2 py-0.5 rounded text-xs">shape = {current.shape}</code>
      </div>

      <div className="min-h-[220px] flex items-center justify-center">
        {mode === 'scalar' && <ScalarView />}
        {mode === 'vector' && <VectorView />}
        {mode === 'matrix' && <MatrixView />}
        {mode === 'cube' && <CubeView />}
        {mode === 'image' && <ImageView />}
        {mode === 'batch' && <BatchView />}
      </div>

      <p className="text-center text-xs text-muted-foreground border-t pt-3">{current.desc}</p>
    </div>
  )
}
