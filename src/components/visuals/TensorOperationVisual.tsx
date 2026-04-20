import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

/**
 * Interactive matrix / tensor operation playground:
 *  - Element-wise add
 *  - Element-wise multiply
 *  - Matrix multiply (with animated row·col dot product)
 *  - Broadcasting (vector + matrix)
 */

type Op = 'add' | 'mul' | 'matmul' | 'broadcast'

const OPS: { key: Op; label: string; emoji: string; formula: string }[] = [
  { key: 'add', label: 'Add', emoji: '➕', formula: 'C[i,j] = A[i,j] + B[i,j]' },
  { key: 'mul', label: 'Multiply', emoji: '✖️', formula: 'C[i,j] = A[i,j] · B[i,j]' },
  { key: 'matmul', label: 'Matmul', emoji: '🔗', formula: 'C[i,j] = Σ A[i,k] · B[k,j]' },
  { key: 'broadcast', label: 'Broadcast', emoji: '📡', formula: 'C[i,j] = A[i,j] + v[j]' },
]

const A: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
]
const B: number[][] = [
  [2, 0, 1],
  [1, 3, 2],
]
const Bmm: number[][] = [
  [1, 2],
  [0, 1],
  [3, 1],
]
const vec = [10, 20, 30]

function cellColor(v: number, max: number) {
  const t = Math.min(1, Math.abs(v) / max)
  if (v >= 0) {
    const r = Math.round(251 - t * 40)
    const g = Math.round(146 - t * 60)
    const b = Math.round(60 - t * 30)
    return `rgb(${r},${g},${b})`
  }
  return `rgb(37,99,235)`
}

function Matrix({ M, highlight }: { M: number[][]; highlight?: (r: number, c: number) => boolean }) {
  const max = Math.max(...M.flat().map((v) => Math.abs(v)), 1)
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${M[0].length}, 2.5rem)` }}>
      {M.map((row, r) =>
        row.map((v, c) => (
          <motion.div
            key={`${r}-${c}`}
            animate={{ scale: highlight?.(r, c) ? 1.15 : 1 }}
            className="w-10 h-10 rounded-lg text-white text-sm font-mono font-bold flex items-center justify-center shadow"
            style={{
              backgroundColor: cellColor(v, max),
              outline: highlight?.(r, c) ? '3px solid #fbbf24' : 'none',
            }}
          >
            {v}
          </motion.div>
        ))
      )}
    </div>
  )
}

export function TensorOperationVisual() {
  const [op, setOp] = useState<Op>('matmul')
  const [step, setStep] = useState(0) // only used for matmul

  const current = OPS.find((o) => o.key === op)!

  const result = useMemo(() => {
    if (op === 'add') return A.map((row, i) => row.map((v, j) => v + B[i][j]))
    if (op === 'mul') return A.map((row, i) => row.map((v, j) => v * B[i][j]))
    if (op === 'broadcast') return A.map((row) => row.map((v, j) => v + vec[j]))
    // matmul: A(2x3) · Bmm(3x2) = C(2x2)
    const C: number[][] = [
      [0, 0],
      [0, 0],
    ]
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        let s = 0
        for (let k = 0; k < 3; k++) s += A[i][k] * Bmm[k][j]
        C[i][j] = s
      }
    }
    return C
  }, [op])

  const totalCells = op === 'matmul' ? 4 : 6
  const curIdx = Math.min(step, totalCells - 1)
  const curR = op === 'matmul' ? Math.floor(curIdx / 2) : Math.floor(curIdx / 3)
  const curC = op === 'matmul' ? curIdx % 2 : curIdx % 3

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        {OPS.map((o) => (
          <Button key={o.key} size="sm" variant={op === o.key ? 'default' : 'outline'} onClick={() => { setOp(o.key); setStep(0) }}>
            {o.emoji} {o.label}
          </Button>
        ))}
      </div>

      <div className="text-center text-sm">
        <code className="bg-muted px-2 py-1 rounded">{current.formula}</code>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* A */}
          <div className="text-center">
            <div className="text-xs font-bold text-muted-foreground mb-1">A {op === 'matmul' ? '(2×3)' : '(2×3)'}</div>
            <Matrix M={A} highlight={(r) => op === 'matmul' && r === curR} />
          </div>
          <div className="text-2xl">{op === 'matmul' ? '·' : op === 'mul' ? '×' : '+'}</div>

          {/* B or vec */}
          {op === 'broadcast' ? (
            <div className="text-center">
              <div className="text-xs font-bold text-muted-foreground mb-1">v (3,)</div>
              <div className="flex gap-1 justify-center">
                {vec.map((v, j) => (
                  <div key={j} className="w-10 h-10 rounded-lg text-white text-sm font-mono font-bold flex items-center justify-center shadow" style={{ backgroundColor: cellColor(v, 30) }}>
                    {v}
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">broadcast ↓ each row</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xs font-bold text-muted-foreground mb-1">B {op === 'matmul' ? '(3×2)' : '(2×3)'}</div>
              <Matrix M={op === 'matmul' ? Bmm : B} highlight={(_, c) => op === 'matmul' && c === curC} />
            </div>
          )}

          <div className="text-2xl">=</div>

          {/* Result */}
          <div className="text-center">
            <div className="text-xs font-bold text-muted-foreground mb-1">
              C {op === 'matmul' ? '(2×2)' : '(2×3)'}
            </div>
            <Matrix M={result} highlight={(r, c) => r === curR && c === curC && op === 'matmul'} />
          </div>
        </div>

        {op === 'matmul' && (
          <div className="mt-4 text-center">
            <Button size="sm" variant="outline" onClick={() => setStep((s) => (s + 1) % 4)}>
              Next cell → C[{curR},{curC}]
            </Button>
            <div className="mt-2 font-mono text-sm">
              C[{curR},{curC}] ={' '}
              {[0, 1, 2].map((k) => (
                <span key={k}>
                  {k > 0 && ' + '}
                  <span className="text-orange-500">{A[curR][k]}</span>·<span className="text-blue-500">{Bmm[k][curC]}</span>
                </span>
              ))}{' '}
              = <span className="font-bold">{result[curR][curC]}</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Matmul is the heart of neural networks: every dense layer is <code>output = input @ W + b</code>. Broadcasting lets a small tensor act on a larger one without copying memory.
      </p>
    </div>
  )
}
