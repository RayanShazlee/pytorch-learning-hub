import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

/**
 * Transformer-Explainer-style attention visual.
 * For a small sentence:
 *  - show Q, K, V vectors (fake but deterministic)
 *  - compute attention matrix = softmax(Q·K^T / √d)
 *  - highlight one query token, show its attention distribution over all keys
 *  - show weighted sum producing output.
 */

const EXAMPLES = [
  ['The', 'cat', 'sat', 'on', 'mat'],
  ['AI', 'learns', 'from', 'data'],
  ['I', 'love', 'PyTorch', 'now'],
]

const D = 4 // key/query dimension

function pseudoRand(seed: number) {
  let s = Math.sin(seed) * 10000
  return s - Math.floor(s)
}

function makeQKV(words: string[]) {
  const Q: number[][] = []
  const K: number[][] = []
  const V: number[][] = []
  for (let i = 0; i < words.length; i++) {
    const q: number[] = []
    const k: number[] = []
    const v: number[] = []
    for (let j = 0; j < D; j++) {
      q.push(pseudoRand(i * 11 + j * 3 + 1) * 2 - 1)
      k.push(pseudoRand(i * 13 + j * 5 + 2) * 2 - 1)
      v.push(pseudoRand(i * 17 + j * 7 + 3) * 2 - 1)
    }
    Q.push(q)
    K.push(k)
    V.push(v)
  }
  return { Q, K, V }
}

function attention(Q: number[][], K: number[][]) {
  const n = Q.length
  const scores: number[][] = []
  for (let i = 0; i < n; i++) {
    const row: number[] = []
    for (let j = 0; j < n; j++) {
      let s = 0
      for (let d = 0; d < D; d++) s += Q[i][d] * K[j][d]
      row.push(s / Math.sqrt(D))
    }
    scores.push(row)
  }
  // softmax per row
  const probs: number[][] = scores.map((row) => {
    const m = Math.max(...row)
    const exps = row.map((v) => Math.exp(v - m))
    const sum = exps.reduce((a, b) => a + b, 0)
    return exps.map((e) => e / sum)
  })
  return { scores, probs }
}

function cellBG(v: number, max: number) {
  const t = Math.min(1, Math.abs(v) / max)
  if (v >= 0) return `rgba(168, 85, 247, ${0.15 + t * 0.75})`
  return `rgba(37, 99, 235, ${0.15 + t * 0.75})`
}

