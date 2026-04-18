import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Sparkle } from '@phosphor-icons/react'
import { LessonCard } from '@/components/LessonCard'
import { LessonDetail } from '@/components/LessonDetail'
import { lessons, categories } from '@/lib/lessons'
import type { Lesson, LessonStatus } from '@/lib/lessons'

function App() {
  const [completedLessons, setCompletedLessons] = useKV<string[]>('completed-lessons', [])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const getLessonStatus = (lessonId: string): LessonStatus => {
    if (completedLessons?.includes(lessonId)) {
      return 'completed'
    }
    return 'available'
  }

  const handleCompleteLesson = (lessonId: string) => {
    setCompletedLessons((current) => {
      const currentList = current || []
      if (currentList.includes(lessonId)) return currentList
      toast.success('Lesson completed! 🎉', {
        description: 'Great job! Keep learning!',
      })
      return [...currentList, lessonId]
    })
  }

  const filteredLessons = selectedCategory === 'all' 
    ? lessons 
    : lessons.filter(l => l.category === selectedCategory)

  const progressPercentage = ((completedLessons?.length || 0) / lessons.length) * 100

  if (selectedLesson) {
    return (
      <>
        <Toaster />
        <LessonDetail
          lesson={selectedLesson}
          onBack={() => setSelectedLesson(null)}
          onComplete={() => {
            handleCompleteLesson(selectedLesson.id)
            setSelectedLesson(null)
          }}
          isCompleted={completedLessons?.includes(selectedLesson.id) || false}
        />
      </>
    )
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, oklch(0.45 0.15 290 / 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, oklch(0.70 0.12 210 / 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, oklch(0.72 0.14 25 / 0.08) 0%, transparent 50%)
            `
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Brain size={48} weight="duotone" className="text-primary" />
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold">
                PyTorch for Kids
              </h1>
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  y: [0, -5, 0, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Sparkle size={36} weight="fill" className="text-accent" />
              </motion.div>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn AI and machine learning with fun animations and interactive lessons!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-card rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">Your Progress</span>
                  <Badge variant="secondary">
                    {completedLessons?.length || 0} / {lessons.length} Lessons
                  </Badge>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-muted/50 p-2">
                <TabsTrigger value="all" className="flex-shrink-0">
                  All Lessons
                </TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="flex-shrink-0">
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredLessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <LessonCard
                    lesson={lesson}
                    status={getLessonStatus(lesson.id)}
                    onClick={() => setSelectedLesson(lesson)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredLessons.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              No lessons found in this category.
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}

export default App