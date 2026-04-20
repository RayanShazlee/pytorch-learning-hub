import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Play, Pause } from '@phosphor-icons/react'

/**
 * Full CNN pipeline: Input → Conv (kernel slides) → ReLU → MaxPool
 * Inspired by CNN Explainer (Polo Club).
 */

const IMG_SIZE = 8
// a tiny "cross" image
function makeImage(): number[][] {
  const img: number[][] = Array.from({ length: IMG_SIZE }, () => Array(IMG_SIZE).fill(0.15))
  for (let i = 1; i < IMG_SIZE - 1; i++) {
    img[Math.floor(IMG_SIZE / 2)][i] = 0.9
    img[i][Math.floor(IMG_SIZE / 2)] = 0.9
  }
  return img
}

const KERNELS: { name: string; k: number[][]; color: string }[] = [
  { name: 'Edge ↕', k: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]], color: '#f97316' },
  { name: 'Edge ↔', k: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], color: '#8b5cf6' },
  { name: 'Sharpen', k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], color: '#ec4899' },
  { name: 'Blur', k: [[0.11, 0.11, 0.11], [0.11, 0.11, 0.11], [0.11, 0.11, 0.11]], color: '#14b8a6' },
]

function convolve(img: number[][], k: number[][]): number[][] {
  const out: number[][] = []
  for (let i = 0; i < IMG_SIZE - 2; i++) {
    const row: number[] = []
    for (let j = 0; j < IMG_SIZE - 2; j++) {
      let s = 0
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) s += img[i + a][j + b] * k[a][b]
      row.push(s)
    }
    out.push(row)
  }
  return out
}

function relu(m: number[][]) { return m.map((r) => r.map((v) => Math.max(0, v))) }

function maxPool(m: number[][]): number[][] {
  const out: number[][] = []
  for (let i = 0; i < m.length; i += 2) {
    const row: number[] = []
    for (let j = 0; j < m[0].length; j += 2) {
      const vals = [m[i]?.[j], m[i]?.[j + 1], m[i + 1]?.[j], m[i + 1]?.[j + 1]].filter((v) => v !== undefined) as number[]
      row.push(Math.max(...vals))
    }
    out.push(row)
  }
  return out
}

function Cell({ v, max, size = 1.5, outline }: { v: number; max: number; size?: number; outline?: string }) {
  const t = Math.min(1, Math.abs(v) / max)
  const bg = v >= 0 ? `rgba(${30 + t * 220}, ${80 + t * 50}, ${230 - t * 150}, ${0.3 + t * 0.7})` : `rgba(220, 80, 60, ${0.4 + t * 0.6})`
  return (
    <div
      className="flex items-center justify-center rounded-sm text-[8px] font-mono"
      style={{ width: `${size}rem`, height: `${size}rem`, backgroundColor: bg, outline: outline ? `2px solid ${outline}` : 'none', color: t > 0.5 ? 'white' : 'rgba(0,0,0,0.7)' }}
    >
      {size >= 1.5 ? v.toFixed(1) : ''}
    </div>
  )
}

