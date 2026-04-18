import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  velocityX: number
  velocityY: number
  rotationSpeed: number
}

interface ConfettiProps {
  trigger: boolean
  onComplete?: () => void
}

const colors = [
  'oklch(0.70 0.22 340)',
  'oklch(0.62 0.24 300)',
  'oklch(0.72 0.18 200)',
  'oklch(0.78 0.20 130)',
  'oklch(0.70 0.20 40)',
  'oklch(0.75 0.18 50)',
  'oklch(0.55 0.22 280)',
]

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true)
      const pieces: ConfettiPiece[] = []
      const numPieces = 150

      for (let i = 0; i < numPieces; i++) {
        const angle = (Math.PI * 2 * i) / numPieces
        const velocity = 8 + Math.random() * 12
        const spread = 0.8 + Math.random() * 0.4

        pieces.push({
          id: i,
          x: 50,
          y: 50,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 8 + Math.random() * 8,
          velocityX: Math.cos(angle) * velocity * spread,
          velocityY: Math.sin(angle) * velocity * spread - 5,
          rotationSpeed: -10 + Math.random() * 20,
        })
      }

      setConfetti(pieces)

      setTimeout(() => {
        setIsActive(false)
        setConfetti([])
        onComplete?.()
      }, 4000)
    }
  }, [trigger, isActive, onComplete])

  if (!isActive || confetti.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.x}vw`,
            y: `${piece.y}vh`,
            rotate: piece.rotation,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: `calc(${piece.x}vw + ${piece.velocityX * 50}px)`,
            y: `calc(${piece.y}vh + ${piece.velocityY * 50 + 100}vh)`,
            rotate: piece.rotation + piece.rotationSpeed * 20,
            opacity: 0,
            scale: 0.5,
          }}
          transition={{
            duration: 3.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="absolute rounded-sm"
          style={{
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            boxShadow: `0 0 ${piece.size * 2}px ${piece.color}`,
          }}
        />
      ))}
    </div>
  )
}
