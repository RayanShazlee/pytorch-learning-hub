import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Brain, Sparkle, GraduationCap, Baby } from '@phosphor-icons/react'
import { LessonCard } from '@/components/LessonCard'
import { LessonDetail } from '@/components/LessonDetail'
import { DocCard } from '@/components/DocCard'
import { DocDetail } from '@/components/DocDetail'
import { Confetti } from '@/components/Confetti'
import { lessons, categories } from '@/lib/lessons'
import type { Lesson, LessonStatus } from '@/lib/lessons'
import { docTopics, docCategories } from '@/lib/docs'
import type { DocTopic } from '@/lib/docs'
import { cn } from '@/lib/utils'

type AppMode = 'kids' | 'docs'

function App() {
  const [mode, setMode] = useKV<AppMode>('app-mode', 'kids')
  const [completedLessons, setCompletedLessons] = useKV<string[]>('completed-lessons', [])
  const [completedDocs, setCompletedDocs] = useKV<string[]>('completed-docs', [])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<DocTopic | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showConfetti, setShowConfetti] = useState(false)
  const previousProgressRef = useRef<number>(0)

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

  const handleCompleteDoc = (docId: string) => {
    setCompletedDocs((current) => {
      const currentList = current || []
      if (currentList.includes(docId)) return currentList
      toast.success('Topic completed! ✅', {
        description: 'Excellent progress!',
      })
      return [...currentList, docId]
    })
  }

  const filteredLessons = selectedCategory === 'all' 
    ? lessons 
    : lessons.filter(l => l.category === selectedCategory)

  const filteredDocs = selectedCategory === 'all' 
    ? docTopics 
    : docTopics.filter(d => d.category === selectedCategory)

  const lessonsProgress = ((completedLessons?.length || 0) / lessons.length) * 100
  const docsProgress = ((completedDocs?.length || 0) / docTopics.length) * 100
  const currentProgress = mode === 'kids' ? lessonsProgress : docsProgress

  useEffect(() => {
    const prevProgress = previousProgressRef.current
    if (currentProgress === 100 && prevProgress < 100) {
      setShowConfetti(true)
      const message = mode === 'kids' 
        ? '🎉 Amazing! You completed all lessons!' 
        : '🎉 Congratulations! You completed all documentation topics!'
      toast.success(message, {
        description: mode === 'kids' ? 'You are now a PyTorch master!' : 'You are now a PyTorch expert!',
        duration: 5000,
      })
    }
    previousProgressRef.current = currentProgress
  }, [currentProgress, mode])

  if (selectedLesson) {
    return (
      <>
        <Toaster />
        <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
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

  if (selectedDoc) {
    return (
      <>
        <Toaster />
        <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
        <DocDetail
          topic={selectedDoc}
          onBack={() => setSelectedDoc(null)}
          onComplete={() => {
            handleCompleteDoc(selectedDoc.id)
            setSelectedDoc(null)
          }}
          isCompleted={completedDocs?.includes(selectedDoc.id) || false}
        />
      </>
    )
  }

  return (
    <>
      <Toaster />
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <div className="min-h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 25%, oklch(0.70 0.22 340 / 0.15) 0%, transparent 40%),
              radial-gradient(circle at 85% 20%, oklch(0.60 0.20 220 / 0.15) 0%, transparent 40%),
              radial-gradient(circle at 25% 75%, oklch(0.72 0.18 200 / 0.12) 0%, transparent 40%),
              radial-gradient(circle at 70% 65%, oklch(0.78 0.20 130 / 0.12) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, oklch(0.62 0.24 300 / 0.10) 0%, transparent 50%),
              radial-gradient(circle at 90% 85%, oklch(0.70 0.20 40 / 0.12) 0%, transparent 35%)
            `
          }}
        />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 80px, oklch(0.55 0.22 280 / 0.03) 80px, oklch(0.55 0.22 280 / 0.03) 160px),
              repeating-linear-gradient(-45deg, transparent, transparent 80px, oklch(0.70 0.22 340 / 0.03) 80px, oklch(0.70 0.22 340 / 0.03) 160px)
            `
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
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
                style={{
                  filter: 'drop-shadow(0 0 12px oklch(0.62 0.28 300 / 0.6))'
                }}
              >
                <Brain size={48} weight="duotone" className="text-violet" />
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink via-violet via-cyan to-lime bg-clip-text text-transparent">
                {mode === 'kids' ? 'PyTorch for Kids' : 'PyTorch Documentation'}
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
                style={{
                  filter: 'drop-shadow(0 0 12px oklch(0.75 0.18 50 / 0.6))'
                }}
              >
                <Sparkle size={36} weight="fill" className="text-accent" />
              </motion.div>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              {mode === 'kids' 
                ? 'Learn AI and machine learning with fun animations and interactive lessons!'
                : 'Comprehensive PyTorch tutorials with interactive visualizations and code examples'}
            </p>

            <div className="flex justify-center gap-3 mb-6">
              <Button
                variant={mode === 'kids' ? 'default' : 'outline'}
                size="lg"
                onClick={() => {
                  setMode('kids')
                  setSelectedCategory('all')
                }}
                className={cn(
                  "gap-2 transition-all",
                  mode === 'kids' && "bg-gradient-to-r from-pink to-violet hover:from-pink/90 hover:to-violet/90"
                )}
              >
                <Baby size={20} weight="duotone" />
                Kids Mode
              </Button>
              <Button
                variant={mode === 'docs' ? 'default' : 'outline'}
                size="lg"
                onClick={() => {
                  setMode('docs')
                  setSelectedCategory('all')
                }}
                className={cn(
                  "gap-2 transition-all",
                  mode === 'docs' && "bg-gradient-to-r from-cyan to-primary hover:from-cyan/90 hover:to-primary/90"
                )}
              >
                <GraduationCap size={20} weight="duotone" />
                Full Docs
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-card rounded-2xl p-6 shadow-lg border relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, 
                      oklch(0.70 0.28 340 / 0.15) 0%, 
                      oklch(0.62 0.28 300 / 0.15) 25%, 
                      oklch(0.72 0.26 200 / 0.15) 50%, 
                      oklch(0.78 0.26 130 / 0.15) 75%,
                      oklch(0.70 0.28 340 / 0.15) 100%)
                  `
                }}
              />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">Your Progress</span>
                  <Badge variant="secondary" className="bg-gradient-to-r from-pink/20 to-violet/20 border-pink/30">
                    {mode === 'kids' 
                      ? `${completedLessons?.length || 0} / ${lessons.length} Lessons`
                      : `${completedDocs?.length || 0} / ${docTopics.length} Topics`}
                  </Badge>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink via-violet to-cyan bg-clip-text text-transparent">
                  {Math.round(currentProgress)}%
                </span>
              </div>
              <Progress value={currentProgress} className="h-3" />
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
                  All {mode === 'kids' ? 'Lessons' : 'Topics'}
                </TabsTrigger>
                {(mode === 'kids' ? categories : docCategories).map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="flex-shrink-0">
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${selectedCategory}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {mode === 'kids' ? (
                filteredLessons.map((lesson, index) => (
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
                ))
              ) : (
                filteredDocs.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DocCard
                      topic={doc}
                      onClick={() => setSelectedDoc(doc)}
                      isCompleted={completedDocs?.includes(doc.id)}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>

          {((mode === 'kids' && filteredLessons.length === 0) || (mode === 'docs' && filteredDocs.length === 0)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              No {mode === 'kids' ? 'lessons' : 'topics'} found in this category.
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}

export default App