export function AttentionHeatmapVisual() {
  const [idx, setIdx] = useState(0)
  const [query, setQuery] = useState(1)

  const words = EXAMPLES[idx]
  const { Q, K, V } = useMemo(() => makeQKV(words), [words])
  const { probs } = useMemo(() => attention(Q, K), [Q, K])

  const n = words.length
  const row = probs[query]
  const maxQK = Math.max(...Q.flat().concat(K.flat()).map(Math.abs), 0.5)
  const maxV = Math.max(...V.flat().map(Math.abs), 0.5)

  // weighted output vector = Σ row[j] * V[j]
  const outVec = Array(D).fill(0)
  for (let j = 0; j < n; j++) for (let d = 0; d < D; d++) outVec[d] += row[j] * V[j][d]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex, i) => (
          <Button key={i} size="sm" variant={idx === i ? 'default' : 'outline'} onClick={() => { setIdx(i); setQuery(1) }}>
            {ex.join(' ')}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 space-y-3">
        {/* Query selector */}
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <span className="text-xs text-muted-foreground">Query token:</span>
          {words.map((w, i) => (
            <Button key={i} size="sm" variant={query === i ? 'default' : 'outline'} onClick={() => setQuery(i)}>
              {w}
            </Button>
          ))}
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto">
          <div className="inline-block">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-20" />
              {words.map((w, j) => (
                <div key={j} className="w-12 text-center text-[10px] font-mono text-muted-foreground">key: {w}</div>
              ))}
            </div>
            {probs.map((r, i) => (
              <div key={i} className="flex items-center gap-1 mb-0.5">
                <div className="w-20 text-right text-xs font-mono font-bold pr-1" style={{ opacity: query === i ? 1 : 0.4 }}>Q: {words[i]}</div>
                {r.map((v, j) => (
                  <motion.div
                    key={j}
                    animate={{ scale: query === i ? 1.05 : 1 }}
                    className="w-12 h-10 flex items-center justify-center text-xs font-mono rounded"
                    style={{
                      backgroundColor: cellBG(v, 1),
                      outline: query === i ? '1px solid rgba(168,85,247,0.7)' : 'none',
                      color: v > 0.5 ? 'white' : 'currentColor',
                    }}
                  >
                    {(v * 100).toFixed(0)}%
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Q·K·V pipeline for selected query */}
        <div className="rounded-xl bg-background p-3 border">
          <div className="text-xs font-bold mb-2">
            Computing attention for <span className="text-violet-500">"{words[query]}"</span>:
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex flex-col items-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Q[{words[query]}]</div>
              <div className="flex gap-0.5">
                {Q[query].map((v, i) => (
                  <div key={i} className="w-6 h-6 rounded text-[8px] flex items-center justify-center font-mono" style={{ backgroundColor: cellBG(v, maxQK), color: Math.abs(v) > maxQK * 0.5 ? 'white' : 'currentColor' }}>{v.toFixed(1)}</div>
                ))}
              </div>
            </div>
            <div className="text-lg">·</div>
            <div className="flex flex-col items-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">K^T</div>
              <div className="flex gap-0.5">
                {words.map((_, j) => (
                  <div key={j} className="flex flex-col gap-0.5">
                    {K[j].map((v, d) => (
                      <div key={d} className="w-5 h-5 rounded text-[8px] flex items-center justify-center font-mono" style={{ backgroundColor: cellBG(v, maxQK), color: Math.abs(v) > maxQK * 0.5 ? 'white' : 'currentColor' }}>{v.toFixed(1)}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-lg">→</div>
            <div className="flex flex-col items-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">softmax → weights</div>
              <div className="flex gap-0.5">
                {row.map((v, j) => (
                  <div key={j} className="w-12 flex flex-col items-center">
                    <div className="w-full rounded-sm" style={{ height: `${Math.max(2, v * 40)}px`, backgroundColor: '#a855f7' }} />
                    <span className="text-[8px] font-mono mt-0.5">{(v * 100).toFixed(0)}%</span>
                    <span className="text-[8px] text-muted-foreground">{words[j]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-lg">·</div>
            <div className="flex flex-col items-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">V</div>
              <div className="flex gap-0.5">
                {words.map((_, j) => (
                  <div key={j} className="flex flex-col gap-0.5" style={{ opacity: 0.4 + row[j] * 0.6 }}>
                    {V[j].map((v, d) => (
                      <div key={d} className="w-5 h-5 rounded text-[8px] flex items-center justify-center font-mono" style={{ backgroundColor: cellBG(v, maxV), color: Math.abs(v) > maxV * 0.5 ? 'white' : 'currentColor' }}>{v.toFixed(1)}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-lg">=</div>
            <div className="flex flex-col items-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">output</div>
              <div className="flex gap-0.5">
                {outVec.map((v, i) => (
                  <div key={i} className="w-7 h-7 rounded text-[9px] flex items-center justify-center font-mono border-2 border-emerald-500" style={{ backgroundColor: cellBG(v, maxV), color: Math.abs(v) > maxV * 0.5 ? 'white' : 'currentColor' }}>{v.toFixed(2)}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>Self-attention</strong>: every token decides how much to "listen to" every other token. Weights come from <code>softmax(QK^T/√d)</code>. The output is a
        weighted blend of Value vectors. Stack 12+ of these (GPT-2) and the model learns rich context.
      </p>
    </div>
  )
}
