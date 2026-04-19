import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface RLVisualizerProps {
  isPlaying?: boolean
}

export function RLVisualizer({ isPlaying = true }: RLVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [totalReward, setTotalReward] = useState(0)
  const [episode, setEpisode] = useState(1)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)
  const agentPosRef = useRef({ x: 0, y: 0 })
  const targetPosRef = useRef({ x: 0, y: 0 })
  const rewardRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isPlaying) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const gridSize = 5
    const cellSize = Math.min(width, height - 100) / gridSize
    const gridOffsetX = (width - gridSize * cellSize) / 2
    const gridOffsetY = 50

    agentPosRef.current = { x: 0, y: 0 }
    targetPosRef.current = { x: gridSize - 1, y: gridSize - 1 }
    rewardRef.current = 0

    let stepDelay = 0
    const stepInterval = 30

    const obstacles = [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
    ]

    const qValues: number[][][] = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => [0, 0, 0, 0])
    )

    const updateQValues = () => {
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const distToTarget = Math.abs(targetPosRef.current.x - x) + Math.abs(targetPosRef.current.y - y)
          const baseValue = 1 / (1 + distToTarget)
          
          qValues[y][x] = [
            baseValue * (y > 0 ? 1 : 0.1),
            baseValue * (x < gridSize - 1 ? 1 : 0.1),
            baseValue * (y < gridSize - 1 ? 1 : 0.1),
            baseValue * (x > 0 ? 1 : 0.1),
          ]
        }
      }
    }

    updateQValues()

    const getBestAction = (x: number, y: number): number => {
      const values = qValues[y][x]
      return values.indexOf(Math.max(...values))
    }

    const moveAgent = () => {
      const { x, y } = agentPosRef.current
      
      if (x === targetPosRef.current.x && y === targetPosRef.current.y) {
        setEpisode(prev => prev + 1)
        rewardRef.current += 10
        setTotalReward(rewardRef.current)
        agentPosRef.current = { x: 0, y: 0 }
        return
      }

      const action = getBestAction(x, y)
      let newX = x
      let newY = y

      switch (action) {
        case 0: newY = Math.max(0, y - 1); break
        case 1: newX = Math.min(gridSize - 1, x + 1); break
        case 2: newY = Math.min(gridSize - 1, y + 1); break
        case 3: newX = Math.max(0, x - 1); break
      }

      const isObstacle = obstacles.some(obs => obs.x === newX && obs.y === newY)
      if (!isObstacle) {
        agentPosRef.current = { x: newX, y: newY }
        rewardRef.current += 0.1
        setTotalReward(rewardRef.current)
      } else {
        rewardRef.current -= 1
        setTotalReward(rewardRef.current)
      }
    }

    const animate = () => {
      if (!isPlaying) return
      
      timeRef.current += 1
      stepDelay++

      if (stepDelay >= stepInterval) {
        moveAgent()
        stepDelay = 0
      }

      ctx.fillStyle = 'oklch(0.98 0.015 280)'
      ctx.fillRect(0, 0, width, height)

      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const cellX = gridOffsetX + x * cellSize
          const cellY = gridOffsetY + y * cellSize

          const maxQ = Math.max(...qValues[y][x])
          const intensity = maxQ * 0.6

          ctx.fillStyle = `oklch(0.72 0.18 200 / ${intensity * 0.3})`
          ctx.fillRect(cellX, cellY, cellSize, cellSize)

          ctx.strokeStyle = 'oklch(0.90 0.015 280)'
          ctx.lineWidth = 2
          ctx.strokeRect(cellX, cellY, cellSize, cellSize)
        }
      }

      obstacles.forEach(obs => {
        const cellX = gridOffsetX + obs.x * cellSize
        const cellY = gridOffsetY + obs.y * cellSize

        ctx.save()
        ctx.fillStyle = 'oklch(0.577 0.245 27.325 / 0.3)'
        ctx.fillRect(cellX + 5, cellY + 5, cellSize - 10, cellSize - 10)
        ctx.strokeStyle = 'oklch(0.577 0.245 27.325)'
        ctx.lineWidth = 2
        ctx.strokeRect(cellX + 5, cellY + 5, cellSize - 10, cellSize - 10)
        ctx.restore()
      })

      const targetX = gridOffsetX + targetPosRef.current.x * cellSize + cellSize / 2
      const targetY = gridOffsetY + targetPosRef.current.y * cellSize + cellSize / 2
      const targetPulse = Math.sin(timeRef.current * 0.1) * 0.3 + 0.7

      ctx.save()
      ctx.shadowColor = 'oklch(0.78 0.20 130)'
      ctx.shadowBlur = 20 * targetPulse
      ctx.fillStyle = `oklch(0.78 0.20 130 / ${targetPulse})`
      ctx.beginPath()
      ctx.arc(targetX, targetY, cellSize * 0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.fillStyle = 'oklch(0.22 0 0)'
      ctx.font = 'bold 16px "Space Grotesk"'
      ctx.textAlign = 'center'
      ctx.fillText('🎯', targetX, targetY + 6)

      const agentX = gridOffsetX + agentPosRef.current.x * cellSize + cellSize / 2
      const agentY = gridOffsetY + agentPosRef.current.y * cellSize + cellSize / 2
      const agentPulse = Math.sin(timeRef.current * 0.15) * 0.3 + 1

      ctx.save()
      ctx.shadowColor = 'oklch(0.70 0.20 40)'
      ctx.shadowBlur = 25 * agentPulse
      ctx.fillStyle = 'oklch(0.70 0.20 40)'
      ctx.beginPath()
      ctx.arc(agentX, agentY, cellSize * 0.35 * agentPulse, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.fillStyle = 'oklch(1 0 0)'
      ctx.font = 'bold 18px "Space Grotesk"'
      ctx.textAlign = 'center'
      ctx.fillText('🤖', agentX, agentY + 6)

      ctx.fillStyle = 'oklch(0.22 0 0)'
      ctx.font = 'bold 14px "Space Grotesk"'
      ctx.textAlign = 'left'
      ctx.fillText(`Episode: ${episode}`, 20, 30)
      ctx.fillText(`Reward: ${rewardRef.current.toFixed(1)}`, width - 150, 30)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  return (
    <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-gradient-to-br from-orange/5 via-coral/5 to-lime/5 border border-orange/20">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="absolute inset-0 w-full h-full"
      />
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg bg-card/90 backdrop-blur border-2 border-orange/30 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-sm font-semibold text-center">
          Q-Learning Agent navigating to target
        </div>
      </motion.div>
    </div>
  )
}
