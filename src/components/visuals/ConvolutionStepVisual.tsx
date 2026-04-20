/**
 * ConvolutionStepVisual
 * ─────────────────────
 * A 2-D convolution shown as a kernel that slides over the input ONE position
 * at a time, with the element-wise multiplies and their sum rendered beside
 * the grids. Once you see a single (kernel · patch) computation play out,
 * `nn.Conv2d` stops being magic.
 *
 * Features:
 *   • Pick from 3 classic 3×3 kernels (edge / blur / sharpen) — the ACTUAL
 *     numbers you'd write in a CNN filter — so the output changes in a way
 *     that matches the learner's intuition about what the kernel "does".
 *   • 6×6 fixed input with a tiny shape in it, so the output feature map is
 *     visibly meaningful (edges get picked up, etc.).
 *   • Step / Play / Reset. At each step only the currently-covered 3×3 patch
 *     is highlighted, the kernel overlays the patch, and the nine
 *     (input × kernel) products appear in a panel below with a running sum.
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  ArrowClockwise,
  SkipForward,
  SquaresFour,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// 6×6 input with a simple "L" shape in the middle so edges are visible.
const INPUT: number[][] = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0, 0],
  [0, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0],
]

type Kernel = { name: string; k: number[][]; hint: string }

const KERNELS: Kernel[] = [
  {
    name: 'edge',
    hint: 'Vertical-edge detector — lights up where pixels change left→right.',
    k: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ],
  },
  {
    name: 'sharpen',
    hint: 'Sharpens — emphasises the centre pixel over its neighbours.',
    k: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
  },
  {
    name: 'blur',
    hint: 'Average (box blur) — each output is the mean of its 3×3 patch.',
    k: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
  },
]

const IN_H = INPUT.length
const IN_W = INPUT[0].length
const K = 3
const OUT_H = IN_H - K + 1 // 4
const OUT_W = IN_W - K + 1 // 4

export function ConvolutionStepVisual() {
  const [kernelIdx, setKernelIdx] = useState(0)
  const kernel = KERNELS[kernelIdx]
  const totalCells = OUT_H * OUT_W

  // step: termIdx -1 = not started, 0..8 = which of the 9 multiplies, 9 = sum settled
  const [cellIdx, setCellIdx] = useState(0)
  const [termIdx, setTermIdx] = useState<number>(-1)
  const [playing, setPlaying] = useState(false)

  const oy = Math.floor(cellIdx / OUT_W)
  const ox = cellIdx % OUT_W

  // normalisation (only for blur: divide by 9). For others apply raw sum.
  const normalise = (s: number) => (kernel.name === 'blur' ? s / 9 : s)

  const output: Array<Array<number | null>> = useMemo(() => {
    const out: Array<Array<number | null>> = Array.from({ length: OUT_H }, () =>
      Array(OUT_W).fill(null),
    )
    for (let c = 0; c < cellIdx; c++) {
      const y = Math.floor(c / OUT_W)
      const x = c % OUT_W
      let s = 0
      for (let dy = 0; dy < K; dy++)
        for (let dx = 0; dx < K; dx++) s += INPUT[y + dy][x + dx] * kernel.k[dy][dx]
      out[y][x] = +normalise(s).toFixed(2)
    }
    if (termIdx === K * K - 1) {
      let s = 0
      for (let dy = 0; dy < K; dy++)
        for (let dx = 0; dx < K; dx++) s += INPUT[oy + dy][ox + dx] * kernel.k[dy][dx]
      out[oy][ox] = +normalise(s).toFixed(2)
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellIdx, termIdx, kernelIdx, oy, ox])

  const products: Array<{ a: number; b: number; p: number }> = []
  if (termIdx >= 0) {
    for (let t = 0; t <= termIdx; t++) {
      const dy = Math.floor(t / K)
      const dx = t % K
      const a = INPUT[oy + dy][ox + dx]
      const b = kernel.k[dy][dx]
      products.push({ a, b, p: a * b })
    }
  }
  const runningSum = products.reduce((s, p) => s + p.p, 0)

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(advance, 380)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, cellIdx, termIdx])

  function advance() {
    if (termIdx < K * K - 1) {
      setTermIdx((t) => t + 1)
      return
    }
    if (cellIdx < totalCells - 1) {
      setCellIdx((c) => c + 1)
      setTermIdx(-1)
      return
    }
    setPlaying(false)
  }

  function reset() {
    setCellIdx(0)
    setTermIdx(-1)
    setPlaying(false)
  }

  function changeKernel(i: number) {
    setKernelIdx(i)
    reset()
  }

  const done = cellIdx === totalCells - 1 && termIdx === K * K - 1

  const maxAbs = Math.max(
    ...output.flat().map((v) => (v === null ? 0 : Math.abs(v))),
    1,
  )

  return (
    <Card className="p-5 border-2 bg-gradient-to-br from-background via-cyan/5 to-lime/5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <SquaresFour size={18} weight="fill" className="text-cyan" />
            Convolution — slide, multiply, sum
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{kernel.hint}</p>
        </div>
        <div className="flex gap-1">
          {KERNELS.map((k, i) => (
            <Button
              key={i}
              size="sm"
              variant={kernelIdx === i ? 'default' : 'outline'}
              onClick={() => changeKernel(i)}
              className="h-7 px-2 text-[11px] capitalize"
            >
              {k.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-4">
        <InputGrid oy={oy} ox={ox} kernel={kernel.k} termIdx={termIdx} />
        <div className="text-xl font-bold text-muted-foreground select-none">→</div>
        <OutputGrid data={output} oy={oy} ox={ox} maxAbs={maxAbs} />
      </div>

      <AnimatePresence mode="wait">
        {termIdx >= 0 && (
          <motion.div
            key={`${cellIdx}-${termIdx}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg bg-muted/40 border p-3 mb-3 font-mono text-[11px] md:text-xs overflow-x-auto"
          >
            <div className="text-muted-foreground mb-1">
              output[{oy},{ox}] = Σ (input · kernel)
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {products.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  {i > 0 && <span className="text-muted-foreground">+</span>}
                  <span className="px-1.5 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/30">
                    {p.a}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="px-1.5 py-0.5 rounded bg-pink/15 text-pink border border-pink/30">
                    {p.b}
                  </span>
                </span>
              ))}
              <span className="text-muted-foreground mx-1">=</span>
              <span className="px-2 py-0.5 rounded bg-violet/15 text-violet border border-violet/30 font-bold">
                {kernel.name === 'blur' ? (runningSum / 9).toFixed(2) : runningSum}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-2">
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
        <Button size="sm" variant="outline" onClick={advance} disabled={done || playing} className="gap-1">
          <SkipForward size={14} weight="fill" /> Step
        </Button>
        <Button size="sm" variant="ghost" onClick={reset} className="gap-1">
          <ArrowClockwise size={14} /> Reset
        </Button>
      </div>

      <div className="text-[11px] text-center text-muted-foreground mt-3">
        Same weights reused across every position — that&apos;s parameter sharing, the reason CNNs
        generalise to new images.
      </div>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

function InputGrid({
  oy,
  ox,
  kernel,
  termIdx,
}: {
  oy: number
  ox: number
  kernel: number[][]
  termIdx: number
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold text-muted-foreground mb-1">Input 6×6</div>
      <div className="relative grid gap-1 p-1.5 rounded-lg border-2 bg-card"
        style={{ gridTemplateColumns: `repeat(${IN_W}, minmax(0, 1fr))` }}
      >
        {INPUT.flatMap((row, y) =>
          row.map((v, x) => {
            const inPatch = y >= oy && y < oy + K && x >= ox && x < ox + K
            const dy = y - oy
            const dx = x - ox
            const termNum = dy * K + dx
            const isCurrent = inPatch && termIdx >= 0 && termNum === termIdx
            const isDone = inPatch && termIdx >= 0 && termNum < termIdx
            return (
              <div
                key={`${y}-${x}`}
                className={cn(
                  'w-8 h-8 md:w-9 md:h-9 rounded flex items-center justify-center text-xs font-mono relative',
                  'border',
                  v === 1 ? 'bg-cyan/30 text-cyan-foreground border-cyan/40' : 'bg-muted/20 border-border/40',
                  inPatch && 'ring-2 ring-primary/60',
                )}
              >
                {v}
                {inPatch && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{
                      opacity: isDone ? 0.55 : isCurrent ? 1 : 0.85,
                      scale: isCurrent ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      'absolute inset-0 rounded flex items-center justify-center text-[10px] font-bold pointer-events-none',
                      'bg-pink/25 text-pink border border-pink/50',
                    )}
                  >
                    {kernel[dy][dx]}
                  </motion.div>
                )}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}

function OutputGrid({
  data,
  oy,
  ox,
  maxAbs,
}: {
  data: Array<Array<number | null>>
  oy: number
  ox: number
  maxAbs: number
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold text-muted-foreground mb-1">Output {OUT_H}×{OUT_W}</div>
      <div className="grid gap-1 p-1.5 rounded-lg border-2 bg-card"
        style={{ gridTemplateColumns: `repeat(${OUT_W}, minmax(0, 1fr))` }}
      >
        {data.flatMap((row, y) =>
          row.map((v, x) => {
            const isCurrent = y === oy && x === ox
            const intensity = v === null ? 0 : Math.abs(v) / maxAbs
            const isNeg = (v ?? 0) < 0
            return (
              <div
                key={`${y}-${x}`}
                className={cn(
                  'w-9 h-9 md:w-10 md:h-10 rounded flex items-center justify-center text-[11px] font-mono border',
                  isCurrent && 'ring-2 ring-violet/70 font-bold',
                )}
                style={{
                  backgroundColor:
                    v === null
                      ? 'transparent'
                      : isNeg
                        ? `oklch(0.70 0.22 340 / ${0.15 + 0.55 * intensity})`
                        : `oklch(0.78 0.20 150 / ${0.15 + 0.55 * intensity})`,
                }}
              >
                {v === null ? '·' : v}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}

export default ConvolutionStepVisual
