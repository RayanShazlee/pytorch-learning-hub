import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Word {
  text: string
  x: number
  y: number
  category: string
}

const WORD_SETS: { label: string; words: Word[] }[] = [
  {
    label: 'Animals & Objects',
    words: [
      { text: 'cat', x: 120, y: 80, category: 'animal' },
      { text: 'dog', x: 150, y: 110, category: 'animal' },
      { text: 'kitten', x: 100, y: 60, category: 'animal' },
      { text: 'puppy', x: 170, y: 130, category: 'animal' },
      { text: 'fish', x: 80, y: 140, category: 'animal' },
      { text: 'car', x: 350, y: 220, category: 'vehicle' },
      { text: 'truck', x: 380, y: 250, category: 'vehicle' },
      { text: 'bus', x: 320, y: 240, category: 'vehicle' },
      { text: 'bike', x: 370, y: 190, category: 'vehicle' },
      { text: 'king', x: 220, y: 300, category: 'royalty' },
      { text: 'queen', x: 260, y: 320, category: 'royalty' },
      { text: 'prince', x: 200, y: 330, category: 'royalty' },
      { text: 'princess', x: 280, y: 350, category: 'royalty' },
    ],
  },
  {
    label: 'Emotions',
    words: [
      { text: 'happy', x: 100, y: 80, category: 'positive' },
      { text: 'joy', x: 130, y: 60, category: 'positive' },
      { text: 'glad', x: 80, y: 100, category: 'positive' },
      { text: 'delighted', x: 150, y: 100, category: 'positive' },
      { text: 'sad', x: 350, y: 80, category: 'negative' },
      { text: 'angry', x: 380, y: 100, category: 'negative' },
      { text: 'upset', x: 330, y: 60, category: 'negative' },
      { text: 'furious', x: 370, y: 120, category: 'negative' },
      { text: 'calm', x: 200, y: 280, category: 'neutral' },
      { text: 'peaceful', x: 170, y: 300, category: 'neutral' },
      { text: 'serene', x: 230, y: 310, category: 'neutral' },
      { text: 'quiet', x: 240, y: 280, category: 'neutral' },
    ],
  },
  {
    label: 'Programming',
    words: [
      { text: 'Python', x: 100, y: 100, category: 'language' },
      { text: 'JavaScript', x: 130, y: 130, category: 'language' },
      { text: 'TypeScript', x: 150, y: 110, category: 'language' },
      { text: 'Rust', x: 80, y: 80, category: 'language' },
      { text: 'function', x: 320, y: 100, category: 'concept' },
      { text: 'variable', x: 350, y: 130, category: 'concept' },
      { text: 'loop', x: 300, y: 80, category: 'concept' },
      { text: 'class', x: 370, y: 110, category: 'concept' },
      { text: 'PyTorch', x: 160, y: 300, category: 'framework' },
      { text: 'TensorFlow', x: 200, y: 280, category: 'framework' },
      { text: 'React', x: 280, y: 300, category: 'framework' },
      { text: 'NumPy', x: 130, y: 280, category: 'framework' },
    ],
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  animal: 'oklch(0.7 0.2 200)',
  vehicle: 'oklch(0.72 0.19 140)',
  royalty: 'oklch(0.65 0.25 350)',
  positive: 'oklch(0.72 0.19 140)',
  negative: 'oklch(0.65 0.2 25)',
  neutral: 'oklch(0.6 0.22 280)',
  language: 'oklch(0.7 0.2 200)',
  concept: 'oklch(0.72 0.19 140)',
  framework: 'oklch(0.65 0.25 350)',
}

function cosine(a: Word, b: Word): number {
  // Distance-based similarity (closer = more similar)
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  return Math.max(0, 1 - dist / 400)
}

export function EmbeddingSpaceVisual() {
  const [setIdx, setSetIdx] = useState(0)
  const [selectedWord, setSelectedWord] = useState<number | null>(null)
  const [showArithmetic, setShowArithmetic] = useState(false)

  const wordSet = WORD_SETS[setIdx]
  const WIDTH = 480
  const HEIGHT = 400

  const similarities = useMemo(() => {
    if (selectedWord === null) return []
    const w = wordSet.words[selectedWord]
    return wordSet.words.map((other, i) => ({
      idx: i,
      sim: i === selectedWord ? 1 : cosine(w, other),
    })).sort((a, b) => b.sim - a.sim)
  }, [selectedWord, setIdx])

  const categories = useMemo(() => {
    const cats = new Set(wordSet.words.map(w => w.category))
    return Array.from(cats)
  }, [setIdx])

  return (
    <Card className="bg-gradient-to-br from-pink/5 to-violet/5 border-pink/20">
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-pink to-violet bg-clip-text text-transparent">
          Word Embedding Space
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Words with similar meanings cluster together in vector space. Click a word to see its nearest neighbors.
        </p>

        <div className="flex gap-2 mb-4 flex-wrap">
          {WORD_SETS.map((ws, i) => (
            <Button
              key={i}
              size="sm"
              variant={i === setIdx ? 'default' : 'outline'}
              onClick={() => { setSetIdx(i); setSelectedWord(null); setShowArithmetic(false) }}
            >
              {ws.label}
            </Button>
          ))}
          {setIdx === 0 && (
            <Button
              size="sm"
              variant={showArithmetic ? 'default' : 'outline'}
              onClick={() => setShowArithmetic(!showArithmetic)}
              className="ml-auto"
            >
              Vector Arithmetic
            </Button>
          )}
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          {/* 2D space */}
          <svg width="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="bg-card rounded-xl border max-w-md">
            {/* Category clusters (light backgrounds) */}
            {wordSet.words.map((w, i) => {
              const clusterWords = wordSet.words.filter(ww => ww.category === w.category)
              if (clusterWords[0] !== w) return null // Draw cluster bg only once
              const cx = clusterWords.reduce((s, ww) => s + ww.x, 0) / clusterWords.length
              const cy = clusterWords.reduce((s, ww) => s + ww.y, 0) / clusterWords.length
              return (
                <circle
                  key={`cluster-${w.category}`}
                  cx={cx} cy={cy} r={80}
                  fill={CATEGORY_COLORS[w.category]}
                  opacity={0.08}
                />
              )
            })}

            {/* Similarity lines */}
            {selectedWord !== null && similarities.slice(0, 4).map(({ idx, sim }) => {
              if (idx === selectedWord) return null
              const from = wordSet.words[selectedWord]
              const to = wordSet.words[idx]
              return (
                <line
                  key={`line-${idx}`}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={CATEGORY_COLORS[to.category]}
                  strokeWidth={sim * 3}
                  opacity={0.4}
                  strokeDasharray="4 2"
                />
              )
            })}

            {/* Vector arithmetic arrow */}
            {showArithmetic && setIdx === 0 && (
              <g>
                {/* king -> queen line */}
                <line x1={220} y1={300} x2={260} y2={320} stroke="oklch(0.8 0.2 60)" strokeWidth={2} markerEnd="url(#arrow)" />
                {/* prince -> princess line (same direction) */}
                <line x1={200} y1={330} x2={280} y2={350} stroke="oklch(0.8 0.2 60)" strokeWidth={2} strokeDasharray="4 2" markerEnd="url(#arrow)" />
                <text x={250} y={290} fontSize="9" fill="oklch(0.8 0.2 60)" textAnchor="middle" fontWeight="bold">
                  king - man + woman ≈ queen
                </text>
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="oklch(0.8 0.2 60)" />
                  </marker>
                </defs>
              </g>
            )}

            {/* Words */}
            {wordSet.words.map((w, i) => {
              const isSelected = selectedWord === i
              const isNeighbor = selectedWord !== null && similarities.slice(0, 4).some(s => s.idx === i)
              const color = CATEGORY_COLORS[w.category]
              return (
                <g
                  key={i}
                  onClick={() => setSelectedWord(isSelected ? null : i)}
                  style={{ cursor: 'pointer' }}
                >
                  <motion.circle
                    cx={w.x} cy={w.y} r={isSelected ? 8 : 5}
                    fill={color}
                    stroke={isSelected ? 'white' : 'none'}
                    strokeWidth={2}
                    animate={{ scale: isSelected ? 1.3 : isNeighbor ? 1.15 : 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                  <text
                    x={w.x} y={w.y - 10}
                    fontSize={isSelected ? '12' : '10'}
                    fontWeight={isSelected || isNeighbor ? 'bold' : 'normal'}
                    fill={color}
                    textAnchor="middle"
                  >
                    {w.text}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Info panel */}
          <div className="space-y-3 min-w-[160px]">
            {/* Category legend */}
            <div className="p-3 rounded-lg border bg-card">
              <p className="text-xs font-bold mb-2">Categories</p>
              {categories.map(cat => (
                <div key={cat} className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[cat] }} />
                  <span className="text-[11px] capitalize">{cat}</span>
                </div>
              ))}
            </div>

            {/* Selected word info */}
            {selectedWord !== null && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg border bg-card"
              >
                <p className="text-xs font-bold mb-2">
                  Nearest to "<span style={{ color: CATEGORY_COLORS[wordSet.words[selectedWord].category] }}>{wordSet.words[selectedWord].text}</span>"
                </p>
                {similarities.slice(1, 5).map(({ idx, sim }) => (
                  <div key={idx} className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${sim * 100}%`, background: CATEGORY_COLORS[wordSet.words[idx].category] }}
                      />
                    </div>
                    <span className="text-[10px] font-mono w-16 truncate">{wordSet.words[idx].text}</span>
                    <span className="text-[9px] font-mono">{(sim * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </motion.div>
            )}

            {selectedWord === null && (
              <div className="p-3 rounded-lg border bg-card text-[10px] text-muted-foreground text-center">
                Click a word to see its nearest neighbors in the embedding space.
              </div>
            )}
          </div>
        </div>

        {/* Quick explanation */}
        <div className="mt-4 p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground">
          <strong>How it works:</strong> Word2Vec / GloVe / BERT embed each word as a vector of ~100-768 numbers. 
          Similar words end up <strong>close together</strong> in this space, and vector arithmetic reveals 
          semantic relationships (king - man + woman ≈ queen).
        </div>
      </CardContent>
    </Card>
  )
}
