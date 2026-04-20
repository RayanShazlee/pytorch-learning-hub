/**
 * MatMulStepVisual
 * ────────────────
 * Matrix multiplication is the single most important op in deep learning —
 * every Linear layer, every attention head, every embedding lookup boils
 * down to one. Most learners "know the formula" but have never actually
 * watched a single output cell get computed from a row · column dot product.
 *
 * This visual plays that computation out cell-by-cell. At step k:
 *   • The target cell C[i,j] is highlighted.
 *   • Row i of A and column j of B are shaded.
 *   • Every (A[i,t] × B[t,j]) pair pulses in sync.
 *   • The running sum appears character-by-character below.
 *
 * Controls: Play / Pause / Step / Reset + a shape picker (2×3 · 3×2 → 2×2,
 * 3×2 · 2×4 → 3×4, etc.) so learners can see that inner dim T is where the
 * sum lives.
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ArrowClockwise, SkipForward, Lightbulb } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Shape = { m: number; n: number; k: number; label: string }

const SHAPES: Shape[] = [
  { m: 2, n: 3, k: 2, label: '(2×3) · (3×2) → 2×2' },
  { m: 3, n: 2, k: 4, label: '(3×2) · (2×4) → 3×4' },
  { m: 2, n: 4, k: 3, label: '(2×4) · (4×3) → 2×3' },
]

// Deterministic small integers so the arithmetic is checkable in-head.
function seedMatrix(rows: number, cols: number, salt: number): number[][] {
  const out: number[][] = []
  let s = salt
  for (let i = 0; i < rows; i++) {
    const row: number[] = []
    for (let j = 0; j < cols; j++) {
      s = (s * 9301 + 49297) % 233280
      row.push(((s % 9) + 1) - 4) // -3 … 5
    }
    out.push(row)
  }
  return out
}

export function MatMulStepVisual() {
  const [shapeIdx, setShapeIdx] = useState(0)
  const shape = SHAPES[shapeIdx]
  const A = useMemo(() => seedMatrix(shape.m, shape.n, 7 + shapeIdx), [shape, shapeIdx])
  const B = useMemo(() => seedMatrix(shape.n, shape.k, 13 + shapeIdx), [shape, shapeIdx])

  // step = currentCell * innerDim + currentTermInSum
  // outputs produced in row-major order
  const totalCells = shape.m * shape.k
  const [cellIdx, setCellIdx] = useState(0) // which C[i,j] we're computing
  const [termIdx, setTermIdx] = useState(-1) // -1 = not started, 0..n-1 = term
  const [playing, setPlaying] = useState(false)

  const i = Math.floor(cellIdx / shape.k)
  const j = cellIdx % shape.k

  // C accumulated so far (full cells, up to cellIdx; partial for current)
  const C: Array<Array<number | null>> = useMemo(() => {
    const out: Array<Array<number | null>> = Array.from({ length: shape.m }, () =>
      Array(shape.k).fill(null),
    )
    for (let c = 0; c < cellIdx; c++) {
      const ii = Math.floor(c / shape.k)
      const jj = c % shape.k
      let s = 0
      for (let t = 0; t < shape.n; t++) s += A[ii][t] * B[t][jj]
      out[ii][jj] = s
    }
    if (termIdx >= 0) {
      let s = 0
      for (let t = 0; t <= termIdx; t++) s += A[i][t] * B[t][j]
      if (termIdx === shape.n - 1) {
        // cell finished but not advanced yet — still show it
        out[i][j] = s
      }
    }
    return out
  }, [A, B, shape, cellIdx, termIdx, i, j])

  const runningSum =
    termIdx < 0
      ? null
      : Array.from({ length: termIdx + 1 }, (_, t) => A[i][t] * B[t][j]).reduce(
          (a, b) => a + b,
          0,
        )

  // auto-play
  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => {
      advance()
    }, 650)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, cellIdx, termIdx])

  function advance() {
    if (termIdx < shape.n - 1) {
      setTermIdx((t) => t + 1)
      return
    }
    // finished this cell → move to next
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

  function changeShape(idx: number) {
    setShapeIdx(idx)
    setCellIdx(0)
    setTermIdx(-1)
    setPlaying(false)
  }

  const currentRow = i
  const currentCol = j
  const done = cellIdx === totalCells - 1 && termIdx === shape.n - 1

  return (
    <Card className="p-5 border-2 bg-gradient-to-br from-background via-violet/5 to-cyan/5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Lightbulb size={18} weight="fill" className="text-amber-500" />
            Matrix Multiply — one cell at a time
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Every <code className="bg-muted px-1 rounded">nn.Linear</code>, every attention head,
            every embedding lookup is this exact loop.
          </p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {SHAPES.map((s, idx) => (
            <Button
              key={idx}
              size="sm"
              variant={shapeIdx === idx ? 'default' : 'outline'}
              onClick={() => changeShape(idx)}
              className="text-[11px] h-7 px-2"
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* matrices */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-4">
        <Matrix
          label="A"
          data={A}
          highlightRow={currentRow}
          pulseCell={termIdx >= 0 ? { r: currentRow, c: termIdx } : null}
          accent="pink"
        />
        <div className="text-2xl font-bold text-muted-foreground select-none">×</div>
        <Matrix
          label="B"
          data={B}
          highlightCol={currentCol}
          pulseCell={termIdx >= 0 ? { r: termIdx, c: currentCol } : null}
          accent="cyan"
        />
        <div className="text-2xl font-bold text-muted-foreground select-none">=</div>
        <Matrix
          label="C"
          data={C}
          highlightRow={currentRow}
          highlightCol={currentCol}
          accent="violet"
          isOutput
        />
      </div>

      {/* running-sum panel */}
      <AnimatePresence mode="wait">
        {termIdx >= 0 && (
          <motion.div
            key={`${cellIdx}-${termIdx}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg bg-muted/40 border p-3 mb-3 font-mono text-xs md:text-sm overflow-x-auto"
          >
            <div className="text-muted-foreground mb-1">
              Computing <span className="text-violet font-semibold">C[{i},{j}]</span>:
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {Array.from({ length: termIdx + 1 }).map((_, t) => (
                <span key={t} className="inline-flex items-center gap-1">
                  {t > 0 && <span className="text-muted-foreground">+</span>}
                  <span className="px-1.5 py-0.5 rounded bg-pink/15 text-pink border border-pink/30">
                    {A[i][t]}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/30">
                    {B[t][j]}
                  </span>
                </span>
              ))}
              <span className="text-muted-foreground mx-1">=</span>
              <span className="px-2 py-0.5 rounded bg-violet/15 text-violet border border-violet/30 font-bold">
                {runningSum}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* controls */}
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
        Inner dim <span className="font-mono">n={shape.n}</span> is where the sum lives. The other two
        dims shape the output.
      </div>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

function Matrix({
  label,
  data,
  highlightRow,
  highlightCol,
  pulseCell,
  accent,
  isOutput,
}: {
  label: string
  data: Array<Array<number | null>>
  highlightRow?: number
  highlightCol?: number
  pulseCell?: { r: number; c: number } | null
  accent: 'pink' | 'cyan' | 'violet'
  isOutput?: boolean
}) {
  const accentRing: Record<string, string> = {
    pink: 'ring-pink/60',
    cyan: 'ring-cyan/60',
    violet: 'ring-violet/60',
  }
  const accentBg: Record<string, string> = {
    pink: 'bg-pink/15',
    cyan: 'bg-cyan/15',
    violet: 'bg-violet/15',
  }
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold text-muted-foreground mb-1">{label}</div>
      <div
        className="grid gap-1 p-1.5 rounded-lg border-2 bg-card"
        style={{ gridTemplateColumns: `repeat(${data[0]?.length ?? 1}, minmax(0, 1fr))` }}
      >
        {data.map((row, r) =>
          row.map((v, c) => {
            const rowMatch = highlightRow === r
            const colMatch = highlightCol === c
            const isTarget = isOutput && rowMatch && colMatch
            const pulse = pulseCell?.r === r && pulseCell?.c === c
            const faded = isOutput && v === null && !isTarget
            return (
              <motion.div
                key={`${r}-${c}`}
                animate={pulse ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  'w-9 h-9 md:w-10 md:h-10 rounded-md flex items-center justify-center text-xs md:text-sm font-mono',
                  'border border-border/60',
                  (rowMatch || colMatch) && !isOutput && accentBg[accent],
                  isTarget && `ring-2 ${accentRing[accent]} font-bold bg-violet/20`,
                  faded && 'opacity-30',
                )}
              >
                {v === null ? '·' : v}
              </motion.div>
            )
          }),
        )}
      </div>
    </div>
  )
}

export default MatMulStepVisual
