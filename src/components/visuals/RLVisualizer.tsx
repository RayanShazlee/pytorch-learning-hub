import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, ArrowCounterClockwise } from '@phosphor-icons/react'

/**
 * Gridworld Q-learning.
 * Agent learns to navigate from S (top-left) to G (bottom-right) while avoiding pits.
 * Live-shows Q-values for each cell as 4 directional arrows.
 */

const ROWS = 5
const COLS = 6
const START = { r: 0, c: 0 }
const GOAL = { r: 4, c: 5 }
const PITS = [{ r: 2, c: 2 }, { r: 3, c: 4 }, { r: 1, c: 4 }]

type Action = 0 | 1 | 2 | 3 // up, right, down, left
const DELTAS: [number, number][] = [[-1, 0], [0, 1], [1, 0], [0, -1]]

function isPit(r: number, c: number) {
  return PITS.some((p) => p.r === r && p.c === c)
}
function isGoal(r: number, c: number) {
  return r === GOAL.r && c === GOAL.c
}

function reward(r: number, c: number) {
  if (isGoal(r, c)) return 10
  if (isPit(r, c)) return -10
  return -0.05
}

type QTable = number[][][] // [r][c][action]

function initQ(): QTable {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => [0, 0, 0, 0]))
}

export function RLVisualizer() {
  const [Q, setQ] = useState<QTable>(() => initQ())
  const [agent, setAgent] = useState({ r: START.r, c: START.c })
  const [episode, setEpisode] = useState(0)
  const [totalReward, setTotalReward] = useState(0)
  const [running, setRunning] = useState(false)
  const [epsilon, setEpsilon] = useState(0.3)
  const alpha = 0.3
  const gamma = 0.9

  const reset = useCallback(() => {
    setQ(initQ())
    setAgent({ ...START })
    setEpisode(0)
    setTotalReward(0)
  }, [])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setQ((qprev) => {
        const q = qprev.map((rr) => rr.map((cc) => [...cc])) as QTable
        let cur = { ...agent }
        // choose action eps-greedy
        let a: Action
        if (Math.random() < epsilon) {
          a = Math.floor(Math.random() * 4) as Action
        } else {
          const qs = q[cur.r][cur.c]
          const maxV = Math.max(...qs)
          const bests = qs.map((v, i) => (v === maxV ? i : -1)).filter((i) => i >= 0)
          a = bests[Math.floor(Math.random() * bests.length)] as Action
        }
        const [dr, dc] = DELTAS[a]
        const nr = Math.max(0, Math.min(ROWS - 1, cur.r + dr))
        const nc = Math.max(0, Math.min(COLS - 1, cur.c + dc))
        const rw = reward(nr, nc)
        const maxNext = isGoal(nr, nc) || isPit(nr, nc) ? 0 : Math.max(...q[nr][nc])
        q[cur.r][cur.c][a] += alpha * (rw + gamma * maxNext - q[cur.r][cur.c][a])

        if (isGoal(nr, nc) || isPit(nr, nc)) {
          setAgent({ ...START })
          setEpisode((e) => e + 1)
          setTotalReward((t) => t + rw)
        } else {
          setAgent({ r: nr, c: nc })
          setTotalReward((t) => t + rw)
        }
        return q
      })
    }, 120)
    return () => clearInterval(id)
  }, [running, agent, epsilon])

  // find best Q per cell for color
  const maxQ = useMemo(() => Math.max(0.01, ...Q.flat().flat().map(Math.abs)), [Q])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Button size="sm" onClick={() => setRunning(!running)}>
          {running ? <Pause size={14} className="mr-1" /> : <Play size={14} className="mr-1" />} {running ? 'Pause' : 'Learn'}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <ArrowCounterClockwise size={14} className="mr-1" /> Reset
        </Button>
        <div className="ml-2 text-xs">ε=<span className="font-mono">{epsilon.toFixed(2)}</span></div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={epsilon}
          onChange={(e) => setEpsilon(parseFloat(e.target.value))}
          className="w-32"
        />
        <div className="ml-auto text-xs font-mono">episode {episode} · reward {totalReward.toFixed(1)}</div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4">
        <div className="grid gap-1 justify-center" style={{ gridTemplateColumns: `repeat(${COLS}, 4.5rem)` }}>
          {Array.from({ length: ROWS }).flatMap((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const goal = isGoal(r, c)
              const pit = isPit(r, c)
              const start = r === START.r && c === START.c
              const here = agent.r === r && agent.c === c
              const qs = Q[r][c]
              const bestVal = Math.max(...qs)
              const bestA = qs.indexOf(bestVal)
              return (
                <div
                  key={`${r}-${c}`}
                  className="w-18 h-18 rounded-lg border flex items-center justify-center relative text-[10px] font-mono"
                  style={{
                    width: '4.5rem',
                    height: '4.5rem',
                    backgroundColor: goal
                      ? '#22c55e'
                      : pit
                      ? '#ef4444'
                      : `rgba(168, 85, 247, ${0.08 + Math.abs(bestVal) / maxQ * 0.35})`,
                    outline: here ? '3px solid #fbbf24' : start ? '2px dashed #3b82f6' : 'none',
                  }}
                >
                  {/* arrows for 4 actions */}
                  {!goal && !pit && (
                    <>
                      <span className="absolute top-0.5 left-1/2 -translate-x-1/2" style={{ opacity: 0.3 + (qs[0] / (maxQ || 1)) * 0.7, color: bestA === 0 && qs[0] > 0 ? '#16a34a' : 'currentColor' }}>↑ {qs[0].toFixed(1)}</span>
                      <span className="absolute right-0.5 top-1/2 -translate-y-1/2" style={{ opacity: 0.3 + (qs[1] / (maxQ || 1)) * 0.7, color: bestA === 1 && qs[1] > 0 ? '#16a34a' : 'currentColor' }}>→ {qs[1].toFixed(1)}</span>
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2" style={{ opacity: 0.3 + (qs[2] / (maxQ || 1)) * 0.7, color: bestA === 2 && qs[2] > 0 ? '#16a34a' : 'currentColor' }}>↓ {qs[2].toFixed(1)}</span>
                      <span className="absolute left-0.5 top-1/2 -translate-y-1/2" style={{ opacity: 0.3 + (qs[3] / (maxQ || 1)) * 0.7, color: bestA === 3 && qs[3] > 0 ? '#16a34a' : 'currentColor' }}>← {qs[3].toFixed(1)}</span>
                    </>
                  )}
                  <div className="text-base">
                    {goal ? '🏆' : pit ? '💀' : here ? '🤖' : start ? 'S' : ''}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        The agent (🤖) uses <strong>Q-learning</strong>: at each step it picks the action with the highest Q-value (exploit) or a random one (explore, controlled by ε). Rewards: +10 goal, −10 pit, −0.05 per step. Watch the arrows grow toward the goal as Q-values propagate backwards.
      </p>
    </div>
  )
}
