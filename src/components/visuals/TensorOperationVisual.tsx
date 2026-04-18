import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X, ArrowsLeftRight, Link } from '@phosphor-icons/react'

type OperationType = 'add' | 'multiply' | 'reshape' | 'concatenate'

export function TensorOperationVisual() {
  const [currentOperation, setCurrentOperation] = useState<OperationType>('add')
  const [isAnimating, setIsAnimating] = useState(false)

  const runAnimation = (operation: OperationType) => {
    setCurrentOperation(operation)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap justify-center">
        <Button
          onClick={() => runAnimation('add')}
          variant={currentOperation === 'add' ? 'default' : 'outline'}
          className="gap-2"
        >
          <Plus weight="bold" />
          Addition
        </Button>
        <Button
          onClick={() => runAnimation('multiply')}
          variant={currentOperation === 'multiply' ? 'default' : 'outline'}
          className="gap-2"
        >
          <X weight="bold" />
          Multiply
        </Button>
        <Button
          onClick={() => runAnimation('reshape')}
          variant={currentOperation === 'reshape' ? 'default' : 'outline'}
          className="gap-2"
        >
          <ArrowsLeftRight weight="bold" />
          Reshape
        </Button>
        <Button
          onClick={() => runAnimation('concatenate')}
          variant={currentOperation === 'concatenate' ? 'default' : 'outline'}
          className="gap-2"
        >
          <Link weight="bold" />
          Concatenate
        </Button>
      </div>

      <div className="relative w-full h-96 bg-gradient-to-br from-pink/5 via-coral/5 to-orange/5 rounded-2xl border-2 border-pink/20 overflow-hidden flex items-center justify-center p-8">
        {currentOperation === 'add' && (
          <div className="flex items-center gap-8">
            <TensorBox values={[1, 2, 3]} color="from-pink to-coral" isAnimating={isAnimating} />
            <motion.div
              className="text-4xl font-bold text-pink"
              animate={{ scale: isAnimating ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              +
            </motion.div>
            <TensorBox values={[4, 5, 6]} color="from-cyan to-secondary" isAnimating={isAnimating} />
            <motion.div className="text-4xl font-bold text-violet">=</motion.div>
            <TensorBox
              values={[5, 7, 9]}
              color="from-lime to-accent"
              isAnimating={isAnimating}
              delay={1}
            />
          </div>
        )}

        {currentOperation === 'multiply' && (
          <div className="flex items-center gap-8">
            <TensorBox values={[1, 2, 3]} color="from-pink to-coral" isAnimating={isAnimating} />
            <motion.div
              className="text-4xl font-bold text-pink"
              animate={{ scale: isAnimating ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              ×
            </motion.div>
            <div className="text-5xl font-bold text-cyan">2</div>
            <motion.div className="text-4xl font-bold text-violet">=</motion.div>
            <TensorBox
              values={[2, 4, 6]}
              color="from-lime to-accent"
              isAnimating={isAnimating}
              delay={1}
            />
          </div>
        )}

        {currentOperation === 'reshape' && (
          <div className="flex items-center gap-8">
            <TensorBox values={[1, 2, 3, 4, 5, 6]} color="from-pink to-coral" isAnimating={isAnimating} layout="1d" />
            <motion.div
              className="text-4xl font-bold text-pink"
              animate={{ rotate: isAnimating ? [0, 360] : 0 }}
              transition={{ duration: 1 }}
            >
              🔄
            </motion.div>
            <TensorBox2D
              values={[[1, 2, 3], [4, 5, 6]]}
              color="from-lime to-accent"
              isAnimating={isAnimating}
              delay={1}
            />
          </div>
        )}

        {currentOperation === 'concatenate' && (
          <div className="flex items-center gap-8">
            <TensorBox values={[1, 2]} color="from-pink to-coral" isAnimating={isAnimating} />
            <motion.div
              className="text-4xl font-bold text-pink"
              animate={{ x: isAnimating ? [0, 10, 0] : 0 }}
              transition={{ duration: 0.5, repeat: isAnimating ? 3 : 0 }}
            >
              🔗
            </motion.div>
            <TensorBox values={[3, 4]} color="from-cyan to-secondary" isAnimating={isAnimating} />
            <motion.div className="text-4xl font-bold text-violet">=</motion.div>
            <TensorBox
              values={[1, 2, 3, 4]}
              color="from-lime to-accent"
              isAnimating={isAnimating}
              delay={1}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function TensorBox({ values, color, isAnimating, delay = 0, layout = '1d' }: { values: number[], color: string, isAnimating: boolean, delay?: number, layout?: '1d' | '2d' }) {
  return (
    <motion.div
      className={`flex gap-2 ${layout === '1d' ? 'flex-row' : 'flex-col'}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isAnimating ? [1, 1.1, 1] : 1,
        opacity: 1
      }}
      transition={{ delay, duration: 0.5 }}
    >
      {values.map((val, i) => (
        <motion.div
          key={i}
          className={`w-16 h-16 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: isAnimating ? [1, 1.05, 1] : 1
          }}
          transition={{ delay: delay + i * 0.1, duration: 0.3 }}
        >
          {val}
        </motion.div>
      ))}
    </motion.div>
  )
}

function TensorBox2D({ values, color, isAnimating, delay = 0 }: { values: number[][], color: string, isAnimating: boolean, delay?: number }) {
  return (
    <motion.div
      className="flex flex-col gap-2"
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isAnimating ? [0, 1.1, 1] : 1,
        opacity: 1
      }}
      transition={{ delay, duration: 0.5 }}
    >
      {values.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-2">
          {row.map((val, colIdx) => (
            <motion.div
              key={`${rowIdx}-${colIdx}`}
              className={`w-16 h-16 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              transition={{ delay: delay + (rowIdx * 3 + colIdx) * 0.1, duration: 0.3 }}
            >
              {val}
            </motion.div>
          ))}
        </div>
      ))}
    </motion.div>
  )
}
