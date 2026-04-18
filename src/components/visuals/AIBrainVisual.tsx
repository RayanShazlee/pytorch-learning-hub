import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function AIBrainVisual() {
  const [activeNeurons, setActiveNeurons] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const randomNeurons = Array.from(
        { length: Math.floor(Math.random() * 5) + 3 },
        () => Math.floor(Math.random() * 20)
      )
      setActiveNeurons(randomNeurons)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const neurons = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 50 + (i % 5) * 80,
    y: 50 + Math.floor(i / 5) * 80,
  }))

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-violet/5 via-primary/5 to-cyan/5 rounded-2xl overflow-hidden border-2 border-violet/20">
      <svg className="w-full h-full" viewBox="0 0 450 350">
        {neurons.map((neuron, i) => {
          if (i % 5 < 4) {
            const next = neurons[i + 1]
            return (
              <motion.line
                key={`line-h-${i}`}
                x1={neuron.x + 15}
                y1={neuron.y + 15}
                x2={next.x - 15}
                y2={next.y + 15}
                stroke="oklch(0.55 0.22 280 / 0.15)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            )
          }
          return null
        })}

        {neurons.map((neuron, i) => {
          if (i < 15) {
            const next = neurons[i + 5]
            return (
              <motion.line
                key={`line-v-${i}`}
                x1={neuron.x + 15}
                y1={neuron.y + 15}
                x2={next.x + 15}
                y2={next.y - 15}
                stroke="oklch(0.60 0.20 220 / 0.15)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            )
          }
          return null
        })}

        {neurons.map((neuron) => {
          const isActive = activeNeurons.includes(neuron.id)
          return (
            <g key={neuron.id}>
              <motion.circle
                cx={neuron.x + 15}
                cy={neuron.y + 15}
                r={isActive ? 20 : 15}
                fill={
                  isActive
                    ? 'oklch(0.55 0.22 280 / 0.8)'
                    : 'oklch(0.70 0.22 340 / 0.3)'
                }
                animate={{
                  scale: isActive ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.6 }}
              />
              {isActive && (
                <motion.circle
                  cx={neuron.x + 15}
                  cy={neuron.y + 15}
                  r={15}
                  fill="none"
                  stroke="oklch(0.75 0.18 50)"
                  strokeWidth="2"
                  initial={{ r: 15, opacity: 1 }}
                  animate={{ r: 35, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </g>
          )
        })}
      </svg>

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <motion.p
          className="text-sm font-medium bg-gradient-to-r from-violet via-primary to-cyan bg-clip-text text-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Neural network thinking... 🧠
        </motion.p>
      </div>
    </div>
  )
}
