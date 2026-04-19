import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface GANVisualizerProps {
  isPlaying?: boolean
}

export function GANVisualizer({ isPlaying = true }: GANVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'training' | 'converged'>('training')
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isPlaying) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const generatorNeurons = [
      { x: width * 0.15, y: height * 0.3, label: 'Z₁' },
      { x: width * 0.15, y: height * 0.5, label: 'Z₂' },
      { x: width * 0.15, y: height * 0.7, label: 'Z₃' },
    ]

    const fakeImage = { x: width * 0.35, y: height * 0.5, label: 'Fake' }
    const realImage = { x: width * 0.35, y: height * 0.2, label: 'Real' }

    const discriminatorNeurons = [
      { x: width * 0.55, y: height * 0.35, label: 'D₁' },
      { x: width * 0.55, y: height * 0.65, label: 'D₂' },
    ]

    const output = { x: width * 0.75, y: height * 0.5, label: 'Real/Fake' }

    let convergence = 0

    const animate = () => {
      if (!isPlaying) return
      
      timeRef.current += 0.02
      convergence = Math.min(convergence + 0.002, 1)
      
      if (convergence > 0.8) {
        setPhase('converged')
      }

      ctx.fillStyle = 'oklch(0.98 0.015 280)'
      ctx.fillRect(0, 0, width, height)

      const pulse = Math.sin(timeRef.current * 2) * 0.5 + 0.5
      const fastPulse = Math.sin(timeRef.current * 4) * 0.5 + 0.5

      generatorNeurons.forEach((neuron, i) => {
        const intensity = Math.sin(timeRef.current * 2 + i * 0.5) * 0.3 + 0.7
        const glow = intensity * 15
        
        ctx.save()
        ctx.shadowColor = 'oklch(0.70 0.22 340)'
        ctx.shadowBlur = glow
        ctx.fillStyle = `oklch(0.70 0.22 340 / ${intensity})`
        ctx.beginPath()
        ctx.arc(neuron.x, neuron.y, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        ctx.fillStyle = 'oklch(0.22 0 0)'
        ctx.font = '11px "JetBrains Mono"'
        ctx.textAlign = 'center'
        ctx.fillText(neuron.label, neuron.x, neuron.y - 20)
      })

      generatorNeurons.forEach(neuron => {
        const intensity = Math.sin(timeRef.current * 2) * 0.3 + 0.7
        ctx.strokeStyle = `oklch(0.70 0.22 340 / ${intensity * 0.4})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(neuron.x + 12, neuron.y)
        ctx.lineTo(fakeImage.x - 20, fakeImage.y)
        ctx.stroke()

        const flowX = neuron.x + (fakeImage.x - neuron.x) * pulse
        const flowY = neuron.y + (fakeImage.y - neuron.y) * pulse
        
        ctx.save()
        ctx.shadowColor = 'oklch(0.70 0.22 340)'
        ctx.shadowBlur = 10
        ctx.fillStyle = 'oklch(0.70 0.22 340)'
        ctx.beginPath()
        ctx.arc(flowX, flowY, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      ctx.save()
      ctx.shadowColor = 'oklch(0.70 0.22 340)'
      ctx.shadowBlur = 20 * fastPulse
      ctx.fillStyle = 'oklch(0.70 0.22 340 / 0.2)'
      ctx.fillRect(fakeImage.x - 20, fakeImage.y - 20, 40, 40)
      ctx.strokeStyle = 'oklch(0.70 0.22 340)'
      ctx.lineWidth = 2
      ctx.strokeRect(fakeImage.x - 20, fakeImage.y - 20, 40, 40)
      ctx.restore()

      ctx.fillStyle = 'oklch(0.22 0 0)'
      ctx.font = 'bold 12px "Space Grotesk"'
      ctx.textAlign = 'center'
      ctx.fillText('Generator', fakeImage.x, fakeImage.y + 40)
      ctx.font = '11px "JetBrains Mono"'
      ctx.fillText(fakeImage.label, fakeImage.x, fakeImage.y + 4)

      ctx.save()
      ctx.shadowColor = 'oklch(0.78 0.20 130)'
      ctx.shadowBlur = 15
      ctx.fillStyle = 'oklch(0.78 0.20 130 / 0.3)'
      ctx.fillRect(realImage.x - 20, realImage.y - 20, 40, 40)
      ctx.strokeStyle = 'oklch(0.78 0.20 130)'
      ctx.lineWidth = 2
      ctx.strokeRect(realImage.x - 20, realImage.y - 20, 40, 40)
      ctx.restore()

      ctx.fillStyle = 'oklch(0.22 0 0)'
      ctx.font = '11px "JetBrains Mono"'
      ctx.textAlign = 'center'
      ctx.fillText(realImage.label, realImage.x, realImage.y + 4)

      ;[fakeImage, realImage].forEach((img, idx) => {
        discriminatorNeurons.forEach(neuron => {
          const intensity = Math.sin(timeRef.current * 2 + idx * Math.PI) * 0.3 + 0.7
          ctx.strokeStyle = `oklch(0.60 0.20 220 / ${intensity * 0.4})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(img.x + 20, img.y)
          ctx.lineTo(neuron.x - 12, neuron.y)
          ctx.stroke()

          const flowX = img.x + (neuron.x - img.x) * pulse
          const flowY = img.y + (neuron.y - img.y) * pulse
          
          ctx.save()
          ctx.shadowColor = 'oklch(0.60 0.20 220)'
          ctx.shadowBlur = 8
          ctx.fillStyle = 'oklch(0.60 0.20 220)'
          ctx.beginPath()
          ctx.arc(flowX, flowY, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })
      })

      discriminatorNeurons.forEach((neuron, i) => {
        const intensity = Math.sin(timeRef.current * 2 + i * 0.7) * 0.3 + 0.7
        const glow = intensity * 15
        
        ctx.save()
        ctx.shadowColor = 'oklch(0.60 0.20 220)'
        ctx.shadowBlur = glow
        ctx.fillStyle = `oklch(0.60 0.20 220 / ${intensity})`
        ctx.beginPath()
        ctx.arc(neuron.x, neuron.y, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        ctx.fillStyle = 'oklch(0.22 0 0)'
        ctx.font = '11px "JetBrains Mono"'
        ctx.textAlign = 'center'
        ctx.fillText(neuron.label, neuron.x, neuron.y - 20)
      })

      ctx.fillStyle = 'oklch(0.22 0 0)'
      ctx.font = 'bold 12px "Space Grotesk"'
      ctx.textAlign = 'center'
      ctx.fillText('Discriminator', discriminatorNeurons[0].x, discriminatorNeurons[1].y + 40)

      discriminatorNeurons.forEach(neuron => {
        const intensity = Math.sin(timeRef.current * 2) * 0.3 + 0.7
        ctx.strokeStyle = `oklch(0.62 0.24 300 / ${intensity * 0.4})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(neuron.x + 12, neuron.y)
        ctx.lineTo(output.x - 15, output.y)
        ctx.stroke()
      })

      ctx.save()
      ctx.shadowColor = 'oklch(0.62 0.24 300)'
      ctx.shadowBlur = 20 * convergence
      ctx.fillStyle = `oklch(0.62 0.24 300 / ${0.3 + convergence * 0.4})`
      ctx.beginPath()
      ctx.arc(output.x, output.y, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'oklch(0.62 0.24 300)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()

      ctx.fillStyle = 'oklch(1 0 0)'
      ctx.font = '10px "JetBrains Mono"'
      ctx.textAlign = 'center'
      ctx.fillText(output.label, output.x, output.y + 3)

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
    <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-gradient-to-br from-pink/5 via-violet/5 to-cyan/5 border border-pink/20">
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className="absolute inset-0 w-full h-full"
      />
      <motion.div
        className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-card/90 backdrop-blur border-2 border-pink/30 shadow-lg"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-xs font-mono text-muted-foreground">
          Status: <span className={phase === 'converged' ? 'text-lime' : 'text-orange'}>{phase === 'converged' ? 'Converged ✓' : 'Training...'}</span>
        </div>
      </motion.div>
    </div>
  )
}
