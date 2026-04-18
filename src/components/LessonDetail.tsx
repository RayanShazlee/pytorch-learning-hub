import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import type { Lesson } from '@/lib/lessons'
import { TensorVisualizer } from './TensorVisualizer'
import { NeuralNetworkVisualizer } from './NeuralNetworkVisualizer'
import { TrainingSimulator } from './TrainingSimulator'

interface LessonDetailProps {
  lesson: Lesson
  onBack: () => void
  onComplete: () => void
  isCompleted: boolean
}

export function LessonDetail({ lesson, onBack, onComplete, isCompleted }: LessonDetailProps) {
  const renderLessonContent = () => {
    switch (lesson.id) {
      case 'what-is-tensor':
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">Understanding Tensors</h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p>
                    A <strong>tensor</strong> is like a magical container that holds numbers! Think of it like:
                  </p>
                  <ul className="space-y-2">
                    <li>📝 <strong>1D Tensor</strong>: A list of numbers (like your grocery list!)</li>
                    <li>📊 <strong>2D Tensor</strong>: A table of numbers (like a spreadsheet or checkerboard!)</li>
                    <li>📦 <strong>3D Tensor</strong>: Stacked tables (like a stack of papers or video frames!)</li>
                  </ul>
                  <p>
                    In PyTorch, we use tensors to store everything - images, sounds, text, and more!
                  </p>
                </div>
              </CardContent>
            </Card>
            <TensorVisualizer
              title="Interactive Tensor Playground"
              description="Add and remove dimensions to see how tensors change shape!"
            />
          </div>
        )
      
      case 'what-is-neural-network':
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">Neural Networks Explained</h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p>
                    A <strong>neural network</strong> is like a team of friends passing a ball! Each friend (neuron) catches the ball, does something with it, and passes it to the next friend.
                  </p>
                  <ul className="space-y-2">
                    <li>🎯 <strong>Input Layer</strong>: Where your data starts (like a picture of a cat)</li>
                    <li>🔄 <strong>Hidden Layers</strong>: Where the magic happens! Each layer finds patterns</li>
                    <li>✨ <strong>Output Layer</strong>: The final answer (like "This is a cat!")</li>
                  </ul>
                  <p>
                    The network learns by adjusting how each neuron processes information!
                  </p>
                </div>
              </CardContent>
            </Card>
            <NeuralNetworkVisualizer />
          </div>
        )
      
      case 'training-intro':
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">Training Your Model</h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p>
                    <strong>Training</strong> is how your AI learns! It's like practicing a sport:
                  </p>
                  <ul className="space-y-2">
                    <li>🎓 <strong>Examples</strong>: You show the AI lots of examples (like showing pictures of cats)</li>
                    <li>🎯 <strong>Guessing</strong>: The AI makes guesses about what it sees</li>
                    <li>📉 <strong>Learning from Mistakes</strong>: It learns from wrong guesses and gets better!</li>
                    <li>🔄 <strong>Epochs</strong>: Each time it looks at all examples is called an "epoch"</li>
                  </ul>
                  <p>
                    The <strong>learning rate</strong> controls how fast the AI learns. Too fast and it might miss important details. Too slow and it takes forever!
                  </p>
                </div>
              </CardContent>
            </Card>
            <TrainingSimulator />
          </div>
        )
      
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">{lesson.title}</h3>
              <div className="prose prose-lg max-w-none space-y-4">
                <p>{lesson.description}</p>
                <p className="text-muted-foreground">
                  This lesson is coming soon with amazing interactive content!
                </p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto px-6 py-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft weight="bold" />
          Back to Lessons
        </Button>
        
        {!isCompleted && (
          <Button
            onClick={onComplete}
            className="gap-2"
          >
            <CheckCircle weight="bold" />
            Mark as Complete
          </Button>
        )}
      </div>

      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl md:text-5xl font-bold mb-3 leading-tight"
        >
          {lesson.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground"
        >
          {lesson.description}
        </motion.p>
      </div>

      {renderLessonContent()}
    </motion.div>
  )
}
