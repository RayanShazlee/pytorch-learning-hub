import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Computer Vision pipeline visual.
 * Shows how an image flows through: RGB → grayscale → edges → classification.
 */

type Task = 'classify' | 'detect' | 'segment'

const TASKS: { key: Task; label: string; emoji: string }[] = [
  { key: 'classify', label: 'Classification', emoji: '🏷️' },
  { key: 'detect', label: 'Detection', emoji: '📦' },
  { key: 'segment', label: 'Segmentation', emoji: '🎨' },
]

// Create a 12x12 pseudo image with a "cat" silhouette
const IMG_SIZE = 12
function makeImage(): { r: number; g: number; b: number }[][] {
  const img: { r: number; g: number; b: number }[][] = []
  for (let i = 0; i < IMG_SIZE; i++) {
    const row: { r: number; g: number; b: number }[] = []
    for (let j = 0; j < IMG_SIZE; j++) {
      // bluish sky background
      let r = 135, g = 180, b = 230
      // cat body oval
      const dx = j - 6
      const dy = i - 7
      if (dx * dx / 9 + dy * dy / 4 <= 1) { r = 180; g = 140; b = 90 }
      // cat head
      if ((j - 4) ** 2 + (i - 4) ** 2 <= 3) { r = 200; g = 150; b = 100 }
      // ears
      if ((j === 3 && i === 2) || (j === 5 && i === 2)) { r = 150; g = 110; b = 80 }
      // ground
      if (i >= 10) { r = 120; g = 160; b = 90 }
      row.push({ r, g, b })
    }
    img.push(row)
  }
  return img
}

export function CVVisualizer() {
  const [task, setTask] = useState<Task>('classify')
  const img = useMemo(() => makeImage(), [])

  // pre-compute derived views
  const gray = useMemo(() => img.map((r) => r.map((p) => 0.3 * p.r + 0.59 * p.g + 0.11 * p.b)), [img])
  const edges = useMemo(() => {
    const out: number[][] = []
    for (let i = 0; i < IMG_SIZE; i++) {
      const row: number[] = []
      for (let j = 0; j < IMG_SIZE; j++) {
        const l = gray[i][j - 1] ?? gray[i][j]
        const r = gray[i][j + 1] ?? gray[i][j]
        const t = gray[i - 1]?.[j] ?? gray[i][j]
        const b = gray[i + 1]?.[j] ?? gray[i][j]
        const gx = r - l
        const gy = b - t
        row.push(Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.4))
      }
      out.push(row)
    }
    return out
  }, [gray])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        {TASKS.map((t) => (
          <Button key={t.key} size="sm" variant={task === t.key ? 'default' : 'outline'} onClick={() => setTask(t.key)}>
            {t.emoji} {t.label}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 space-y-3">
        <div className="flex flex-wrap gap-3 justify-center items-start">
          {/* Original */}
          <div className="text-center">
            <div className="text-xs font-bold text-muted-foreground mb-1">Input (RGB)</div>
            <div className="relative">
              <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${IMG_SIZE}, 1rem)` }}>
                {img.flatMap((row, i) => row.map((p, j) => <div key={`${i}-${j}`} className="w-4 h-4" style={{ backgroundColor: `rgb(${p.r},${p.g},${p.b})` }} />))}
              </div>
              {/* task overlays */}
              {task === 'detect' && (
                <div className="absolute border-2 border-red-500 rounded pointer-events-none" style={{ left: '1rem', top: '0.5rem', width: '6rem', height: '7rem' }}>
                  <div className="absolute -top-4 left-0 bg-red-500 text-white text-[10px] px-1 rounded-sm">cat 0.97</div>
                </div>
              )}
              {task === 'segment' && (
                <div className="absolute inset-0 pointer-events-none grid gap-0" style={{ gridTemplateColumns: `repeat(${IMG_SIZE}, 1rem)` }}>
                  {img.flatMap((row, i) => row.map((p, j) => {
                    const isCat = p.r > 150 && p.g > 100 && p.g < 160 && p.b < 120
                    return <div key={`s${i}-${j}`} className="w-4 h-4" style={{ backgroundColor: isCat ? 'rgba(239,68,68,0.55)' : 'transparent' }} />
                  }))}
                </div>
              )}
            </div>
          </div>

          <div className="text-xl self-center">→</div>

          {/* Grayscale */}
          <div className="text-center">
            <div className="text-xs font-bold text-muted-foreground mb-1">Grayscale</div>
            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${IMG_SIZE}, 1rem)` }}>
              {gray.flatMap((row, i) => row.map((v, j) => <div key={`${i}-${j}`} className="w-4 h-4" style={{ backgroundColor: `rgb(${v},${v},${v})` }} />))}
            </div>
          </div>

          <div className="text-xl self-center">→</div>

          {/* Edges */}
          <div className="text-center">
            <div className="text-xs font-bold text-muted-foreground mb-1">Edges (Sobel)</div>
            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${IMG_SIZE}, 1rem)` }}>
              {edges.flatMap((row, i) => row.map((v, j) => {
                const c = Math.round(Math.min(255, v * 1.5))
                return <div key={`${i}-${j}`} className="w-4 h-4" style={{ backgroundColor: `rgb(${c},${c},${c})` }} />
              }))}
            </div>
          </div>

          <div className="text-xl self-center">→</div>

          {/* Output per task */}
          <div className="text-center">
            <div className="text-xs font-bold text-muted-foreground mb-1">Output</div>
            {task === 'classify' && (
              <div className="space-y-1 text-left">
                {[['cat', 0.94], ['dog', 0.04], ['bird', 0.01], ['car', 0.01]].map(([name, p]) => (
                  <div key={name as string} className="flex items-center gap-1 text-xs">
                    <span className="w-10">{name}</span>
                    <div className="h-2 rounded bg-muted flex-1 min-w-[80px]"><div className="h-full rounded bg-emerald-500" style={{ width: `${(p as number) * 100}%` }} /></div>
                    <span className="font-mono text-[10px] w-10">{((p as number) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
            {task === 'detect' && (
              <div className="text-xs space-y-1">
                <div className="rounded bg-red-500 text-white px-2 py-1 inline-block">cat (0.97)</div>
                <div className="text-muted-foreground">box: (1,0) → (7,7)</div>
                <div className="text-muted-foreground">area: 49 px</div>
              </div>
            )}
            {task === 'segment' && (
              <div className="text-xs space-y-1">
                <div className="rounded bg-red-500/60 text-white px-2 py-1 inline-block">cat pixels</div>
                <div className="text-muted-foreground">per-pixel mask</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Classical computer vision pipeline: raw pixels → features (edges, textures) → task-specific head. Modern CNNs learn all of this end-to-end from data.
      </p>
    </div>
  )
}
