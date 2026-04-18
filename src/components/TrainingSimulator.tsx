import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Play, ArrowCounterClockwise, Trophy } from '@phosphor-icons/react'

export function TrainingSimulator() {
  const [isTraining, setIsTraining] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [loss, setLoss] = useState(100)
  const [learningRate, setLearningRate] = useState([0.01])
  const [showConfetti, setShowConfetti] = useState(false)
  const maxEpochs = 50

  useEffect(() => {
    if (!isTraining) return

    const interval = setInterval(() => {
      setEpoch((prev) => {
        if (prev >= maxEpochs) {
          setIsTraining(false)
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
          return maxEpochs
        }
        return prev + 1
      })

      setLoss((prev) => {
        const decay = 0.05 * learningRate[0] * 100
        const newLoss = prev * (1 - decay)
        return Math.max(newLoss, 0.1)
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isTraining, learningRate])

  const reset = () => {
    setIsTraining(false)
    setEpoch(0)
    setLoss(100)
    setShowConfetti(false)
  }

  const lossData = Array.from({ length: maxEpochs }, (_, i) => {
    if (i >= epoch) return null
    const decay = 0.05 * learningRate[0] * 100
    return 100 * Math.pow(1 - decay, i + 1)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Simulator</CardTitle>
        <CardDescription>
          Watch your model learn and improve over time!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Learning Rate</span>
            <span className="text-sm font-mono font-bold text-primary">
              {learningRate[0].toFixed(3)}
            </span>
          </div>
          <Slider
            value={learningRate}
            onValueChange={setLearningRate}
            min={0.001}
            max={0.1}
            step={0.001}
            disabled={isTraining}
          />
          <p className="text-xs text-muted-foreground">
            Higher learning rate = faster learning, but less precise
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/10 p-4 rounded-lg text-center">
            <div className="text-2xl font-mono font-bold text-secondary">
              {epoch}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Epoch
            </div>
          </div>
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <motion.div
              key={loss}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-2xl font-mono font-bold text-primary"
            >
              {loss.toFixed(2)}
            </motion.div>
            <div className="text-sm text-muted-foreground mt-1">
              Loss
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-6 rounded-xl relative h-64">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lossGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.45 0.15 290)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="oklch(0.45 0.15 290)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            <motion.path
              d={`
                M 0 ${100 - (lossData[0] || 100)}
                ${lossData
                  .map((value, i) => {
                    if (value === null) return ''
                    const x = (i / maxEpochs) * 100
                    const y = 100 - value
                    return `L ${x} ${y}`
                  })
                  .join(' ')}
                L ${(epoch / maxEpochs) * 100} 100
                L 0 100
                Z
              `}
              fill="url(#lossGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            
            <motion.path
              d={`
                M 0 ${100 - (lossData[0] || 100)}
                ${lossData
                  .map((value, i) => {
                    if (value === null) return ''
                    const x = (i / maxEpochs) * 100
                    const y = 100 - value
                    return `L ${x} ${y}`
                  })
                  .join(' ')}
              `}
              stroke="oklch(0.45 0.15 290)"
              strokeWidth="0.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          {epoch > 0 && (
            <div className="absolute top-2 right-2 text-xs text-muted-foreground">
              Loss decreasing →
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            onClick={() => setIsTraining(!isTraining)}
            disabled={epoch >= maxEpochs}
            size="lg"
          >
            <Play weight="fill" />
            {isTraining ? 'Training...' : epoch > 0 ? 'Continue' : 'Start Training'}
          </Button>
          <Button onClick={reset} variant="outline" size="lg">
            <ArrowCounterClockwise weight="bold" />
            Reset
          </Button>
        </div>

        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-coral/10 border border-coral p-4 rounded-lg text-center"
            >
              <Trophy size={32} weight="fill" className="text-coral mx-auto mb-2" />
              <p className="font-bold text-coral">Training Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your model has finished learning!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center text-sm text-muted-foreground">
          {isTraining
            ? 'Your model is learning from data...'
            : epoch === 0
            ? 'Adjust the learning rate and press start!'
            : epoch >= maxEpochs
            ? 'Training complete! Reset to try again.'
            : 'Training paused'}
        </div>
      </CardContent>
    </Card>
  )
}