function Grid({ M, max, cellSize, highlight }: { M: number[][]; max: number; cellSize?: number; highlight?: { r: number; c: number; size: number; color: string } }) {
  return (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${M[0].length}, ${cellSize || 1.5}rem)`, position: 'relative' }}>
      {M.flatMap((row, r) => row.map((v, c) => <Cell key={`${r}-${c}`} v={v} max={max} size={cellSize} />))}
      {highlight && (
        <div
          className="absolute pointer-events-none rounded-sm border-2"
          style={{
            borderColor: highlight.color,
            width: `${highlight.size * (cellSize || 1.5)}rem`,
            height: `${highlight.size * (cellSize || 1.5)}rem`,
            transform: `translate(${highlight.c * ((cellSize || 1.5) + 0.125)}rem, ${highlight.r * ((cellSize || 1.5) + 0.125)}rem)`,
            transition: 'transform 0.15s',
          }}
        />
      )}
    </div>
  )
}

export function CNNFeatureMapVisual() {
  const image = useMemo(() => makeImage(), [])
  const [kIdx, setKIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0) // 0..(6*6-1)

  const kernel = KERNELS[kIdx]
  const convOut = useMemo(() => convolve(image, kernel.k), [image, kernel])
  const reluOut = useMemo(() => relu(convOut), [convOut])
  const poolOut = useMemo(() => maxPool(reluOut), [reluOut])

  const maxConv = Math.max(...convOut.flat().map(Math.abs), 0.5)
  const maxPool_ = Math.max(...poolOut.flat(), 0.5)
  const kMax = Math.max(...kernel.k.flat().map(Math.abs), 0.5)

  const totalPos = (IMG_SIZE - 2) * (IMG_SIZE - 2)
  const curR = Math.floor(pos / (IMG_SIZE - 2))
  const curC = pos % (IMG_SIZE - 2)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setPos((p) => (p + 1) % totalPos), 200)
    return () => clearInterval(id)
  }, [playing, totalPos])

  useEffect(() => { setPos(0) }, [kIdx])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        {KERNELS.map((k, i) => (
          <Button key={i} size="sm" variant={kIdx === i ? 'default' : 'outline'} onClick={() => setKIdx(i)} style={kIdx === i ? { backgroundColor: k.color, color: 'white' } : {}}>
            {k.name}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => setPlaying(!playing)}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
          <span className="ml-1">{playing ? 'Pause' : 'Scan'}</span>
        </Button>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 overflow-x-auto">
        <div className="flex items-start gap-4 justify-center min-w-fit">
          {/* Input + highlight */}
          <div className="text-center">
            <div className="text-xs font-bold text-muted-foreground mb-1">Input (8×8)</div>
            <Grid M={image} max={1} cellSize={1.5} highlight={{ r: curR, c: curC, size: 3, color: kernel.color }} />
          </div>

          <div className="text-2xl self-center">⊗</div>

          {/* Kernel */}
          <div className="text-center">
            <div className="text-xs font-bold text-muted-foreground mb-1">Kernel (3×3)</div>
            <Grid M={kernel.k} max={kMax} cellSize={1.75} />
          </div>

          <div className="text-2xl self-center">=</div>

          {/* Conv output */}
          <div className="text-center">
            <div className="text-xs font-bold text-muted-foreground mb-1">Conv (6×6)</div>
            <Grid M={convOut} max={maxConv} cellSize={1.25} highlight={{ r: curR, c: curC, size: 1, color: kernel.color }} />
          </div>

          <div className="text-xl self-center">→</div>

          {/* ReLU */}
          <div className="text-center">
            <div className="text-xs font-bold text-muted-foreground mb-1">ReLU</div>
            <Grid M={reluOut} max={maxConv} cellSize={1.25} />
          </div>

          <div className="text-xl self-center">→</div>

          {/* MaxPool */}
          <div className="text-center">
            <div className="text-xs font-bold text-muted-foreground mb-1">MaxPool 2×2</div>
            <Grid M={poolOut} max={maxPool_} cellSize={1.75} />
          </div>
        </div>

        <div className="mt-3 text-center text-xs font-mono">
          <span className="text-muted-foreground">output[{curR},{curC}] = Σ image · kernel = </span>
          <span className="font-bold">{convOut[curR][curC].toFixed(2)}</span>
          <span className="text-muted-foreground"> → ReLU → </span>
          <span className="font-bold">{Math.max(0, convOut[curR][curC]).toFixed(2)}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        The kernel <em>slides</em> over the image, computing a weighted sum at each position. Each kernel detects a different pattern (edges, textures, shapes). Real CNNs learn 10s–1000s of these kernels per layer.
      </p>
    </div>
  )
}
