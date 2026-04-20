/**
 * ApplicationsExplorer
 * ────────────────────
 * "Here is what people actually BUILD with PyTorch."
 *
 * A learner opens this panel to answer the most important question the site
 * can't answer from the topics alone: *why bother learning any of this?* Each
 * card frames a real-world application, explains why PyTorch is the natural
 * fit, lists the concrete prerequisite topics already on the site (with a
 * jump-link), and shows a toy starter snippet annotated via HoverableCode so
 * the learner can pattern-match PyTorch idioms in context.
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Brain,
  Cpu,
  Lightbulb,
  MagnifyingGlass,
  Sparkle,
  X,
} from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Application,
  AppCategory,
  applications,
  appCategories,
  pytorchMotivation,
} from '@/lib/applications'
import { docTopics } from '@/lib/docs'
import type { DocTopic } from '@/lib/docs'
import { HoverableCode } from '@/components/HoverableCode'
import { cn } from '@/lib/utils'

interface Props {
  onOpenTopic?: (topic: DocTopic) => void
  onClose?: () => void
}

const difficultyColor: Record<Application['difficulty'], string> = {
  beginner: 'bg-lime/10 text-lime border-lime/30',
  intermediate: 'bg-cyan/10 text-cyan border-cyan/30',
  advanced: 'bg-pink/10 text-pink border-pink/30',
}

const categoryIcon: Record<AppCategory, string> = {
  vision: '👁️',
  language: '💬',
  generative: '🎨',
  audio: '🎧',
  rl: '🎮',
  science: '🔬',
  tabular: '📊',
  robotics: '🤖',
  multimodal: '🧩',
}

export function ApplicationsExplorer({ onOpenTopic, onClose }: Props) {
  const [filter, setFilter] = useState<AppCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Application | null>(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return applications.filter((a) => {
      if (filter !== 'all' && a.category !== filter) return false
      if (!q) return true
      return (
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.whyPyTorch.toLowerCase().includes(q) ||
        a.examples.some((e) => e.toLowerCase().includes(q))
      )
    })
  }, [filter, query])

  const topicsById = useMemo(() => {
    const m = new Map<string, DocTopic>()
    for (const t of docTopics) m.set(t.id, t)
    return m
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── header ── */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkle size={28} weight="fill" className="text-accent" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink via-violet to-cyan bg-clip-text text-transparent">
                What you can build with PyTorch
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
              Don&apos;t learn PyTorch to pass a quiz — learn it because these are the
              systems you get to build. Every card below is a real product category
              where PyTorch dominates. Click through for the motivation, the
              prerequisites already on this site, and a starter snippet.
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0" aria-label="Close">
              <X size={22} />
            </Button>
          )}
        </div>

        {/* ── motivation strip ── */}
        <Card className="p-5 mb-6 bg-gradient-to-br from-violet/5 via-cyan/5 to-lime/5 border-2">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={20} weight="fill" className="text-amber-500" />
            <h2 className="font-semibold">Why learn PyTorch at its core?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pytorchMotivation.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-lg bg-background/60 border p-3"
              >
                <div className="font-semibold text-sm mb-1 text-foreground">{m.claim}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{m.detail}</div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* ── filters ── */}
        <div className="flex flex-wrap gap-2 items-center mb-5">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search applications…"
              className="pl-9"
            />
          </div>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          {appCategories.map((c) => (
            <Button
              key={c.id}
              variant={filter === c.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(c.id)}
              className="gap-1"
            >
              <span>{categoryIcon[c.id]}</span>
              {c.label}
            </Button>
          ))}
        </div>

        {/* ── grid with INLINE expansion ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {list.flatMap((app, i) => {
              const isOpen = selected?.id === app.id
              const nodes = [
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    onClick={() => setSelected(isOpen ? null : app)}
                    className={cn(
                      'p-4 h-full cursor-pointer border-2 transition hover:-translate-y-0.5 hover:shadow-lg',
                      'bg-gradient-to-br from-card to-muted/20',
                      isOpen && 'ring-2 ring-primary/60 -translate-y-0.5 shadow-lg',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl" aria-hidden>
                          {categoryIcon[app.category]}
                        </span>
                        <h3 className="font-semibold text-base leading-tight">{app.name}</h3>
                      </div>
                      <Badge variant="outline" className={cn('shrink-0 text-[10px]', difficultyColor[app.difficulty])}>
                        {app.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{app.tagline}</p>
                    <div className="text-[11px] text-muted-foreground space-y-1">
                      <div className="flex items-start gap-1">
                        <Brain size={12} className="mt-0.5 text-violet shrink-0" />
                        <span>{app.whyPyTorch.slice(0, 110)}…</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-80">
                        <Cpu size={12} className="text-cyan shrink-0" />
                        <span className="truncate">{app.hardware}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        {app.prerequisiteTopicIds.length} prerequisite topic
                        {app.prerequisiteTopicIds.length === 1 ? '' : 's'}
                      </span>
                      <span className="flex items-center gap-1 text-primary font-medium">
                        {isOpen ? 'Close' : 'Open'} <ArrowRight size={12} className={cn('transition', isOpen && 'rotate-90')} />
                      </span>
                    </div>
                  </Card>
                </motion.div>,
              ]

              if (isOpen) {
                nodes.push(
                  <motion.div
                    key={`${app.id}-detail`}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="col-span-full"
                  >
                    <div className="rounded-2xl border-2 shadow-lg bg-card overflow-hidden">
                      <div className="p-5 border-b bg-gradient-to-br from-primary/10 via-violet/10 to-cyan/10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{categoryIcon[app.category]}</span>
                            <div>
                              <h2 className="text-xl font-bold">{app.name}</h2>
                              <p className="text-sm text-muted-foreground">{app.tagline}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                            <X size={20} />
                          </Button>
                        </div>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <Badge variant="outline" className={difficultyColor[app.difficulty]}>
                            {app.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <Cpu size={12} /> {app.hardware}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-5 space-y-5">
                        <section>
                          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Lightbulb size={16} weight="fill" className="text-amber-500" /> Why PyTorch is the right tool
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{app.whyPyTorch}</p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-sm mb-2">Shipped examples in the wild</h3>
                          <ul className="space-y-1">
                            {app.examples.map((ex, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-primary shrink-0">•</span>
                                <span>{ex}</span>
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section className="rounded-lg border border-lime/30 bg-lime/5 p-3">
                          <h3 className="font-semibold text-sm mb-1 flex items-center gap-2 text-lime">
                            <Sparkle size={14} weight="fill" /> What you&apos;ll actually understand
                          </h3>
                          <p className="text-sm">{app.learningGoal}</p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-sm mb-2">Prerequisites on this site</h3>
                          <div className="flex flex-wrap gap-2">
                            {app.prerequisiteTopicIds.map((id) => {
                              const t = topicsById.get(id)
                              if (!t) return null
                              return (
                                <button
                                  key={id}
                                  onClick={() => {
                                    onOpenTopic?.(t)
                                    setSelected(null)
                                  }}
                                  className="rounded-full border-2 border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium hover:bg-primary/10 hover:border-primary/60 transition flex items-center gap-1"
                                >
                                  {t.title} <ArrowRight size={12} />
                                </button>
                              )
                            })}
                          </div>
                        </section>

                        <section>
                          <h3 className="font-semibold text-sm mb-2">Starter code</h3>
                          <HoverableCode code={app.starterSnippet} title="starter.py" />
                          <p className="text-[11px] text-muted-foreground mt-2">
                            Hover coloured symbols for explanations. Copy into a Colab notebook to run with the real PyTorch stack.
                          </p>
                        </section>
                      </div>
                    </div>
                  </motion.div>,
                )
              }
              return nodes
            })}
          </AnimatePresence>
        </div>

        {list.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No applications match that search.
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationsExplorer
