import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus } from '@phosphor-icons/react'

interface TensorVisualizerProps {
  title: string
  description: string
}

export function TensorVisualizer({ title, description }: TensorVisualizerProps) {
  const [dimensions, setDimensions] = useState<number[]>([4])
  const [values, setValues] = useState<number[]>([1, 2, 3, 4])

  const addDimension = () => {
    if (dimensions.length < 3) {
      setDimensions([...dimensions, 2])
      const newSize = dimensions.reduce((acc, dim) => acc * dim, 1) * 2
      setValues(Array.from({ length: newSize }, (_, i) => (i % 10) + 1))
    }
  }

  const removeDimension = () => {
    if (dimensions.length > 1) {
      const newDims = dimensions.slice(0, -1)
      setDimensions(newDims)
      const newSize = newDims.reduce((acc, dim) => acc * dim, 1)
      setValues(Array.from({ length: newSize }, (_, i) => (i % 10) + 1))
    }
  }

  const getColorForIndex = (index: number) => {
    const colors = [
      { bg: 'bg-pink', text: 'text-pink-foreground', gradient: 'from-pink to-coral' },
      { bg: 'bg-violet', text: 'text-violet-foreground', gradient: 'from-violet to-primary' },
      { bg: 'bg-cyan', text: 'text-cyan-foreground', gradient: 'from-cyan to-secondary' },
      { bg: 'bg-lime', text: 'text-lime-foreground', gradient: 'from-lime to-accent' },
      { bg: 'bg-orange', text: 'text-orange-foreground', gradient: 'from-orange to-coral' },
      { bg: 'bg-primary', text: 'text-primary-foreground', gradient: 'from-primary to-violet' },
    ]
    return colors[index % colors.length]
  }

  const render1D = () => (
    <div className="flex gap-2 flex-wrap justify-center">
      {values.map((val, i) => {
        const color = getColorForIndex(i)
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.05, type: 'spring' }}
            className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg bg-gradient-to-br ${color.gradient} text-white shadow-lg`}
            style={{
              boxShadow: `0 4px 12px rgba(0,0,0,0.15), 0 0 8px oklch(0.70 0.28 ${340 + i * 50} / 0.3)`
            }}
          >
            {val}
          </motion.div>
        )
      })}
    </div>
  )

  const render2D = () => {
    const rows = dimensions[0]
    const cols = dimensions[1]
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }, (_, rowIdx) => (
          <div key={rowIdx} className="flex gap-2 justify-center">
            {Array.from({ length: cols }, (_, colIdx) => {
              const idx = rowIdx * cols + colIdx
              const color = getColorForIndex(idx)
              return (
                <motion.div
                  key={colIdx}
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, type: 'spring' }}
                  className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg bg-gradient-to-br ${color.gradient} text-white shadow-lg`}
                  style={{
                    boxShadow: `0 4px 12px rgba(0,0,0,0.15), 0 0 8px oklch(0.70 0.28 ${340 + idx * 40} / 0.3)`
                  }}
                >
                  {values[idx] || 0}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const render3D = () => {
    const depth = dimensions[0]
    const rows = dimensions[1]
    const cols = dimensions[2]
    
    return (
      <div className="flex gap-6 flex-wrap justify-center">
        {Array.from({ length: depth }, (_, depthIdx) => (
          <motion.div
            key={depthIdx}
            initial={{ scale: 0, rotateY: 90 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ delay: depthIdx * 0.15, type: 'spring' }}
            className="flex flex-col gap-2"
          >
            <div className="text-sm font-medium text-center text-muted-foreground mb-1">
              Layer {depthIdx + 1}
            </div>
            {Array.from({ length: rows }, (_, rowIdx) => (
              <div key={rowIdx} className="flex gap-2">
                {Array.from({ length: cols }, (_, colIdx) => {
                  const idx = depthIdx * rows * cols + rowIdx * cols + colIdx
                  const color = getColorForIndex(idx)
                  return (
                    <div
                      key={colIdx}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm bg-gradient-to-br ${color.gradient} text-white shadow-lg`}
                      style={{
                        boxShadow: `0 4px 12px rgba(0,0,0,0.15), 0 0 8px oklch(0.70 0.28 ${340 + idx * 30} / 0.3)`
                      }}
                    >
                      {values[idx] || 0}
                    </div>
                  )
                })}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    )
  }

  const renderTensor = () => {
    if (dimensions.length === 1) return render1D()
    if (dimensions.length === 2) return render2D()
    if (dimensions.length === 3) return render3D()
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Dimensions</div>
            <div className="font-mono font-bold text-xl">
              [{dimensions.join(' × ')}]
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {dimensions.length}D Tensor
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-8 rounded-xl min-h-[200px] flex items-center justify-center">
          {renderTensor()}
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            onClick={removeDimension}
            disabled={dimensions.length === 1}
            variant="outline"
            size="lg"
          >
            <Minus weight="bold" />
            Remove Dimension
          </Button>
          <Button
            onClick={addDimension}
            disabled={dimensions.length === 3}
            size="lg"
          >
            <Plus weight="bold" />
            Add Dimension
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {dimensions.length === 1 && "This is a 1D tensor - like a list of numbers!"}
          {dimensions.length === 2 && "This is a 2D tensor - like a table or image!"}
          {dimensions.length === 3 && "This is a 3D tensor - like stacked images or video frames!"}
        </div>
      </CardContent>
    </Card>
  )
}
