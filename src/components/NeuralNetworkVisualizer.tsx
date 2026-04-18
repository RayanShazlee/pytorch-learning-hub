import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause } from '@phosphor-icons/react'

export function NeuralNetworkVisualizer() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeLayer, setActiveLayer] = useState(0)

  const layers = [
    { name: 'Input', nodes: 3, color: 'oklch(0.70 0.12 210)', glowColor: 'rgba(115, 160, 255, 0.8)' },
    { name: 'Hidden 1', nodes: 5, color: 'oklch(0.45 0.15 290)', glowColor: 'rgba(133, 107, 255, 0.8)' },
    { name: 'Hidden 2', nodes: 4, color: 'oklch(0.72 0.14 25)', glowColor: 'rgba(255, 140, 105, 0.8)' },
    { name: 'Output', nodes: 2, color: 'oklch(0.85 0.15 95)', glowColor: 'rgba(255, 230, 110, 0.8)' },
  ]

  const nodeActivations = useMemo(() => {
    return layers.map((layer) => 
      Array.from({ length: layer.nodes }, () => Math.random() * 0.6 + 0.4)
    )
  }, [layers.length])

  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      setActiveLayer((prev) => {
        if (prev >= layers.length - 1) {
          return 0
        }
        return prev + 1
      })
    }, 1200)

    return () => clearInterval(interval)
  }, [isAnimating, layers.length])

  const renderConnections = (fromLayer: number, toLayer: number, svgWidth: number, svgHeight: number) => {
    const fromNodes = layers[fromLayer].nodes
    const toNodes = layers[toLayer].nodes
    const connections = []
    
    const nodeSize = 56
    const nodeGap = 12

    for (let i = 0; i < fromNodes; i++) {
      for (let j = 0; j < toNodes; j++) {
        const isActive = isAnimating && activeLayer === fromLayer
        const connectionId = `conn-${fromLayer}-${toLayer}-${i}-${j}`
        
        const fromTotalHeight = fromNodes * nodeSize + (fromNodes - 1) * nodeGap
        const toTotalHeight = toNodes * nodeSize + (toNodes - 1) * nodeGap
        
        const fromStartY = (svgHeight - fromTotalHeight) / 2
        const toStartY = (svgHeight - toTotalHeight) / 2
        
        const fromY = fromStartY + i * (nodeSize + nodeGap) + nodeSize / 2
        const toY = toStartY + j * (nodeSize + nodeGap) + nodeSize / 2
        
        const x1 = 0
        const y1 = fromY
        const x2 = svgWidth
        const y2 = toY
        
        connections.push(
          <motion.line
            key={connectionId}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={layers[fromLayer].color}
            strokeWidth={isActive ? 2.5 : 1.2}
            strokeLinecap="round"
            opacity={isActive ? 0.8 : 0.2}
            animate={isActive ? {
              strokeWidth: [1.2, 3.5, 1.2],
              opacity: [0.3, 1, 0.3]
            } : {}}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: (i * 0.08 + j * 0.04),
              ease: "easeInOut"
            }}
            style={{
              filter: isActive ? 'drop-shadow(0 0 4px currentColor)' : 'none'
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
          Watch light flow through the neural network as signals pass between neurons
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 p-8 rounded-xl min-h-[400px] overflow-x-auto">
          <div className="flex items-center justify-between gap-12 min-w-[900px]">
            {layers.map((layer, layerIdx) => {
              const maxNodes = Math.max(...layers.map(l => l.nodes))
              const nodeSize = 56
              const nodeGap = 12
              const containerHeight = maxNodes * nodeSize + (maxNodes - 1) * nodeGap
              const svgWidth = 96
              
              return (
                <div key={layerIdx} className="flex-1 relative">
                  {layerIdx > 0 && (
                    <svg
                      className="absolute top-0 right-full"
                      width={svgWidth}
                      height={containerHeight}
                      style={{ 
                        transform: 'translateX(calc(50% + 28px))',
                        overflow: 'visible'
                      }}
                      viewBox={`0 0 ${svgWidth} ${containerHeight}`}
                      preserveAspectRatio="none"
                    >
                      {renderConnections(layerIdx - 1, layerIdx, svgWidth, containerHeight)}
                    </svg>
                  )}
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-sm font-semibold text-center mb-2">
                      {layer.name}
                    </div>
                    <div className="flex flex-col gap-3">
                      {Array.from({ length: layer.nodes }, (_, nodeIdx) => {
                        const isNodeActive = isAnimating && activeLayer === layerIdx
                        const activation = nodeActivations[layerIdx][nodeIdx]
                        const pulseIntensity = activation
                        const glowSize = 20 + (activation * 20)
                        const scaleMax = 1 + (activation * 0.25)
                        const rippleScale = 1.5 + (activation * 0.8)
                        
                        return (
                          <motion.div
                            key={nodeIdx}
                            className="relative"
                          >
                            <motion.div
                              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm relative z-10"
                              style={{
                                backgroundColor: layer.color,
                              }}
                              animate={isNodeActive ? {
                                scale: [1, scaleMax, 1],
                                boxShadow: [
                                  `0 0 0px ${layer.glowColor}`,
                                  `0 0 ${glowSize}px ${layer.glowColor}, 0 0 ${glowSize / 2}px ${layer.glowColor}`,
                                  `0 0 0px ${layer.glowColor}`,
                                ],
                                opacity: [0.7 + (activation * 0.3), 1, 0.7 + (activation * 0.3)],
                              } : {
                                scale: 1,
                                boxShadow: `0 0 0px ${layer.glowColor}`,
                                opacity: 0.7,
                              }}
                              transition={{
                                duration: 0.8 + (activation * 0.4),
                                repeat: isNodeActive ? Infinity : 0,
                                delay: nodeIdx * 0.08,
                                ease: "easeInOut"
                              }}
                            >
                              <span className="relative z-10">{nodeIdx + 1}</span>
                              <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{
                                  background: `radial-gradient(circle, rgba(255,255,255,${activation * 0.3}) 0%, transparent 70%)`,
                                }}
                                animate={isNodeActive ? {
                                  scale: [1, 1.2, 1],
                                  opacity: [pulseIntensity * 0.5, pulseIntensity, pulseIntensity * 0.5],
                                } : {
                                  opacity: 0,
                                }}
                                transition={{
                                  duration: 0.8 + (activation * 0.4),
                                  repeat: isNodeActive ? Infinity : 0,
                                  delay: nodeIdx * 0.08,
                                  ease: "easeInOut"
                                }}
                              />
                            </motion.div>
                            
                            {isNodeActive && (
                              <>
                                <motion.div
                                  className="absolute inset-0 rounded-full"
                                  style={{
                                    backgroundColor: layer.color,
                                  }}
                                  initial={{ scale: 1, opacity: 0.5 * pulseIntensity }}
                                  animate={{
                                    scale: [1, rippleScale, rippleScale + 0.4],
                                    opacity: [0.5 * pulseIntensity, 0.25 * pulseIntensity, 0],
                                  }}
                                  transition={{
                                    duration: 1 + (activation * 0.2),
                                    repeat: Infinity,
                                    delay: nodeIdx * 0.08,
                                    ease: "easeOut"
                                  }}
                                />
                                {activation > 0.7 && (
                                  <motion.div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                      backgroundColor: layer.color,
                                    }}
                                    initial={{ scale: 1, opacity: 0.4 }}
                                    animate={{
                                      scale: [1, rippleScale + 0.5, rippleScale + 1],
                                      opacity: [0.4, 0.2, 0],
                                    }}
                                    transition={{
                                      duration: 1.3,
                                      repeat: Infinity,
                                      delay: nodeIdx * 0.08 + 0.3,
                                      ease: "easeOut"
                                    }}
                                  />
                                )}
                              </>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center text-sm text-muted-foreground">
            {isAnimating
              ? `Light is flowing through ${layers[activeLayer].name} layer! ✨`
              : 'Press start to see light flow through the network'}
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-sm font-semibold mb-2 text-center">Neuron Activation Levels</div>
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <span className="text-muted-foreground">Low (40-60%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary/70" />
                <span className="text-muted-foreground">Medium (60-80%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50" />
                <span className="text-muted-foreground">High (80-100%)</span>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Higher activation = stronger pulse & glow
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
