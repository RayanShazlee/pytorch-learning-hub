import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause } from '@phosphor-icons/react'

export function NeuralNetworkVisualizer() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeLayer, setActiveLayer] = useState(0)

  const layers = [
    { name: 'Input', nodes: 3, color: 'bg-secondary' },
    { name: 'Hidden 1', nodes: 5, color: 'bg-primary' },
    { name: 'Hidden 2', nodes: 4, color: 'bg-coral' },
    { name: 'Output', nodes: 2, color: 'bg-accent' },
  ]

  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      setActiveLayer((prev) => {
        if (prev >= layers.length - 1) {
          return 0
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isAnimating, layers.length])

  const renderConnections = (fromLayer: number, toLayer: number) => {
    const fromNodes = layers[fromLayer].nodes
    const toNodes = layers[toLayer].nodes
    const connections = []

    for (let i = 0; i < fromNodes; i++) {
      for (let j = 0; j < toNodes; j++) {
        const isActive = isAnimating && activeLayer === fromLayer
        connections.push(
          <motion.line
            key={`${fromLayer}-${i}-${j}`}
            x1="0"
            y1={`${((i + 1) / (fromNodes + 1)) * 100}%`}
            x2="100"
            y2={`${((j + 1) / (toNodes + 1)) * 100}%`}
            stroke={isActive ? 'oklch(0.85 0.15 95)' : 'oklch(0.88 0.02 290)'}
            strokeWidth={isActive ? 2 : 1}
            strokeOpacity={isActive ? 0.8 : 0.3}
            animate={{
              strokeOpacity: isActive ? [0.3, 0.8, 0.3] : 0.3,
            }}
            transition={{
              duration: 0.8,
              repeat: isActive ? Infinity : 0,
            }}
          />
        )
      }
    }
    return connections
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neural Network Flow</CardTitle>
        <CardDescription>
          Watch how data flows through the layers of a neural network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative bg-muted/30 p-8 rounded-xl min-h-[400px] overflow-x-auto">
          <div className="flex items-center justify-between gap-8 min-w-[800px]">
            {layers.map((layer, layerIdx) => (
              <div key={layerIdx} className="flex-1 relative">
                {layerIdx > 0 && (
                  <svg
                    className="absolute top-0 right-full w-8 h-full"
                    style={{ transform: 'translateX(50%)' }}
                  >
                    {renderConnections(layerIdx - 1, layerIdx)}
                  </svg>
                )}
                
                <div className="flex flex-col items-center gap-3">
                  <div className="text-sm font-semibold text-center mb-2">
                    {layer.name}
                  </div>
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: layer.nodes }, (_, nodeIdx) => (
                      <motion.div
                        key={nodeIdx}
                        className={`w-12 h-12 rounded-full ${layer.color} flex items-center justify-center text-white font-bold text-sm`}
                        animate={{
                          scale:
                            isAnimating && activeLayer === layerIdx
                              ? [1, 1.2, 1]
                              : 1,
                          boxShadow:
                            isAnimating && activeLayer === layerIdx
                              ? [
                                  '0 0 0px rgba(133, 107, 255, 0)',
                                  '0 0 20px rgba(133, 107, 255, 0.6)',
                                  '0 0 0px rgba(133, 107, 255, 0)',
                                ]
                              : '0 0 0px rgba(133, 107, 255, 0)',
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: isAnimating && activeLayer === layerIdx ? Infinity : 0,
                          delay: nodeIdx * 0.1,
                        }}
                      >
                        {nodeIdx + 1}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => setIsAnimating(!isAnimating)}
            size="lg"
          >
            {isAnimating ? (
              <>
                <Pause weight="fill" />
                Pause Animation
              </>
            ) : (
              <>
                <Play weight="fill" />
                Start Animation
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {isAnimating
            ? `Data is flowing through ${layers[activeLayer].name}!`
            : 'Press start to see how data flows through the network'}
        </div>
      </CardContent>
    </Card>
  )
}
