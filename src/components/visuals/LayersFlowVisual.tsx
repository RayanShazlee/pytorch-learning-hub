import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function LayersFlowVisual() {
  const [activeLayer, setActiveLayer] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const runFlow = () => {
    setIsAnimating(true)
    setActiveLayer(0)
    
    const interval = setInterval(() => {
      setActiveLayer((prev) => {
        if (prev >= 2) {
          clearInterval(interval)
          setIsAnimating(false)
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button onClick={runFlow} disabled={isAnimating}>
          {isAnimating ? 'Watch the Flow...' : '▶ Start Data Flow'}
        </Button>
      </div>

      <div className="relative w-full h-96 bg-gradient-to-br from-coral/5 via-orange/5 to-lime/5 rounded-2xl border-2 border-coral/20 overflow-hidden p-8">
        <div className="flex items-center justify-between h-full">
          <Layer
            title="Input Layer"
            subtitle="Data enters here"
            color="from-cyan to-secondary"
            neurons={4}
            isActive={activeLayer >= 0}
            emoji="🚪"
          />

          <Arrow isActive={activeLayer >= 1} />

          <Layer
            title="Hidden Layer 1"
            subtitle="Finding patterns"
            color="from-pink to-coral"
            neurons={6}
            isActive={activeLayer >= 1}
            emoji="🔬"
          />

          <Arrow isActive={activeLayer >= 2} />

          <Layer
            title="Hidden Layer 2"
            subtitle="Deeper patterns"
            color="from-violet to-primary"
            neurons={5}
            isActive={activeLayer >= 2}
            emoji="🧠"
          />

          <Arrow isActive={activeLayer >= 3} />

          <Layer
            title="Output Layer"
            subtitle="Final answer"
            color="from-lime to-accent"
            neurons={2}
            isActive={activeLayer >= 3}
            emoji="🎯"
          />
        </div>
      </div>
    </div>
  )
}

function Layer({ title, subtitle, color, neurons, isActive, emoji }: {
  title: string
  subtitle: string
  color: string
  neurons: number
  isActive: boolean
  emoji: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-xs font-semibold text-center mb-1">{title}</div>
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: neurons }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} shadow-md`}
            animate={{
              scale: isActive ? [1, 1.2, 1] : 1,
              boxShadow: isActive
                ? [
                    '0 0 0px rgba(255,255,255,0)',
                    '0 0 20px rgba(255,255,255,0.6)',
                    '0 0 0px rgba(255,255,255,0)',
                  ]
                : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          />
        ))}
      </div>
      <div className="text-[10px] text-muted-foreground text-center mt-1">{subtitle}</div>
    </div>
  )
}

function Arrow({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      animate={{
        opacity: isActive ? 1 : 0.3,
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="text-3xl"
          animate={{
            x: isActive ? [0, 10, 0] : 0,
            opacity: isActive ? [0.3, 1, 0.3] : 0.3,
          }}
          transition={{
            delay: i * 0.2,
            duration: 1,
            repeat: isActive ? Infinity : 0,
          }}
        >
          →
        </motion.div>
      ))}
    </motion.div>
  )
}
