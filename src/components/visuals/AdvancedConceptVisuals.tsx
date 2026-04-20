/**
 * AdvancedConceptVisuals
 * ──────────────────────
 * Compact, animated, didactic visuals for the advanced PyTorch topics that
 * used to be "docs-only": torch.compile, hooks, gradient checkpointing,
 * mixed precision, DDP / FSDP, profiler, the reparameterisation trick,
 * vmap / torch.func, weight init, quantisation, pruning, and custom
 * autograd functions.
 *
 * Each visual follows the same design language as the rest of the site:
 *   • slate-900 card with subtle border
 *   • framer-motion driven animation (often on a repeating loop)
 *   • optional play / pause / step controls if the concept benefits
 *   • short inline labels so the picture teaches on its own
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// tiny reusable title block so every visual looks consistent
function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-slate-100 font-semibold">{title}</h3>
      <p className="text-slate-400 text-sm">{subtitle}</p>
    </div>
  )
}

function Pill({ tone, children }: { tone: 'emerald' | 'amber' | 'cyan' | 'rose' | 'violet' | 'slate'; children: React.ReactNode }) {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    slate: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  }
  return <span className={`inline-block px-2 py-0.5 rounded-md text-xs border ${map[tone]}`}>{children}</span>
}

// ─────────────────────────────────────────────────────────────────────────
// 1. torch.compile — Python loop vs fused graph
// ─────────────────────────────────────────────────────────────────────────
export function CompileVisual() {
  const [compiled, setCompiled] = useState(false)
  const steps = ['matmul', 'add bias', 'gelu', 'dropout', 'matmul', 'add']
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="torch.compile — from Python loop to fused graph" subtitle="Toggle to watch TorchDynamo capture & Inductor fuse the ops into one kernel." />
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={compiled ? 'outline' : 'default'} onClick={() => setCompiled(false)} className={!compiled ? 'bg-rose-500 hover:bg-rose-600' : ''}>Eager (Python)</Button>
        <Button size="sm" variant={compiled ? 'default' : 'outline'} onClick={() => setCompiled(true)} className={compiled ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>torch.compile(model)</Button>
      </div>
      <div className="relative rounded-lg bg-slate-950/60 border border-slate-800 p-4 h-44 overflow-hidden">
        {!compiled && (
          <div className="flex items-center gap-1 flex-wrap">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                animate={{ backgroundColor: ['rgba(244,63,94,0.15)', 'rgba(244,63,94,0.45)', 'rgba(244,63,94,0.15)'] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: steps.length * 0.5 - 0.5, delay: i * 0.5 }}
                className="px-2 py-1 rounded border border-rose-500/40 text-rose-200 text-xs"
              >{s}</motion.div>
            ))}
            <div className="ml-auto text-xs text-slate-400">each op = a separate CUDA kernel launch</div>
          </div>
        )}
        {compiled && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center h-full"
          >
            <motion.div
              animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.4)', '0 0 0 16px rgba(16,185,129,0)'] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="px-6 py-4 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 font-mono text-sm"
            >
              {steps.join(' → ')}
              <div className="text-center text-xs text-emerald-300/80 mt-2">⚡ one fused kernel</div>
            </motion.div>
          </motion.div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20"><Pill tone="rose">Eager</Pill><div className="text-slate-300 mt-1">Python runs each op. Readable, but every op = Python call + kernel launch.</div></div>
        <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20"><Pill tone="emerald">Compiled</Pill><div className="text-slate-300 mt-1">Dynamo captures the graph, Inductor fuses & autotunes. 1.3–3× speedup typical.</div></div>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Hooks — taps into the pipeline, with a live readout console
// ─────────────────────────────────────────────────────────────────────────
export function HooksVisual() {
  const [tick, setTick] = useState(0)
  const [log, setLog] = useState<Array<{ kind: 'fwd' | 'bwd'; layer: string; info: string }>>([])
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1400)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    // Simulate hook firings in a consistent loop.
    const seq: Array<{ kind: 'fwd' | 'bwd'; layer: string; info: string }> = [
      { kind: 'fwd', layer: 'Conv',   info: 'out.shape = (8, 16, 30, 30)' },
      { kind: 'fwd', layer: 'Linear', info: 'out.shape = (8, 128) · mean=0.12' },
      { kind: 'bwd', layer: 'Linear', info: 'grad.norm = 4.31e-2' },
      { kind: 'bwd', layer: 'Conv',   info: 'grad.norm = 1.07e-1' },
    ]
    setLog(prev => [seq[tick % seq.length], ...prev].slice(0, 4))
  }, [tick])
  const stage = tick % 4
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="Hooks — tap into the data flowing through a module" subtitle="Forward hooks peek at activations; backward hooks peek at (and can rewrite) gradients." />
      <div className="grid grid-cols-[1fr_220px] gap-3">
        <div className="relative rounded-lg bg-slate-950/60 border border-slate-800 p-6 h-56">
          {/* pipeline */}
          <div className="flex items-center justify-between gap-3 h-full">
            {['input', 'Conv', 'ReLU', 'Linear', 'output'].map((name, i) => (
              <div key={i} className="flex-1 relative">
                <div className="h-16 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-200 text-sm font-medium">{name}</div>
                {(name === 'Conv' || name === 'Linear') && (
                  <>
                    <motion.div
                      animate={{ opacity: (stage === 0 && name === 'Conv') || (stage === 1 && name === 'Linear') ? 1 : 0.25, scale: (stage === 0 && name === 'Conv') || (stage === 1 && name === 'Linear') ? 1.1 : 1 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs text-emerald-300 whitespace-nowrap"
                    >fwd hook 🔎</motion.div>
                    <motion.div
                      animate={{ opacity: (stage === 3 && name === 'Conv') || (stage === 2 && name === 'Linear') ? 1 : 0.25, scale: (stage === 3 && name === 'Conv') || (stage === 2 && name === 'Linear') ? 1.1 : 1 }}
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-amber-300 whitespace-nowrap"
                    >bwd hook ✏️</motion.div>
                  </>
                )}
              </div>
            ))}
          </div>
          {/* moving packet forward */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60"
            animate={{ left: ['4%', '24%', '44%', '64%', '84%'] }}
            transition={{ duration: 5.6, repeat: Infinity, ease: 'linear' }}
          />
          {/* moving packet backward (gradient) */}
          <motion.div
            className="absolute top-[62%] w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/60"
            animate={{ left: ['84%', '64%', '44%', '24%', '4%'] }}
            transition={{ duration: 5.6, repeat: Infinity, ease: 'linear', delay: 2.8 }}
          />
        </div>
        {/* live hook console */}
        <div className="rounded-lg bg-black/60 border border-slate-800 p-3 h-56 overflow-hidden font-mono text-[11px]">
          <div className="text-slate-500 mb-2 text-[10px] tracking-widest uppercase">hook console</div>
          <AnimatePresence>
            {log.map((entry, i) => (
              <motion.div
                key={`${tick}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1 - i * 0.2, x: 0 }}
                exit={{ opacity: 0 }}
                className="mb-1.5"
              >
                <span className={entry.kind === 'fwd' ? 'text-emerald-400' : 'text-amber-400'}>
                  {entry.kind === 'fwd' ? '[fwd]' : '[bwd]'}
                </span>
                <span className="text-slate-300"> {entry.layer}</span>
                <div className="text-slate-500 pl-10 text-[10px]">{entry.info}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-400">Green = activations flowing forward · Amber = gradients flowing backward. The right panel is what your hook callback actually sees on each call.</div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Gradient checkpointing — memory vs recompute
// ─────────────────────────────────────────────────────────────────────────
export function GradCheckpointVisual() {
  const [on, setOn] = useState(false)
  const layers = 12
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="Gradient checkpointing — trade compute for memory" subtitle="Keep only a few activations. Recompute the rest on the backward pass." />
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={!on ? 'default' : 'outline'} onClick={() => setOn(false)}>Off (keep all)</Button>
        <Button size="sm" variant={on ? 'default' : 'outline'} onClick={() => setOn(true)} className={on ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>Checkpoint every 3</Button>
      </div>
      <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4">
        <div className="text-xs text-slate-400 mb-2">Activations kept in memory (green = kept, grey = freed & recomputed)</div>
        <div className="flex gap-1">
          {Array.from({ length: layers }).map((_, i) => {
            const kept = !on || i % 3 === 0 || i === layers - 1
            return (
              <motion.div
                key={i}
                animate={{ backgroundColor: kept ? 'rgba(16,185,129,0.6)' : 'rgba(71,85,105,0.4)' }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="flex-1 h-10 rounded border border-slate-700 flex items-center justify-center text-[10px] text-white"
              >L{i + 1}</motion.div>
            )
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1"><span>Memory</span><span>{on ? '~35%' : '100%'}</span></div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><motion.div animate={{ width: on ? '35%' : '100%' }} className="h-full bg-cyan-400" transition={{ duration: 0.5 }} /></div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1"><span>Compute (bwd)</span><span>{on ? '~133%' : '100%'}</span></div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><motion.div animate={{ width: on ? '70%' : '50%' }} className="h-full bg-amber-400" transition={{ duration: 0.5 }} /></div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 4. Mixed precision (AMP) — fp16 forward, fp32 master
// ─────────────────────────────────────────────────────────────────────────
export function AMPVisual() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(v => (v + 1) % 4), 1400)
    return () => clearInterval(t)
  }, [])
  const labels = ['autocast fwd', 'scaled loss', 'scaled backward', 'unscale & step']
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="Mixed precision (AMP) — fast fp16 ops, safe fp32 master weights" subtitle="GradScaler multiplies the loss so tiny gradients don't underflow in half precision." />
      <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4 h-48 relative overflow-hidden">
        <div className="grid grid-cols-2 gap-6 h-full">
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-cyan-300 mb-2">fp32 master weights</div>
            <motion.div animate={{ scale: tick === 3 ? [1, 1.12, 1] : 1 }} className="w-24 h-24 rounded-xl bg-cyan-500/20 border-2 border-cyan-400/60 flex items-center justify-center text-cyan-200 font-mono">W<sub>32</sub></motion.div>
            <div className="text-[10px] text-slate-400 mt-1">always kept</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-amber-300 mb-2">fp16 copies</div>
            <motion.div animate={{ scale: tick <= 2 ? [1, 1.08, 1] : 1 }} className="w-20 h-20 rounded-xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-200 font-mono">W<sub>16</sub></motion.div>
            <div className="text-[10px] text-slate-400 mt-1">used for matmul / conv</div>
          </div>
        </div>
        {/* arrow between */}
        <motion.div
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500"
        >↔</motion.div>
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <AnimatePresence mode="wait">
            <motion.div key={tick} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-emerald-300 font-medium">{labels[tick]}</motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-400">Speed: ~1.5–2× on Ampere+. Memory: ~50% less. Accuracy: basically identical to fp32 when you use GradScaler.</div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 5. DDP — all-reduce ring across GPUs
// ─────────────────────────────────────────────────────────────────────────
export function DDPVisual() {
  const gpus = 4
  const [phase, setPhase] = useState<'fwd' | 'bwd' | 'reduce' | 'step'>('fwd')
  useEffect(() => {
    const seq: ('fwd' | 'bwd' | 'reduce' | 'step')[] = ['fwd', 'bwd', 'reduce', 'step']
    let i = 0
    const t = setInterval(() => { i = (i + 1) % seq.length; setPhase(seq[i]) }, 1200)
    return () => clearInterval(t)
  }, [])
  const R = 90
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="DistributedDataParallel (DDP) — all-reduce gradients" subtitle="Every GPU holds a full copy of the model. After backward, gradients are averaged in a ring." />
      <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4 h-64 flex items-center justify-center relative">
        <svg width="280" height="240" viewBox="-120 -110 240 220">
          {/* ring arrows */}
          {Array.from({ length: gpus }).map((_, i) => {
            const a = (i / gpus) * Math.PI * 2 - Math.PI / 2
            const b = ((i + 1) / gpus) * Math.PI * 2 - Math.PI / 2
            const x1 = Math.cos(a) * R, y1 = Math.sin(a) * R
            const x2 = Math.cos(b) * R, y2 = Math.sin(b) * R
            const active = phase === 'reduce'
            return (
              <motion.line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={active ? '#34d399' : '#475569'}
                strokeWidth={active ? 3 : 1.5}
                strokeDasharray={active ? '6 4' : '0'}
                animate={active ? { strokeDashoffset: [0, -20] } : {}}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            )
          })}
          {/* GPU nodes */}
          {Array.from({ length: gpus }).map((_, i) => {
            const a = (i / gpus) * Math.PI * 2 - Math.PI / 2
            const x = Math.cos(a) * R, y = Math.sin(a) * R
            const fillMap: Record<string, string> = { fwd: '#06b6d4', bwd: '#f59e0b', reduce: '#10b981', step: '#8b5cf6' }
            return (
              <g key={i}>
                <motion.circle cx={x} cy={y} fill={fillMap[phase]} fillOpacity={0.25} stroke={fillMap[phase]} strokeWidth={2}
                  initial={{ r: 26 }}
                  animate={{ r: [24, 28, 24] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }} />
                <text x={x} y={y + 4} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontFamily="monospace">GPU{i}</text>
              </g>
            )
          })}
        </svg>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs">
          <Pill tone={phase === 'fwd' ? 'cyan' : phase === 'bwd' ? 'amber' : phase === 'reduce' ? 'emerald' : 'violet'}>
            {phase === 'fwd' && 'forward (independent batches)'}
            {phase === 'bwd' && 'backward (local grads)'}
            {phase === 'reduce' && 'all-reduce grads (ring)'}
            {phase === 'step' && 'optimizer.step() — identical weights'}
          </Pill>
        </div>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 6. FSDP — parameter sharding
// ─────────────────────────────────────────────────────────────────────────
export function FSDPVisual() {
  const ranks = 4
  const blocks = 12
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="FSDP — shard parameters, gradients, and optimizer state" subtitle="DDP replicates the model on every GPU. FSDP splits it — fits models 4× larger." />
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4">
          <div className="text-xs text-slate-400 mb-2">DDP: each GPU holds FULL model</div>
          {Array.from({ length: ranks }).map((_, r) => (
            <div key={r} className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-slate-500 w-8">GPU{r}</span>
              <div className="flex gap-0.5 flex-1">
                {Array.from({ length: blocks }).map((_, b) => (
                  <div key={b} className="flex-1 h-3 rounded-sm bg-rose-400/70" />
                ))}
              </div>
            </div>
          ))}
          <div className="mt-2 text-[10px] text-rose-300">memory per GPU: 100%</div>
        </div>
        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4">
          <div className="text-xs text-slate-400 mb-2">FSDP: each GPU holds 1/N</div>
          {Array.from({ length: ranks }).map((_, r) => (
            <div key={r} className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-slate-500 w-8">GPU{r}</span>
              <div className="flex gap-0.5 flex-1">
                {Array.from({ length: blocks }).map((_, b) => {
                  const owner = Math.floor((b / blocks) * ranks) === r
                  return <motion.div key={b} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: b * 0.04 }} className={`flex-1 h-3 rounded-sm ${owner ? 'bg-emerald-400/80' : 'bg-slate-800'}`} />
                })}
              </div>
            </div>
          ))}
          <div className="mt-2 text-[10px] text-emerald-300">memory per GPU: ~25%</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-400">During forward, the layer being executed is temporarily all-gathered, then released. Tiny comms overhead; big memory win.</div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 7. Profiler — trace timeline with a before/after optimisation toggle
// ─────────────────────────────────────────────────────────────────────────
export function ProfilerVisual() {
  const [mode, setMode] = useState<'before' | 'after'>('before')
  const track = (lane: string, color: string, spans: [number, number, string][]) => (
    <div className="relative h-7 mb-1">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 w-14">{lane}</div>
      <div className="ml-16 relative h-full rounded bg-slate-800/60">
        {spans.map(([s, e, label], i) => (
          <motion.div
            key={`${mode}-${lane}-${i}`}
            initial={{ scaleX: 0, opacity: 0.3 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: s / 120, duration: Math.max(0.2, (e - s) / 80) }}
            style={{ left: `${s}%`, width: `${e - s}%`, transformOrigin: 'left' }}
            className={`absolute inset-y-0.5 rounded text-[9px] text-white px-1 flex items-center whitespace-nowrap overflow-hidden ${color}`}
          >{label}</motion.div>
        ))}
      </div>
    </div>
  )
  // BEFORE: data loader blocks the GPU; sequential fwd/bwd; tiny unfused kernels
  const before = {
    data:  [[0, 18, 'dataload'], [50, 68, 'dataload'], [92, 100, 'dataload']] as [number, number, string][],
    gpu_fwd: [[18, 28, 'matmul'], [28, 33, 'add'], [33, 39, 'gelu'], [39, 46, 'matmul']] as [number, number, string][],
    gpu_bwd: [[46, 55, 'bwd-ffn'], [55, 64, 'bwd-attn'], [64, 76, 'bwd-conv']] as [number, number, string][],
    opt:   [[76, 82, 'opt.step']] as [number, number, string][],
    total: 100,
    gpuUtil: 52,
  }
  // AFTER: data overlapped on a second worker; kernels fused by torch.compile; step is compact
  const after = {
    data: [[0, 100, 'async prefetch (num_workers=8, pin_memory)']] as [number, number, string][],
    gpu_fwd: [[2, 28, 'fused-fwd (attn+ffn)']] as [number, number, string][],
    gpu_bwd: [[28, 58, 'fused-bwd']] as [number, number, string][],
    opt:   [[58, 64, 'fused opt.step']] as [number, number, string][],
    total: 64,
    gpuUtil: 91,
  }
  const m = mode === 'before' ? before : after
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="torch.profiler — see exactly where your step spends time" subtitle="Toggle between a naïve run and one optimised after reading the trace." />
      <div className="flex gap-2 mb-3">
        <Button size="sm" variant={mode === 'before' ? 'default' : 'outline'} onClick={() => setMode('before')} className={mode === 'before' ? 'bg-rose-500 hover:bg-rose-600' : ''}>Before (naïve)</Button>
        <Button size="sm" variant={mode === 'after' ? 'default' : 'outline'} onClick={() => setMode('after')} className={mode === 'after' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>After (fused + async I/O)</Button>
      </div>
      <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
        {track('CPU',     'bg-cyan-500/80',    m.data)}
        {track('GPU fwd', 'bg-emerald-500/80', m.gpu_fwd)}
        {track('GPU bwd', 'bg-amber-500/80',   m.gpu_bwd)}
        {track('opt',     'bg-violet-500/80',  m.opt)}
        <div className="ml-16 flex justify-between text-[10px] text-slate-500 mt-2"><span>0 ms</span><span>time →</span><span>{m.total} ms</span></div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div className="p-2 rounded bg-slate-800/60 border border-slate-700"><div className="text-slate-400">step time</div><div className="text-slate-200 font-mono text-sm">{m.total} ms</div></div>
        <div className="p-2 rounded bg-slate-800/60 border border-slate-700"><div className="text-slate-400">GPU util</div><div className={`font-mono text-sm ${m.gpuUtil > 80 ? 'text-emerald-300' : 'text-rose-300'}`}>{m.gpuUtil}%</div></div>
        <div className="p-2 rounded bg-slate-800/60 border border-slate-700"><div className="text-slate-400">speedup</div><div className="text-emerald-300 font-mono text-sm">{(before.total / m.total).toFixed(2)}×</div></div>
      </div>
      <div className="mt-3 text-xs text-slate-400">
        {mode === 'before'
          ? 'Bright gaps on the GPU rows are the loader blocking compute. Tiny matmul/add/gelu bars = unfused kernels — Python overhead dominates.'
          : 'async prefetch keeps the CPU lane full so the GPU never waits. torch.compile fuses attn+ffn into one kernel per phase — fewer launches, higher utilisation.'}
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 8. Reparameterisation trick — sample vs rsample
// ─────────────────────────────────────────────────────────────────────────
export function ReparamVisual() {
  const [mode, setMode] = useState<'sample' | 'rsample'>('rsample')
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="Reparameterisation trick — let gradients flow through sampling" subtitle="sample() blocks gradients; rsample() routes them around the randomness." />
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={mode === 'sample' ? 'default' : 'outline'} onClick={() => setMode('sample')} className={mode === 'sample' ? 'bg-rose-500 hover:bg-rose-600' : ''}>.sample()</Button>
        <Button size="sm" variant={mode === 'rsample' ? 'default' : 'outline'} onClick={() => setMode('rsample')} className={mode === 'rsample' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>.rsample()</Button>
      </div>
      <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4">
        <svg width="100%" viewBox="0 0 480 180">
          {/* nodes */}
          {[
            { x: 40, y: 90, label: 'μ, σ', color: '#06b6d4' },
            { x: 180, y: 40, label: 'ε ~ N(0,1)', color: '#64748b' },
            { x: 240, y: 90, label: 'z = μ + σ·ε', color: '#8b5cf6' },
            { x: 400, y: 90, label: 'loss', color: '#f59e0b' },
          ].map((n, i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={26} fill={n.color} fillOpacity={0.2} stroke={n.color} strokeWidth={2} />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontFamily="monospace">{n.label}</text>
            </g>
          ))}
          {/* forward edges */}
          <line x1={66} y1={90} x2={214} y2={90} stroke="#475569" strokeWidth={2} />
          <line x1={180} y1={60} x2={222} y2={80} stroke="#475569" strokeWidth={2} strokeDasharray="4 3" />
          <line x1={266} y1={90} x2={374} y2={90} stroke="#475569" strokeWidth={2} />
          {/* backward gradient path */}
          <motion.path
            key={mode}
            d="M 374 100 Q 300 150 266 100 L 240 100"
            stroke={mode === 'rsample' ? '#34d399' : '#ef4444'}
            strokeWidth={3}
            fill="none"
            strokeDasharray="6 4"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.path
            d="M 240 110 Q 150 160 66 100"
            stroke={mode === 'rsample' ? '#34d399' : '#ef4444'}
            strokeWidth={3}
            fill="none"
            strokeDasharray="6 4"
            animate={{ strokeDashoffset: [0, -20], opacity: mode === 'rsample' ? 1 : 0.2 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <text x={240} y={170} textAnchor="middle" fill={mode === 'rsample' ? '#34d399' : '#ef4444'} fontSize="11">
            {mode === 'rsample' ? '✓ gradient flows to μ, σ' : '✗ gradient blocked at sample'}
          </text>
        </svg>
      </div>
      <div className="mt-3 text-xs text-slate-400">This is the core insight that makes VAEs trainable.</div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 9. vmap — loop vs vectorised, with live throughput counter
// ─────────────────────────────────────────────────────────────────────────
export function VmapVisual() {
  const batch = 8
  const [vec, setVec] = useState(true)
  const [samplesDone, setSamplesDone] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    setSamplesDone(0)
    setElapsed(0)
  }, [vec])
  useEffect(() => {
    const id = setInterval(() => {
      setSamplesDone(s => s + (vec ? batch : 1))
      setElapsed(t => t + 100)
    }, 100)
    return () => clearInterval(id)
  }, [vec])
  const throughput = elapsed === 0 ? 0 : Math.round((samplesDone / elapsed) * 1000)
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="torch.func.vmap — auto-batch any single-example function" subtitle="Write forward(x) for one example. vmap(forward) runs it over a whole batch, fused." />
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={!vec ? 'default' : 'outline'} onClick={() => setVec(false)}>Python for-loop</Button>
        <Button size="sm" variant={vec ? 'default' : 'outline'} onClick={() => setVec(true)} className={vec ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>vmap(fn)(batch)</Button>
      </div>
      <div className="grid grid-cols-[1fr_180px] gap-3">
        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4 h-44 relative overflow-hidden">
          <div className="absolute top-2 left-3 text-[10px] text-slate-500 font-mono">
            {vec
              ? 'y = vmap(forward)(X)   # X.shape = (8, 10)'
              : 'for i in range(8):\n    y[i] = forward(X[i])'}
          </div>
          {!vec && (
            <div className="space-y-1 mt-8">
              {Array.from({ length: batch }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ backgroundColor: ['rgba(244,63,94,0.15)', 'rgba(244,63,94,0.55)', 'rgba(244,63,94,0.15)'] }}
                  transition={{ duration: 0.35, repeat: Infinity, repeatDelay: batch * 0.35 - 0.35, delay: i * 0.35 }}
                  className="h-3 rounded border border-rose-500/40"
                />
              ))}
              <div className="text-[11px] text-rose-300 mt-2">sequential — {batch} Python iterations per batch</div>
            </div>
          )}
          {vec && (
            <div className="flex flex-col justify-center h-full pt-4">
              <motion.div
                animate={{ scaleX: [0.95, 1, 0.95] }}
                transition={{ duration: 1.0, repeat: Infinity }}
                className="h-14 rounded-lg bg-emerald-500/30 border-2 border-emerald-400/60 flex items-center justify-center text-emerald-200 font-mono text-sm"
              >one vectorised kernel · batch={batch}</motion.div>
              <div className="text-[11px] text-emerald-300 mt-2">same math, zero Python overhead</div>
            </div>
          )}
        </div>
        {/* live counter */}
        <div className="rounded-lg bg-black/60 border border-slate-800 p-3 h-44 flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-slate-500 tracking-widest uppercase">live counter</div>
            <div className="mt-2 font-mono text-[11px] text-slate-400">elapsed</div>
            <div className="font-mono text-lg text-slate-100">{(elapsed / 1000).toFixed(1)} s</div>
            <div className="mt-1 font-mono text-[11px] text-slate-400">samples done</div>
            <div className="font-mono text-lg text-cyan-300">{samplesDone}</div>
          </div>
          <div>
            <div className="font-mono text-[11px] text-slate-400">throughput</div>
            <div className={`font-mono text-xl ${vec ? 'text-emerald-300' : 'text-rose-300'}`}>{throughput} /s</div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-400">Also in torch.func: grad, jacrev, jacfwd, hessian — transforms that compose cleanly. The real win: <span className="text-emerald-300">vmap(grad(loss))(params, x, y)</span> gives per-sample gradients in one line.</div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 10. Weight init — activation histograms at init
// ─────────────────────────────────────────────────────────────────────────
export function InitVisual() {
  type Init = 'zeros' | 'normal_small' | 'kaiming' | 'xavier'
  const [init, setInit] = useState<Init>('kaiming')
  // simulated histograms: array of bar heights per layer (6 layers)
  const hists: Record<Init, number[][]> = {
    zeros:       Array.from({ length: 6 }, (_, i) => Array.from({ length: 9 }, (_, j) => j === 4 ? 0.95 - i * 0.05 : 0.01)),
    normal_small:Array.from({ length: 6 }, (_, i) => {
      const sigma = Math.max(0.05, 0.5 - i * 0.09) // shrinks
      return Array.from({ length: 9 }, (_, j) => Math.exp(-Math.pow((j - 4) / 8, 2) / (2 * sigma * sigma)))
    }),
    kaiming:     Array.from({ length: 6 }, () => Array.from({ length: 9 }, (_, j) => Math.exp(-Math.pow((j - 4) / 3.2, 2)))),
    xavier:      Array.from({ length: 6 }, () => Array.from({ length: 9 }, (_, j) => Math.exp(-Math.pow((j - 4) / 3.2, 2)))),
  }
  const diag: Record<Init, { tone: 'rose' | 'amber' | 'emerald'; text: string }> = {
    zeros:        { tone: 'rose',    text: 'Every neuron computes the same thing. No symmetry breaking → no learning.' },
    normal_small: { tone: 'amber',   text: 'Activations shrink layer-by-layer → vanishing gradients in deep nets.' },
    kaiming:      { tone: 'emerald', text: 'Variance preserved through ReLU layers. The default for modern nets.' },
    xavier:       { tone: 'emerald', text: 'Variance preserved through tanh / sigmoid. Best for older activations.' },
  }
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="Weight initialisation — why the very first numbers matter" subtitle="Histograms of activations at each layer, right after init." />
      <div className="flex flex-wrap gap-2 mb-4">
        {(['zeros', 'normal_small', 'kaiming', 'xavier'] as Init[]).map(k => (
          <Button key={k} size="sm" variant={init === k ? 'default' : 'outline'} onClick={() => setInit(k)}>{k.replace('_', ' ')}</Button>
        ))}
      </div>
      <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4">
        <div className="grid grid-cols-6 gap-2">
          {hists[init].map((bars, layer) => (
            <div key={layer}>
              <div className="flex items-end h-20 gap-0.5">
                {bars.map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: `${Math.max(2, h * 100)}%` }}
                    transition={{ duration: 0.4, delay: layer * 0.05 }}
                    className="flex-1 bg-cyan-400/70 rounded-sm"
                  />
                ))}
              </div>
              <div className="text-[10px] text-slate-500 text-center mt-1">layer {layer + 1}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 text-xs">
        <Pill tone={diag[init].tone}>{init}</Pill>
        <span className="text-slate-300 ml-2">{diag[init].text}</span>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 11. Quantisation — float32 → int8 bins
// ─────────────────────────────────────────────────────────────────────────
export function QuantizationVisual() {
  const [q, setQ] = useState(true)
  const floats = useMemo(() => Array.from({ length: 32 }, (_, i) => Math.sin(i * 0.4) * 0.9 + Math.cos(i * 0.1) * 0.2), [])
  const bins = 8 // pretend this is our int8 palette
  const quantise = (v: number) => {
    const norm = (v + 1) / 2 // [0,1]
    return Math.round(norm * (bins - 1)) / (bins - 1) * 2 - 1
  }
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="Quantisation — round the weights to int8" subtitle="4× smaller model, 2–3× faster on CPU. Tiny accuracy drop if done right." />
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={!q ? 'default' : 'outline'} onClick={() => setQ(false)}>fp32 (32 bits)</Button>
        <Button size="sm" variant={q ? 'default' : 'outline'} onClick={() => setQ(true)} className={q ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>int8 (8 bits)</Button>
      </div>
      <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4">
        <svg width="100%" viewBox="0 0 640 140" className="block">
          {/* axis */}
          <line x1={20} y1={70} x2={620} y2={70} stroke="#334155" strokeWidth={1} />
          {/* quant grid */}
          {q && Array.from({ length: bins }).map((_, i) => {
            const y = 70 - ((i / (bins - 1)) * 2 - 1) * 50
            return <line key={i} x1={20} y1={y} x2={620} y2={y} stroke="#10b981" strokeOpacity={0.2} strokeDasharray="3 3" />
          })}
          {/* float curve */}
          <path d={floats.map((v, i) => `${i === 0 ? 'M' : 'L'} ${20 + (i / (floats.length - 1)) * 600} ${70 - v * 50}`).join(' ')} fill="none" stroke="#06b6d4" strokeWidth={2} opacity={q ? 0.3 : 1} />
          {/* dots */}
          {floats.map((v, i) => {
            const x = 20 + (i / (floats.length - 1)) * 600
            const target = q ? quantise(v) : v
            return (
              <motion.circle
                key={i}
                cx={x}
                animate={{ cy: 70 - target * 50 }}
                r={3}
                fill={q ? '#34d399' : '#22d3ee'}
                transition={{ duration: 0.4 }}
              />
            )
          })}
        </svg>
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20"><Pill tone="cyan">size</Pill><div className="text-slate-300 mt-1">{q ? '~25%' : '100%'}</div></div>
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20"><Pill tone="emerald">cpu speed</Pill><div className="text-slate-300 mt-1">{q ? '2–3× faster' : '1×'}</div></div>
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20"><Pill tone="amber">accuracy</Pill><div className="text-slate-300 mt-1">{q ? '-0.5 to -1%' : 'reference'}</div></div>
        </div>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 12. Pruning — weight grid going sparse
// ─────────────────────────────────────────────────────────────────────────
export function PruneVisual() {
  const [amount, setAmount] = useState(0.5)
  const size = 16 // 16×16 grid
  // deterministic pseudo-random magnitudes
  const weights = useMemo(() => Array.from({ length: size * size }, (_, i) => {
    const r = Math.sin(i * 12.9898) * 43758.5453
    return Math.abs(r - Math.floor(r)) // [0,1)
  }), [])
  const threshold = useMemo(() => {
    const sorted = [...weights].sort((a, b) => a - b)
    return sorted[Math.floor(amount * sorted.length)]
  }, [amount, weights])
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="Pruning — delete the smallest weights" subtitle="Keep the biggest, zero the rest. Retrain briefly and the network recovers." />
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-slate-400">pruning amount</span>
        <input type="range" min={0} max={0.9} step={0.05} value={amount} onChange={e => setAmount(parseFloat(e.target.value))} className="flex-1 accent-emerald-500" />
        <span className="text-xs text-emerald-300 font-mono w-10 text-right">{(amount * 100).toFixed(0)}%</span>
      </div>
      <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
          {weights.map((w, i) => {
            const pruned = w < threshold
            return (
              <motion.div
                key={i}
                animate={{ backgroundColor: pruned ? 'rgba(30,41,59,0.8)' : `rgba(16,185,129,${0.3 + w * 0.7})` }}
                transition={{ duration: 0.3, delay: (i % size) * 0.008 }}
                className="aspect-square rounded-sm border border-slate-800"
              />
            )
          })}
        </div>
        <div className="mt-3 flex justify-between text-xs text-slate-400">
          <span>green = kept weight (brightness = magnitude)</span>
          <span>slate = zeroed</span>
        </div>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 13. Custom autograd Function — forward/backward box
// ─────────────────────────────────────────────────────────────────────────
export function CustomAutogradVisual() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(v => (v + 1) % 2), 1600)
    return () => clearInterval(t)
  }, [])
  const fwd = tick === 0
  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800">
      <Header title="torch.autograd.Function — teach autograd a new move" subtitle="Override forward() to compute, backward() to return its gradient. PyTorch takes care of the rest." />
      <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-6 h-56 relative">
        {/* Box */}
        <div className="absolute inset-6 rounded-xl border-2 border-violet-400/50 bg-violet-500/10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-violet-200 font-semibold mb-1">MyFunction</div>
            <AnimatePresence mode="wait">
              {fwd ? (
                <motion.div key="fwd" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-mono text-xs text-emerald-300">
                  def forward(ctx, x):<br />
                  &nbsp;&nbsp;ctx.save_for_backward(x)<br />
                  &nbsp;&nbsp;return my_op(x)
                </motion.div>
              ) : (
                <motion.div key="bwd" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-mono text-xs text-amber-300">
                  def backward(ctx, grad_out):<br />
                  &nbsp;&nbsp;(x,) = ctx.saved_tensors<br />
                  &nbsp;&nbsp;return grad_out * d_my_op(x)
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* arrows */}
        <motion.div animate={{ opacity: fwd ? 1 : 0.2 }} className="absolute left-0 top-1/2 -translate-y-1/2 text-emerald-300">
          <span className="text-xs block text-center">input</span>
          <span className="text-2xl">→</span>
        </motion.div>
        <motion.div animate={{ opacity: fwd ? 1 : 0.2 }} className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-300">
          <span className="text-xs block text-center">output</span>
          <span className="text-2xl">→</span>
        </motion.div>
        <motion.div animate={{ opacity: !fwd ? 1 : 0.2 }} className="absolute right-0 bottom-2 text-amber-300">
          <span className="text-2xl">←</span>
          <span className="text-xs block text-center">grad_out</span>
        </motion.div>
        <motion.div animate={{ opacity: !fwd ? 1 : 0.2 }} className="absolute left-0 bottom-2 text-amber-300">
          <span className="text-2xl">←</span>
          <span className="text-xs block text-center">grad_in</span>
        </motion.div>
      </div>
      <div className="mt-3 text-xs text-slate-400">Use when you need a custom gradient (non-standard ops, custom CUDA, straight-through estimators).</div>
    </Card>
  )
}
