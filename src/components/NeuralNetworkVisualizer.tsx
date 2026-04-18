import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import { audioSynthesizer } from '@/lib/audioSynthesizer'

export function NeuralNetworkVisualizer() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeLayer, setActiveLayer] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const previousLayerRef = useRef(-1)

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
    audioSynthesizer.setEnabled(soundEnabled)
  }, [soundEnabled])

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

  useEffect(() => {
    if (!isAnimating || activeLayer === previousLayerRef.current) return
    
    previousLayerRef.current = activeLayer

    if (soundEnabled) {
      const currentLayer = layers[activeLayer]
      audioSynthesizer.playLayerActivation(activeLayer, currentLayer.nodes)

      if (activeLayer > 0) {
        const avgActivation = nodeActivations[activeLayer].reduce((a, b) => a + b, 0) / nodeActivations[activeLayer].length
        audioSynthesizer.playSignalFlow(activeLayer - 1, activeLayer, avgActivation)
      }

      nodeActivations[activeLayer].forEach((activation, nodeIdx) => {
        setTimeout(() => {
          audioSynthesizer.playNeuronPulse(activation, activeLayer, nodeIdx)
        }, nodeIdx * 80 + 600)
      })
    }
  }, [activeLayer, isAnimating, soundEnabled, layers, nodeActivations])

  const renderConnections = (fromLayer: number, toLayer: number, svgWidth: number, svgHeight: number) => {
    const fromNodes = layers[fromLayer].nodes
    const toNodes = layers[toLayer].nodes
    const connections = []
    
    const nodeSize = 56
    const nodeRadius = nodeSize / 2
    const nodeGap = 12

    const fromTotalHeight = fromNodes * nodeSize + (fromNodes - 1) * nodeGap
    const toTotalHeight = toNodes * nodeSize + (toNodes - 1) * nodeGap
    
    const fromStartY = (svgHeight - fromTotalHeight) / 2
    const toStartY = (svgHeight - toTotalHeight) / 2

    for (let i = 0; i < fromNodes; i++) {
      for (let j = 0; j < toNodes; j++) {
        const isActive = isAnimating && activeLayer === fromLayer
        const connectionId = `conn-${fromLayer}-${toLayer}-${i}-${j}`
        
        const fromCenterY = fromStartY + i * (nodeSize + nodeGap) + nodeRadius
        const toCenterY = toStartY + j * (nodeSize + nodeGap) + nodeRadius
        
        const dx = svgWidth
        const dy = toCenterY - fromCenterY
        const angle = Math.atan2(dy, dx)
        
        const x1 = nodeRadius + nodeRadius * Math.cos(angle)
        const y1 = fromCenterY + nodeRadius * Math.sin(angle)
        const x2 = svgWidth - nodeRadius + nodeRadius * Math.cos(angle)
        const y2 = toCenterY - nodeRadius * Math.sin(angle)
        
        const pathLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
        const delay = i * 0.08 + j * 0.04
        
        connections.push(
          <g key={connectionId}>
            <motion.line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={layers[fromLayer].color}
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.2}
            />
            
            {isActive && (
              <>
                <motion.line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={layers[fromLayer].color}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeDasharray={pathLength}
                  strokeDashoffset={pathLength}
                  animate={{
                    strokeDashoffset: [pathLength, 0],
                    opacity: [0, 1, 0.5]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: delay,
                    ease: "easeOut",
                    repeatDelay: 0.6
                  }}
                  style={{
                    filter: `drop-shadow(0 0 4px ${layers[fromLayer].glowColor})`
                  }}
                />
                
                <motion.circle
                  r={4}
                  fill={layers[fromLayer].glowColor}
                  animate={{
                    cx: [x1, x2],
                    cy: [y1, y2],
                    opacity: [1, 1, 0],
                    scale: [1, 1.2, 0.5]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: delay,
                    ease: "easeOut",
                    repeatDelay: 0.6
                  }}
                  style={{
                    filter: `drop-shadow(0 0 6px ${layers[fromLayer].glowColor})`
                  }}
                />
              </>
            )}
          </g>
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
          Watch light flow through the neural network as signals pass between neurons, with audio feedback for each activation
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
                        const isNodeReceiving = isAnimating && activeLayer === layerIdx - 1
                        const activation = nodeActivations[layerIdx][nodeIdx]
                        const pulseIntensity = activation
                        const glowSize = 20 + (activation * 20)
                        const scaleMax = 1 + (activation * 0.2)
                        const rippleScale = 1.8 + (activation * 0.5)
                        const nodeDelay = nodeIdx * 0.08
                        
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
                              animate={(isNodeActive || isNodeReceiving) ? {
                                scale: [1, scaleMax, 1],
                                boxShadow: [
                                  `0 0 ${glowSize * 0.3}px ${layer.glowColor}`,
                                  `0 0 ${glowSize}px ${layer.glowColor}, 0 0 ${glowSize / 2}px ${layer.glowColor}, inset 0 0 ${glowSize * 0.4}px ${layer.glowColor}`,
                                  `0 0 ${glowSize * 0.3}px ${layer.glowColor}`,
                                ],
                                opacity: [0.8, 1, 0.8],
                                filter: [
                                  'brightness(1)',
                                  `brightness(${1 + activation * 0.4})`,
                                  'brightness(1)'
                                ]
                              } : {
                                scale: 1,
                                boxShadow: `0 0 0px ${layer.glowColor}`,
                                opacity: 0.65,
                                filter: 'brightness(0.9)'
                              }}
                              transition={{
                                duration: 1.2,
                                repeat: (isNodeActive || isNodeReceiving) ? Infinity : 0,
                                delay: isNodeReceiving ? nodeDelay + 0.6 : nodeDelay,
                                ease: "easeInOut",
                                repeatDelay: 0
                              }}
                            >
                              <span className="relative z-10 drop-shadow-lg">{nodeIdx + 1}</span>
                              <motion.div
                                className="absolute inset-0 rounded-full pointer-events-none"
                                style={{
                                  background: `radial-gradient(circle, rgba(255,255,255,${activation * 0.6}) 0%, rgba(255,255,255,${activation * 0.2}) 50%, transparent 70%)`,
                                }}
                                animate={(isNodeActive || isNodeReceiving) ? {
                                  scale: [1, 1.3, 1],
                                  opacity: [pulseIntensity * 0.6, pulseIntensity * 0.9, pulseIntensity * 0.6],
                                  rotate: [0, 180, 360]
                                } : {
                                  opacity: 0,
                                }}
                                transition={{
                                  duration: 1.2,
                                  repeat: (isNodeActive || isNodeReceiving) ? Infinity : 0,
                                  delay: isNodeReceiving ? nodeDelay + 0.6 : nodeDelay,
                                  ease: "linear",
                                  repeatDelay: 0
                                }}
                              />
                            </motion.div>
                            
                            {(isNodeActive || isNodeReceiving) && (
                              <>
                                <motion.div
                                  className="absolute inset-0 rounded-full pointer-events-none"
                                  style={{
                                    backgroundColor: layer.color,
                                    opacity: 0.4 * pulseIntensity
                                  }}
                                  initial={{ scale: 1, opacity: 0.4 * pulseIntensity }}
                                  animate={{
                                    scale: [1, rippleScale, rippleScale + 0.3],
                                    opacity: [0.4 * pulseIntensity, 0.15 * pulseIntensity, 0],
                                  }}
                                  transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    delay: isNodeReceiving ? nodeDelay + 0.6 : nodeDelay,
                                    ease: "easeOut",
                                    repeatDelay: 0
                                  }}
                                />
                                {activation > 0.65 && (
                                  <motion.div
                                    className="absolute inset-0 rounded-full pointer-events-none"
                                    style={{
                                      backgroundColor: layer.color,
                                      opacity: 0.35
                                    }}
                                    initial={{ scale: 1, opacity: 0.35 }}
                                    animate={{
                                      scale: [1, rippleScale + 0.4, rippleScale + 0.8],
                                      opacity: [0.35, 0.15, 0],
                                    }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Infinity,
                                      delay: (isNodeReceiving ? nodeDelay + 0.6 : nodeDelay) + 0.4,
                                      ease: "easeOut",
                                      repeatDelay: 0
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

        <div className="flex justify-center gap-3 flex-wrap">
          <Button
            onClick={() => {
              const newState = !isAnimating
              setIsAnimating(newState)
              if (soundEnabled) {
                if (newState) {
                  audioSynthesizer.playStartSound()
                } else {
                  audioSynthesizer.playStopSound()
                }
              }
            }}
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
          
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            size="lg"
            variant="outline"
          >
            {soundEnabled ? (
              <>
                <SpeakerHigh weight="fill" />
                Sound On
              </>
            ) : (
              <>
                <SpeakerSlash weight="fill" />
                Sound Off
              </>
            )}
          </Button>
        </div>

        <div className="bg-muted/30 rounded-xl p-6 space-y-4">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              {isAnimating
                ? `✨ Signals flowing through ${layers[activeLayer].name} layer!`
                : '👆 Press start to watch light travel through the network'}
            </div>
            <p className="text-sm text-muted-foreground">
              {isAnimating
                ? 'Watch the glowing particles travel along connections and light up neurons! Listen to the neural signals as they flow through each layer. 🎵'
                : 'Neural networks pass information from layer to layer, just like signals traveling through wires. Turn on sound to hear the neural activity!'}
            </p>
          </div>
          
          <div className="bg-background/50 rounded-lg p-4">
            <div className="text-sm font-semibold mb-3 text-center">Neuron Activation Intensity</div>
            <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <span className="text-muted-foreground">Low (40-65%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-primary/70 shadow-sm shadow-primary/30" />
                <span className="text-muted-foreground">Medium (65-80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50" />
                <span className="text-muted-foreground">High (80-100%)</span>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Higher activation = brighter glow, stronger pulse, larger ripples, and higher-pitched sound! 💫
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
