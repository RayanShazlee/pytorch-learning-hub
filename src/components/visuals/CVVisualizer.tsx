import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface CVVisualizerProps {
  isPlaying?: boolean
}

export function CVVisualizer({ isPlaying = true }: CVVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [detections, setDetections] = useState(0)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isPlaying) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const objects = [
      { x: width * 0.2, y: height * 0.3, size: 60, label: 'Cat', color: 'oklch(0.70 0.22 340)', detected: false },
      { x: width * 0.5, y: height * 0.4, size: 70, label: 'Dog', color: 'oklch(0.60 0.20 220)', detected: false },
      { x: width * 0.75, y: height * 0.35, size: 50, label: 'Bird', color: 'oklch(0.78 0.20 130)', detected: false },
    ]

    let scanX = 0
    let detectionCount = 0

    const animate = () => {
      if (!isPlaying) return
      
      timeRef.current += 0.02
      scanX = (scanX + 2) % width

      ctx.fillStyle = 'oklch(0.98 0.015 280)'
      ctx.fillRect(0, 0, width, height)

      objects.forEach((obj, idx) => {
        const pulse = Math.sin(timeRef.current * 2 + idx) * 0.2 + 0.8
        
        ctx.save()
        ctx.shadowColor = obj.color
        ctx.shadowBlur = obj.detected ? 25 : 10
        ctx.fillStyle = `${obj.color} / ${obj.detected ? 0.4 : 0.2})`
        ctx.fillRect(obj.x - obj.size / 2, obj.y - obj.size / 2, obj.size, obj.size)
        
        ctx.strokeStyle = obj.color
        ctx.lineWidth = obj.detected ? 3 : 2
        ctx.strokeRect(obj.x - obj.size / 2, obj.y - obj.size / 2, obj.size, obj.size)
        ctx.restore()

        if (Math.abs(scanX - obj.x) < 20 && !obj.detected) {
          obj.detected = true
          detectionCount++
          setDetections(detectionCount)
        }

        if (obj.detected) {
          ctx.save()
          ctx.fillStyle = obj.color
          ctx.font = 'bold 14px "Space Grotesk"'
          ctx.textAlign = 'center'
          ctx.fillText(obj.label, obj.x, obj.y - obj.size / 2 - 12)
          
          ctx.font = '10px "JetBrains Mono"'
          ctx.fillText(`${(85 + Math.random() * 15).toFixed(1)}%`, obj.x, obj.y - obj.size / 2 - 25)
          ctx.restore()
        }
      })

      const gradient = ctx.createLinearGradient(scanX - 30, 0, scanX + 30, 0)
      gradient.addColorStop(0, 'oklch(0.62 0.24 300 / 0)')
      gradient.addColorStop(0.5, 'oklch(0.62 0.24 300 / 0.3)')
      gradient.addColorStop(1, 'oklch(0.62 0.24 300 / 0)')
      
      ctx.fillStyle = gradient
      ctx.fillRect(scanX - 30, 0, 60, height)

      ctx.strokeStyle = 'oklch(0.62 0.24 300 / 0.6)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(scanX, 0)
      ctx.lineTo(scanX, height)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = 'oklch(0.22 0 0 / 0.1)'
      ctx.fillRect(0, 0, width, 40)
      
      ctx.fillStyle = 'oklch(0.22 0 0)'
      ctx.font = 'bold 16px "Space Grotesk"'
      ctx.textAlign = 'left'
      ctx.fillText('Object Detection', 20, 25)

      const convLayers = [
        { x: width * 0.15, y: height * 0.75, label: 'Conv1', size: 40 },
        { x: width * 0.35, y: height * 0.75, label: 'Conv2', size: 32 },
        { x: width * 0.55, y: height * 0.75, label: 'Conv3', size: 24 },
        { x: width * 0.75, y: height * 0.75, label: 'FC', size: 20 },
      ]

      convLayers.forEach((layer, idx) => {
        const activation = Math.sin(timeRef.current * 3 + idx * 0.5) * 0.3 + 0.7
        
        ctx.save()
        ctx.shadowColor = 'oklch(0.72 0.18 200)'
        ctx.shadowBlur = 15 * activation
        ctx.fillStyle = `oklch(0.72 0.18 200 / ${activation * 0.5})`
        ctx.fillRect(layer.x - layer.size / 2, layer.y - layer.size / 2, layer.size, layer.size)
        
        ctx.strokeStyle = 'oklch(0.72 0.18 200)'
        ctx.lineWidth = 2
        ctx.strokeRect(layer.x - layer.size / 2, layer.y - layer.size / 2, layer.size, layer.size)
        ctx.restore()

        ctx.fillStyle = 'oklch(0.22 0 0)'
        ctx.font = '11px "JetBrains Mono"'
        ctx.textAlign = 'center'
        ctx.fillText(layer.label, layer.x, layer.y + layer.size / 2 + 15)

        if (idx < convLayers.length - 1) {
          const nextLayer = convLayers[idx + 1]
          ctx.strokeStyle = 'oklch(0.72 0.18 200 / 0.4)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(layer.x + layer.size / 2, layer.y)
          ctx.lineTo(nextLayer.x - nextLayer.size / 2, nextLayer.y)
          ctx.stroke()
        }
      })

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
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={350}
        className="w-full h-full"
      />
      <motion.div
        className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-card border-2 border-lime/30"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-xs font-mono text-muted-foreground">
          Detected: <span className="text-lime font-bold">{detections}/3</span>
        </div>
      </motion.div>
    </div>
  )
}
