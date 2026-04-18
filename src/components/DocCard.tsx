import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Code, BookOpen } from '@phosphor-icons/react'
import type { DocTopic } from '@/lib/docs'
import { cn } from '@/lib/utils'

interface DocCardProps {
  topic: DocTopic
  onClick: () => void
  isCompleted?: boolean
}

const complexityColors = {
  beginner: 'bg-lime/20 text-lime-foreground border-lime/30',
  intermediate: 'bg-cyan/20 text-cyan-foreground border-cyan/30',
  advanced: 'bg-orange/20 text-orange-foreground border-orange/30',
  expert: 'bg-pink/20 text-pink-foreground border-pink/30',
}

const categoryGradients = {
  basics: 'from-primary/10 via-primary/5 to-transparent',
  tensors: 'from-secondary/10 via-secondary/5 to-transparent',
  autograd: 'from-coral/10 via-coral/5 to-transparent',
  nn: 'from-violet/10 via-violet/5 to-transparent',
  optimization: 'from-cyan/10 via-cyan/5 to-transparent',
  advanced: 'from-orange/10 via-orange/5 to-transparent',
}

export function DocCard({ topic, onClick, isCompleted }: DocCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl border-2",
          isCompleted ? "border-lime/50 bg-lime/5" : "border-border hover:border-primary/30"
        )}
        onClick={onClick}
      >
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          categoryGradients[topic.category]
        )} />
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-violet/20 border border-primary/20">
                <Code size={24} weight="duotone" className="text-primary" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 items-end">
              <Badge className={cn(complexityColors[topic.complexity])}>
                {topic.complexity}
              </Badge>
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-lime flex items-center justify-center"
                >
                  <span className="text-xs text-lime-foreground">✓</span>
                </motion.div>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2 text-foreground">
            {topic.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {topic.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock size={16} weight="duotone" />
              <span>{topic.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen size={16} weight="duotone" />
              <span className="capitalize">{topic.category}</span>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-violet to-cyan"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </Card>
    </motion.div>
  )
}
