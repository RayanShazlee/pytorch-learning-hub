import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

type ActivationFunction = 'relu' | 'sigmoid' | 'tanh'

export function ActivationFunctionVisual() {
  const [selectedFunction, setSelectedFunction] = useState<ActivationFunction>('relu')
  const [inputValue, setInputValue] = useState(0)

  const calculateOutput = (input: number, func: ActivationFunction): number => {
    switch (func) {
      case 'relu':
        return Math.max(0, input)
      case 'sigmoid':
        return 1 / (1 + Math.exp(-input))
      case 'tanh':
        return Math.tanh(input)
    }
  }

  const output = calculateOutput(inputValue, selectedFunction)

  const testValues = [-5, -3, -1, 0, 1, 3, 5]

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap justify-center">
        <Button
          onClick={() => setSelectedFunction('relu')}
          variant={selectedFunction === 'relu' ? 'default' : 'outline'}
        >
          ⚡ ReLU
        </Button>
        <Button
          onClick={() => setSelectedFunction('sigmoid')}
          variant={selectedFunction === 'sigmoid' ? 'default' : 'outline'}
        >
          📊 Sigmoid
        </Button>
        <Button
          onClick={() => setSelectedFunction('tanh')}
          variant={selectedFunction === 'tanh' ? 'default' : 'outline'}
        >
          🌊 Tanh
        </Button>
      </div>

      <div className="relative w-full h-96 bg-gradient-to-br from-violet/5 via-primary/5 to-cyan/5 rounded-2xl border-2 border-violet/20 overflow-hidden p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-sm font-semibold mb-2">Input Value</div>
              <motion.div
                className="text-6xl font-bold bg-gradient-to-r from-pink to-coral bg-clip-text text-transparent"
                key={inputValue}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {inputValue}
              </motion.div>
            </div>

            <motion.div
              className="text-5xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ⚙️
            </motion.div>

            <div className="text-center">
              <div className="text-sm font-semibold mb-2">Output Value</div>
              <motion.div
                className="text-6xl font-bold bg-gradient-to-r from-lime to-accent bg-clip-text text-transparent"
                key={output}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {output.toFixed(2)}
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3">
            <div className="text-sm font-semibold mb-2 text-center">Try Different Inputs:</div>
            <div className="grid grid-cols-2 gap-2">
              {testValues.map((val) => (
                <Button
                  key={val}
                  onClick={() => setInputValue(val)}
                  variant={inputValue === val ? 'default' : 'outline'}
                  size="sm"
                >
                  {val > 0 ? '+' : ''}{val}
                </Button>
              ))}
            </div>

            <div className="mt-4 p-4 bg-card rounded-lg border">
              <div className="text-xs font-semibold mb-2">How it works:</div>
              <div className="text-xs text-muted-foreground">
                {selectedFunction === 'relu' && (
                  <p>ReLU: If input &gt; 0, output = input. Otherwise, output = 0. Simple and fast!</p>
                )}
                {selectedFunction === 'sigmoid' && (
                  <p>Sigmoid: Squishes any number between 0 and 1. Perfect for probabilities!</p>
                )}
                {selectedFunction === 'tanh' && (
                  <p>Tanh: Squishes any number between -1 and 1. Great for balanced data!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
