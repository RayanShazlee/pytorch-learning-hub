/**
 * VisualExplainer
 * ───────────────
 * Wraps any visualizer with a rich, expandable "field guide" — the kind of
 * narrative we get on the CV classification visual, now available for every
 * concept in the app.
 *
 * Layout:
 *   ┌────────────────────────────────────────────────────┐
 *   │  Title + one-liner                                  │
 *   │  (children — the actual animated visual)            │
 *   │  ▼ Read the picture (always open on mobile)         │
 *   │  ▼ Step by step                                     │
 *   │  ▼ Try this                                         │
 *   │  ▼ Gotchas                                          │
 *   │  ▼ The math                                         │
 *   └────────────────────────────────────────────────────┘
 */

import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaretDown, Eye, ListNumbers, Lightbulb, Warning, Function as FunctionIcon, Code as CodeIcon, Sparkle } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { VISUAL_EXPLAINERS, type ExplainerEntry } from '@/lib/visualExplainers'

type Props = {
  visualKey: keyof typeof VISUAL_EXPLAINERS
  children: ReactNode
  /** Collapse everything by default; user opens what they want to read. */
  defaultOpen?: boolean
}

export function VisualExplainer({ visualKey, children, defaultOpen = false }: Props) {
  const entry = VISUAL_EXPLAINERS[visualKey] as ExplainerEntry | undefined
  if (!entry) return <>{children}</>

  return (
    <Card className="p-5 border-2 bg-gradient-to-br from-background via-background to-primary/[0.03] space-y-4">
      <div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
          {entry.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{entry.oneLine}</p>
      </div>

      {entry.analogy && (
        <div className="rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4">
          <div className="flex items-center gap-2 mb-1.5 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Sparkle size={16} weight="fill" />
            {entry.analogy.title}
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{entry.analogy.body}</p>
        </div>
      )}

      <div>{children}</div>

      <div className="space-y-2 pt-2 border-t">
        <Section
          icon={<Eye size={16} weight="fill" />}
          label="Read the picture"
          accent="primary"
          defaultOpen={defaultOpen}
        >
          <dl className="space-y-2 text-sm">
            {entry.readThePicture.map((item, i) => (
              <div key={i} className="grid grid-cols-[auto,1fr] gap-3 items-start">
                <dt className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-xs whitespace-nowrap">
                  {item.symbol}
                </dt>
                <dd className="text-muted-foreground leading-relaxed">{item.meaning}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section
          icon={<ListNumbers size={16} weight="fill" />}
          label="Step by step"
          accent="violet"
          defaultOpen={defaultOpen}
        >
          <ol className="space-y-2 text-sm">
            {entry.stepByStep.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-violet/15 text-violet font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="leading-relaxed text-muted-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          icon={<Lightbulb size={16} weight="fill" />}
          label="Try this"
          accent="amber"
        >
          <ul className="space-y-1.5 text-sm">
            {entry.tryThis.map((tip, i) => (
              <li key={i} className="flex gap-2 text-muted-foreground leading-relaxed">
                <span className="text-amber-500 font-bold flex-shrink-0">▸</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          icon={<Warning size={16} weight="fill" />}
          label="Gotchas & common mistakes"
          accent="rose"
        >
          <ul className="space-y-1.5 text-sm">
            {entry.gotchas.map((g, i) => (
              <li key={i} className="flex gap-2 text-muted-foreground leading-relaxed">
                <span className="text-rose-500 font-bold flex-shrink-0">!</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </Section>

        {entry.mathNote && (
          <Section
            icon={<FunctionIcon size={16} weight="fill" />}
            label="The math in one line"
            accent="cyan"
          >
            <div className="rounded-lg bg-muted/50 border p-3 space-y-2">
              <div className="font-mono text-sm text-cyan break-words">{entry.mathNote.formula}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {entry.mathNote.plain}
              </div>
            </div>
          </Section>
        )}

        {entry.realCode && (
          <Section
            icon={<CodeIcon size={16} weight="fill" />}
            label="The PyTorch line this is a zoom-in of"
            accent="lime"
          >
            <pre className="rounded-lg bg-muted/60 border p-3 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
              {entry.realCode}
            </pre>
          </Section>
        )}
      </div>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

function Section({
  icon,
  label,
  accent,
  children,
  defaultOpen = false,
}: {
  icon: ReactNode
  label: string
  accent: 'primary' | 'violet' | 'cyan' | 'amber' | 'rose' | 'lime'
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const accentText: Record<string, string> = {
    primary: 'text-primary',
    violet: 'text-violet',
    cyan: 'text-cyan',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    lime: 'text-lime',
  }
  const accentBg: Record<string, string> = {
    primary: 'bg-primary/5 hover:bg-primary/10',
    violet: 'bg-violet/5 hover:bg-violet/10',
    cyan: 'bg-cyan/5 hover:bg-cyan/10',
    amber: 'bg-amber-500/5 hover:bg-amber-500/10',
    rose: 'bg-rose-500/5 hover:bg-rose-500/10',
    lime: 'bg-lime/5 hover:bg-lime/10',
  }
  return (
    <div className="rounded-lg border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-left transition-colors',
          accentBg[accent],
        )}
      >
        <span className={cn('flex items-center gap-2 font-semibold text-sm', accentText[accent])}>
          {icon}
          {label}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <CaretDown size={14} className={accentText[accent]} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-background/40">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VisualExplainer
