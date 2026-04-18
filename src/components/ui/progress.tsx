import { ComponentProps } from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function getColorAtPercentage(percentage: number): string {
  const colors = [
    { pos: 0, color: 'oklch(0.65 0.28 0)' },
    { pos: 15, color: 'oklch(0.70 0.26 30)' },
    { pos: 30, color: 'oklch(0.75 0.24 60)' },
    { pos: 45, color: 'oklch(0.78 0.22 120)' },
    { pos: 60, color: 'oklch(0.72 0.24 180)' },
    { pos: 75, color: 'oklch(0.65 0.26 240)' },
    { pos: 90, color: 'oklch(0.68 0.28 300)' },
    { pos: 100, color: 'oklch(0.70 0.28 340)' }
  ]
  
  for (let i = 0; i < colors.length - 1; i++) {
    if (percentage >= colors[i].pos && percentage <= colors[i + 1].pos) {
      const range = colors[i + 1].pos - colors[i].pos
      const posInRange = percentage - colors[i].pos
      const ratio = posInRange / range
      
      return colors[i].color
    }
  }
  
  return colors[colors.length - 1].color
}

function Progress({
  className,
  value,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root>) {
  const percentage = value || 0
  const currentColor = getColorAtPercentage(percentage)
  
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      style={{
        background: 'linear-gradient(90deg, oklch(0.65 0.28 0 / 0.15) 0%, oklch(0.70 0.26 30 / 0.15) 15%, oklch(0.75 0.24 60 / 0.15) 30%, oklch(0.78 0.22 120 / 0.15) 45%, oklch(0.72 0.24 180 / 0.15) 60%, oklch(0.65 0.26 240 / 0.15) 75%, oklch(0.68 0.28 300 / 0.15) 90%, oklch(0.70 0.28 340 / 0.15) 100%)'
      }}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 transition-all duration-500 ease-out relative"
        style={{ 
          transform: `translateX(-${100 - percentage}%)`,
          background: `linear-gradient(90deg, 
            oklch(0.65 0.28 0) 0%, 
            oklch(0.70 0.26 30) 15%, 
            oklch(0.75 0.24 60) 30%, 
            oklch(0.78 0.22 120) 45%, 
            oklch(0.72 0.24 180) 60%, 
            oklch(0.65 0.26 240) 75%, 
            oklch(0.68 0.28 300) 90%, 
            oklch(0.70 0.28 340) 100%)`,
          boxShadow: `0 0 20px ${currentColor}, 0 0 10px ${currentColor}`
        }}
      >
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: `linear-gradient(90deg, transparent, ${currentColor} 50%, transparent)`,
            opacity: 0.4
          }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
