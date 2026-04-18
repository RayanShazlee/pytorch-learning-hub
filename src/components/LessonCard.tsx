import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Lightning, 
  Cube, 
  Stack, 
  MagicWand, 
  Network,
  Rows,
  Waveform,
  GraduationCap,
  ChartLineDown,
  ArrowsCounterClockwise,
  Trophy,
  Lock,
  CheckCircle,
} from '@phosphor-icons/react'
import type { Lesson, LessonStatus } from '@/lib/lessons'
import { cn } from '@/lib/utils'

const iconMap = {
  brain: Brain,
  'lightning-charge': Lightning,
  cube: Cube,
  stack: Stack,
  'magic-wand': MagicWand,
  network: Network,
  rows: Rows,
  waveform: Waveform,
  'graduation-cap': GraduationCap,
  'chart-line-down': ChartLineDown,
  'arrows-counter-clockwise': ArrowsCounterClockwise,
  trophy: Trophy,
}

interface LessonCardProps {
  lesson: Lesson
  status: LessonStatus
  onClick: () => void
}

export function LessonCard({ lesson, status, onClick }: LessonCardProps) {
  const Icon = iconMap[lesson.icon as keyof typeof iconMap] || Cube
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'

  return (
    <motion.div
      whileHover={isLocked ? {} : { y: -4, scale: 1.02 }}
      whileTap={isLocked ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all duration-300 h-full relative overflow-hidden',
          isLocked && 'opacity-60 cursor-not-allowed grayscale',
          isCompleted && 'bg-coral/10 border-coral',
          !isLocked && !isCompleted && 'hover:shadow-xl hover:border-primary/50'
        )}
        onClick={isLocked ? undefined : onClick}
      >
        <div 
          className={cn(
            "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -z-10",
            lesson.category === 'fundamentals' && 'bg-primary',
            lesson.category === 'tensors' && 'bg-secondary',
            lesson.category === 'neural-networks' && 'bg-coral',
            lesson.category === 'training' && 'bg-accent'
          )}
        />
        
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div 
              className={cn(
                "p-3 rounded-xl w-fit",
                lesson.category === 'fundamentals' && 'bg-primary/10 text-primary',
                lesson.category === 'tensors' && 'bg-secondary/10 text-secondary',
                lesson.category === 'neural-networks' && 'bg-coral/10 text-coral',
                lesson.category === 'training' && 'bg-accent/10 text-accent-foreground'
              )}
            >
              {isLocked ? (
                <Lock size={28} weight="duotone" />
              ) : (
                <Icon size={28} weight="duotone" />
              )}
            </div>
            
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle size={24} weight="fill" className="text-coral" />
              </motion.div>
            )}
          </div>
          
          <div>
            <CardTitle className="text-xl mb-2 leading-tight">{lesson.title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {lesson.description}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {lesson.duration}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs capitalize",
                lesson.difficulty === 'beginner' && 'border-green-500/50 text-green-700',
                lesson.difficulty === 'intermediate' && 'border-yellow-500/50 text-yellow-700',
                lesson.difficulty === 'advanced' && 'border-orange-500/50 text-orange-700'
              )}
            >
              {lesson.difficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
