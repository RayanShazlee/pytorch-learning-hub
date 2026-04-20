/**
 * PyTorchChatbot
 * ──────────────
 * A self-contained assistant that answers PyTorch questions *without* an API
 * key. The knowledge base is:
 *
 *  1. Every docTopic on the site (the learner's own curriculum).
 *  2. Every entry in the Applications catalogue.
 *  3. A curated list of pytorch-vs-the-rest motivation Q&As.
 *  4. A handful of "intent" answers for meta questions ("what is this site?",
 *     "how do I start?", "do I need a GPU?" …).
 *
 * Scoring is a lightweight TF-IDF-ish term overlap with a small synonym table
 * (so "tensorflow" queries don't fall through — we answer honestly). We return
 * the top answer as the main body and the next two as "Related" chips that link
 * the learner to the relevant doc / application.
 *
 * Design goals (in priority order):
 *   • Never hallucinate. Every answer is pulled verbatim from a fact we wrote
 *     down in this repo — if nothing matches well we say so and offer the best
 *     adjacent topics.
 *   • Stay in the browser. No backend, no key, no rate limits.
 *   • Be useful on the FIRST message. The home screen already renders a few
 *     suggested questions you can click.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChatCircleDots,
  PaperPlaneRight,
  Robot,
  User,
  X,
  Sparkle,
  ArrowRight,
  Lightbulb,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { docTopics } from '@/lib/docs'
import type { DocTopic } from '@/lib/docs'
import { applications, pytorchMotivation } from '@/lib/applications'
import type { Application } from '@/lib/applications'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────────────────────────────────────────
//  Knowledge base
// ──────────────────────────────────────────────────────────────────────────────

type Link =
  | { kind: 'topic'; topic: DocTopic }
  | { kind: 'application'; app: Application }

interface KBEntry {
  id: string
  question: string
  /** keywords / synonyms that should match this entry */
  keywords: string[]
  answer: string
  links?: Link[]
}

// Expanded topic descriptions (so the chatbot has something richer than the
// one-line card description to return when asked about a specific concept).
const topicLongAnswers: Record<string, string> = {
  'pytorch-intro':
    "PyTorch is an open-source deep-learning framework built around two ideas: Tensor (an n-dimensional array that can live on CPU or GPU) and Autograd (automatic reverse-mode differentiation). Together they let you write models as plain Python — no session / graph / compile step — while still getting GPU-accelerated performance.",
  'tensor-fundamentals':
    "A tensor is PyTorch's core data container. Think of it as a NumPy array with super-powers: it can sit on a GPU, remember how it was computed (so autograd can differentiate it), and ship inside models. Every layer input, every parameter, every gradient is a tensor.",
  'tensor-broadcasting':
    "Broadcasting is the rule that lets PyTorch add a (128,) bias to a (32, 128) batch, or multiply a (3, 1, 4) by a (1, 5, 4) without writing a loop. Two shapes are compatible when — going from the right — each dim is equal, or one of them is 1.",
  'autograd-basics':
    "Autograd records every operation on tensors that have requires_grad=True. Calling .backward() on the final scalar walks that graph in reverse and fills .grad on every leaf tensor with ∂(output)/∂(leaf). That is the *entire* magic behind training neural nets in PyTorch.",
  'nn-module':
    "nn.Module is the base class for every model or layer. You subclass it, declare submodules in __init__, and implement forward(). PyTorch then automatically tracks parameters, moves them to GPU with .to(device), and saves them with .state_dict().",
  'cnn-architectures':
    "A convolutional network alternates Conv2d (learned filters slid over the image) with pooling (downsample) and ends in a Linear classifier. Modern variants add BatchNorm for stable training, residual connections so deep nets train, and global average pooling instead of huge fully-connected heads.",
  'rnn-lstm':
    "RNNs and LSTMs process sequences one step at a time, carrying a hidden state forward. LSTMs add gates (input, forget, output) so long sequences don't vanish. In 2026 transformers have replaced them for most NLP, but LSTMs are still strong for small-data time-series and streaming.",
  'transformers':
    'Transformers replace recurrence with self-attention: every token looks at every other token weighted by a learned similarity. That makes training parallel (huge speedup) and lets the model capture long-range dependencies. Every modern LLM — Llama, GPT, Gemini, Claude — is a transformer.',
  'loss-functions':
    "Pick the loss that matches your output type: MSELoss for regression, CrossEntropyLoss for multi-class classification (feed RAW logits, not softmax), BCEWithLogitsLoss for multi-label / binary. The loss is the SCALAR you call .backward() on.",
  'optimizers':
    'The optimizer takes the gradients autograd computed and updates the parameters. SGD is the classic; Adam adapts a per-parameter learning rate; AdamW is Adam with decoupled weight decay and is the default for modern transformers. Call optimizer.step() after backward(), and zero_grad() before the next iteration.',
  'training-loop':
    'The training loop is just four lines repeated: forward(), loss = loss_fn(y_hat, y), loss.backward(), optimizer.step(). Wrap it in a for-loop over DataLoader batches and you have trained a model.',
  'custom-autograd':
    "For fused ops or non-standard gradients you can subclass torch.autograd.Function and implement forward() and backward() yourself. PyTorch then treats it as a first-class differentiable primitive.",
}

function keywordsForTopic(t: DocTopic): string[] {
  const raw = `${t.title} ${t.description} ${t.category} ${topicLongAnswers[t.id] ?? ''}`
  const words = raw
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)
  return Array.from(new Set(words))
}

function keywordsForApp(a: Application): string[] {
  const raw = `${a.name} ${a.tagline} ${a.whyPyTorch} ${a.examples.join(' ')} ${a.category}`
  const words = raw
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)
  return Array.from(new Set(words))
}

// Curated Q&A covering the *meta* questions a learner asks before they know
// what to type.
const curatedQA: KBEntry[] = [
  {
    id: 'q-what-is-pytorch',
    question: 'What is PyTorch?',
    keywords: ['what', 'is', 'pytorch', 'introduction', 'framework', 'definition', 'explain'],
    answer:
      "PyTorch is an open-source deep-learning framework from Meta. Its two core ideas are the **Tensor** (a GPU-ready NumPy array) and **Autograd** (automatic differentiation). Together they let you write models as normal Python code and train them on CPU, GPU, or Apple Silicon with the same source.",
  },
  {
    id: 'q-why-pytorch',
    question: 'Why learn PyTorch?',
    keywords: ['why', 'pytorch', 'learn', 'reason', 'bother', 'motivation', 'career', 'worth'],
    answer:
      [
        'A few concrete reasons:',
        '',
        ...pytorchMotivation.map((m) => `• **${m.claim}** ${m.detail}`),
      ].join('\n'),
  },
  {
    id: 'q-pytorch-vs-tensorflow',
    question: 'PyTorch vs TensorFlow — which should I learn?',
    keywords: ['tensorflow', 'tf', 'keras', 'versus', 'vs', 'compare', 'comparison', 'jax', 'difference'],
    answer:
      [
        "Short answer: learn **PyTorch first** in 2026.",
        '',
        '• **Research dominance.** > 80% of new papers on arXiv ship PyTorch code.',
        '• **Developer experience.** Dynamic graphs mean `print(tensor)` and `pdb` just work — no `tf.Session` or tracing mysteries.',
        '• **LLM era.** Every open-weight LLM (Llama, Mistral, Gemma, Qwen) is PyTorch-first.',
        '• **TensorFlow is still fine** for some production stacks (TF-Lite on Android, TFX pipelines at Google). Once you know PyTorch, reading TensorFlow is a one-week switch.',
        '• **JAX** is increasingly popular for research at DeepMind / Anthropic — learn it AFTER PyTorch, not instead of.',
      ].join('\n'),
  },
  {
    id: 'q-do-i-need-gpu',
    question: 'Do I need a GPU to learn PyTorch?',
    keywords: ['gpu', 'need', 'cpu', 'hardware', 'cuda', 'require', 'laptop', 'mac', 'apple', 'mps', 'colab'],
    answer:
      [
        'No, you can start on a plain laptop.',
        '',
        '• **CPU is fine** for every topic on this site and for any model under ~10M parameters.',
        '• **Apple Silicon (M1/M2/M3/M4)** has native MPS acceleration — `device = torch.device("mps")`.',
        '• **Google Colab** gives you a free T4 GPU in the browser — good for fine-tuning BERT, Stable Diffusion inference, small CNNs.',
        '• Only when you start pre-training from scratch or fine-tuning 7B+ LLMs do you need a serious GPU (RTX 3090/4090 or A100).',
      ].join('\n'),
  },
  {
    id: 'q-start',
    question: 'How do I start?',
    keywords: ['start', 'begin', 'beginner', 'first', 'how', 'roadmap', 'order', 'path'],
    answer:
      [
        'Suggested path through this site:',
        '',
        '1. **Introduction to PyTorch** — install + verify.',
        '2. **Tensor Fundamentals** — the data type you will use forever.',
        '3. **Automatic Differentiation** — what `.backward()` actually does.',
        '4. **Neural Network Modules** — your first `nn.Module`.',
        '5. **Loss Functions + Optimizers + Training Loop** — combine them to train.',
        '6. Then pick a vertical: CNNs, RNNs/LSTMs, or Transformers.',
        '',
        'Every topic has a runnable playground on its Code tab — actually run the snippets, don\'t just read them.',
      ].join('\n'),
  },
  {
    id: 'q-what-is-this-site',
    question: 'What is this site?',
    keywords: ['site', 'website', 'this', 'app', 'what', 'for'],
    answer:
      "A self-contained PyTorch learning hub. You get 30+ topics with interactive visualizations, hoverable per-symbol code explanations, an in-browser Python playground (Pyodide + a numpy-backed torch shim), a real-world applications explorer, and this chatbot — all without needing a backend.",
  },
  {
    id: 'q-tensor',
    question: 'What is a tensor?',
    keywords: ['tensor', 'what', 'array', 'numpy', 'scalar', 'vector', 'matrix', 'ndarray'],
    answer:
      "A tensor is an n-dimensional array — 0-D is a scalar, 1-D a vector, 2-D a matrix, 3+-D a 'tensor' in the mathematical sense. In PyTorch it's the universal data container: it stores its shape, dtype, device (cpu/cuda/mps), and optionally an autograd graph for gradients.",
  },
  {
    id: 'q-autograd',
    question: 'How does autograd work?',
    keywords: ['autograd', 'gradient', 'backward', 'backprop', 'differentiation', 'derivative', 'chain', 'rule'],
    answer:
      "Every op on a tensor with `requires_grad=True` is recorded as a node in a dynamic computation graph. Calling `.backward()` on the final scalar walks the graph in reverse applying the chain rule, and leaves the partial derivative `∂(output)/∂(leaf)` in each leaf's `.grad`. No symbolic math library needed.",
  },
  {
    id: 'q-gpu',
    question: 'How do I move things to GPU?',
    keywords: ['gpu', 'cuda', 'device', 'to', 'move', 'mps', 'transfer'],
    answer:
      [
        'Pattern:',
        '',
        '```python',
        'device = torch.device("cuda" if torch.cuda.is_available() else "cpu")',
        'model = MyNet().to(device)',
        'x = x.to(device); y = y.to(device)',
        '```',
        '',
        '• Tensors: `x = x.to(device)` returns a NEW tensor on that device.',
        '• Modules: `model.to(device)` moves parameters IN-PLACE.',
        '• Put your data and model on the SAME device before any op — mismatches raise.',
      ].join('\n'),
  },
  {
    id: 'q-save-load',
    question: 'How do I save and load a model?',
    keywords: ['save', 'load', 'checkpoint', 'state_dict', 'pickle', 'persist'],
    answer:
      [
        'Save only the `state_dict`, never the whole Python object — that way model definitions can evolve.',
        '',
        '```python',
        'torch.save(model.state_dict(), "ckpt.pt")',
        '',
        '# later:',
        'model = MyNet()',
        'model.load_state_dict(torch.load("ckpt.pt"))',
        'model.eval()',
        '```',
      ].join('\n'),
  },
  {
    id: 'q-overfitting',
    question: 'My model overfits — what do I do?',
    keywords: ['overfit', 'overfitting', 'regularize', 'regularise', 'dropout', 'weight', 'decay', 'validation'],
    answer:
      [
        'Standard remedies, in order of effort vs reward:',
        '',
        '1. **More data** + stronger augmentation (random crop/flip for images, token dropout for text).',
        '2. **Weight decay** on AdamW (1e-2 is a strong default for transformers).',
        '3. **Dropout** on the penultimate layer (0.1–0.3).',
        '4. **Early stopping** — track validation loss and stop when it plateaus.',
        '5. **Smaller model** — capacity must match dataset size.',
        '6. **Label smoothing** for classification (0.1) — cheap and stabilising.',
      ].join('\n'),
  },
  {
    id: 'q-nan',
    question: 'Why is my loss NaN?',
    keywords: ['nan', 'loss', 'exploding', 'infinity', 'inf', 'unstable', 'blow', 'up', 'diverge'],
    answer:
      [
        'Common causes of NaN loss:',
        '',
        '• Learning rate too high — halve it.',
        '• `log(0)` — feed RAW logits to `CrossEntropyLoss` / `BCEWithLogitsLoss`, not softmax/sigmoid outputs.',
        '• Unnormalised inputs — standardise features to ~N(0,1).',
        '• Divide-by-zero in a custom op — add `eps=1e-6` in denominators.',
        '• Exploding gradients in RNNs — `torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)`.',
        '• fp16 underflow — use `torch.cuda.amp.GradScaler` or switch to bf16.',
      ].join('\n'),
  },
  {
    id: 'q-batch-size',
    question: 'What batch size should I use?',
    keywords: ['batch', 'size', 'memory', 'vram', 'oom', 'accumulate'],
    answer:
      "Rule of thumb: the largest that fits in GPU memory, then halve if your loss is jumpy. Out of memory? Use **gradient accumulation**: run N small batches, call `.backward()` on each (gradients accumulate), then `optimizer.step()` every N steps — effectively the same as a batch N× larger.",
  },
  {
    id: 'q-huggingface',
    question: 'How does PyTorch relate to HuggingFace?',
    keywords: ['huggingface', 'hf', 'transformers', 'diffusers', 'peft', 'tokenizer'],
    answer:
      "HuggingFace's libraries (`transformers`, `diffusers`, `accelerate`, `peft`, `datasets`) are PyTorch modules under the hood. They give you a **unified `AutoModel` / `AutoTokenizer` API** over thousands of pretrained checkpoints. Learning PyTorch directly means you can also read and customise these libraries — they're not black boxes.",
  },
  {
    id: 'q-lightning',
    question: 'What is PyTorch Lightning?',
    keywords: ['lightning', 'wrapper', 'trainer', 'fabric'],
    answer:
      'A thin wrapper that factors out the boilerplate (device moves, distributed training, checkpointing, logging) so your LightningModule only contains the model logic. Great for production; still worth writing a plain PyTorch training loop at least once so you know what it replaces.',
  },
  {
    id: 'q-tensorflow',
    question: 'I know TensorFlow, what transfers?',
    keywords: ['tensorflow', 'tf', 'keras', 'transfer', 'migrate', 'coming', 'from'],
    answer:
      [
        'Most concepts transfer. Big mental swaps:',
        '',
        '• `tf.Tensor` → `torch.Tensor` (same idea, nicer printing).',
        '• `tf.GradientTape` → autograd is implicit whenever `requires_grad=True`.',
        '• `tf.keras.Model` → subclass `nn.Module` and write `forward()` manually.',
        '• `model.fit()` → you write the for-loop yourself (it\'s ~8 lines and you get full control).',
        '• `@tf.function` tracing → PyTorch is eager by default; use `torch.compile(model)` for the same JIT speedup.',
      ].join('\n'),
  },
]

// Build the full searchable KB once.
function buildKB(): KBEntry[] {
  const topicEntries: KBEntry[] = docTopics.map((t) => ({
    id: `topic-${t.id}`,
    question: `Tell me about ${t.title}`,
    keywords: keywordsForTopic(t),
    answer: topicLongAnswers[t.id] ?? `**${t.title}** — ${t.description}. This topic covers ${t.category} material at a ${t.complexity} level and takes about ${t.estimatedTime}.`,
    links: [{ kind: 'topic', topic: t }],
  }))
  const appEntries: KBEntry[] = applications.map((a) => ({
    id: `app-${a.id}`,
    question: `How do I build a ${a.name.toLowerCase()}?`,
    keywords: keywordsForApp(a),
    answer:
      `**${a.name}** — ${a.tagline}\n\n**Why PyTorch:** ${a.whyPyTorch}\n\n**What you'll actually understand:** ${a.learningGoal}\n\n**Hardware:** ${a.hardware}\n\n**Real examples:** ${a.examples.join(' • ')}`,
    links: [
      { kind: 'application', app: a },
      ...a.prerequisiteTopicIds
        .map((id) => docTopics.find((t) => t.id === id))
        .filter((t): t is DocTopic => !!t)
        .slice(0, 3)
        .map<Link>((t) => ({ kind: 'topic' as const, topic: t })),
    ],
  }))
  return [...curatedQA, ...topicEntries, ...appEntries]
}

// Synonyms so the query terms match our stored keywords even when the learner
// uses different vocabulary ("grad" vs "gradient", "net" vs "network").
const SYNONYMS: Record<string, string[]> = {
  grad: ['gradient', 'backward'],
  gradient: ['grad', 'backward'],
  net: ['network', 'model'],
  network: ['net', 'model'],
  model: ['net', 'network', 'module'],
  conv: ['convolution', 'cnn'],
  cnn: ['convolution', 'conv'],
  rnn: ['recurrent', 'lstm', 'gru'],
  lstm: ['rnn', 'recurrent'],
  nlp: ['language', 'text', 'transformer'],
  transformer: ['attention', 'bert', 'gpt', 'llm'],
  llm: ['transformer', 'gpt', 'language'],
  img: ['image', 'vision'],
  image: ['vision', 'cv', 'picture'],
  vision: ['image', 'cv'],
  train: ['training', 'fit'],
  loss: ['error', 'cost', 'objective'],
  gpu: ['cuda', 'device'],
  cuda: ['gpu', 'device'],
  tf: ['tensorflow'],
  tensorflow: ['tf'],
}

function expand(tokens: string[]): string[] {
  const out = new Set(tokens)
  for (const t of tokens) {
    for (const s of SYNONYMS[t] ?? []) out.add(s)
  }
  return [...out]
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)
}

function score(query: string[], kw: string[]): number {
  const set = new Set(kw)
  let s = 0
  for (const q of query) if (set.has(q)) s += 1
  return s
}

interface BestAnswer {
  entry: KBEntry
  score: number
}

function answer(query: string, kb: KBEntry[]): { primary?: BestAnswer; related: BestAnswer[] } {
  const qTokens = expand(tokenize(query))
  if (qTokens.length === 0) return { related: [] }
  const scored = kb
    .map((e) => ({ entry: e, score: score(qTokens, e.keywords) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
  if (scored.length === 0) return { related: [] }
  return { primary: scored[0], related: scored.slice(1, 4) }
}

// ──────────────────────────────────────────────────────────────────────────────
//  Message types
// ──────────────────────────────────────────────────────────────────────────────

interface Msg {
  id: string
  role: 'bot' | 'user'
  text: string
  links?: Link[]
  suggestions?: string[]
}

const SUGGESTED_OPENERS = [
  'What is PyTorch?',
  'PyTorch vs TensorFlow?',
  'How do I start?',
  'Do I need a GPU?',
  'How does autograd work?',
  'How do I build a chatbot?',
  'Why is my loss NaN?',
]

// ──────────────────────────────────────────────────────────────────────────────
//  Rendering helpers
// ──────────────────────────────────────────────────────────────────────────────

function renderAnswerLine(line: string, i: number) {
  // ```python ...``` block
  // (handled at the block-splitting level; here we only see single lines)
  // simple inline **bold** → <strong>
  const parts: Array<ReactNode> = []
  const re = /\*\*(.+?)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) parts.push(line.slice(last, m.index))
    parts.push(<strong key={`b-${i}-${m.index}`}>{m[1]}</strong>)
    last = m.index + m[0].length
  }
  if (last < line.length) parts.push(line.slice(last))
  return <div key={i}>{parts.length === 0 ? '\u00A0' : parts}</div>
}

function RenderAnswer({ text }: { text: string }) {
  // split on fenced code blocks
  const blocks = text.split(/```/)
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((b, bi) => {
        const isCode = bi % 2 === 1
        if (isCode) {
          const body = b.replace(/^\w+\n/, '') // strip language hint
          return (
            <pre
              key={bi}
              className="bg-slate-950 text-slate-100 rounded-lg p-3 font-mono text-xs overflow-auto whitespace-pre"
            >
              <code>{body}</code>
            </pre>
          )
        }
        const lines = b.split('\n')
        return (
          <div key={bi}>
            {lines.map((l, li) => renderAnswerLine(l, li))}
          </div>
        )
      })}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
//  Component
// ──────────────────────────────────────────────────────────────────────────────

interface Props {
  onOpenTopic?: (topic: DocTopic) => void
  onOpenApplications?: () => void
}

export function PyTorchChatbot({ onOpenTopic, onOpenApplications }: Props) {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    {
      id: 'greet',
      role: 'bot',
      text:
        "Hi! I'm the site assistant — ask me anything about PyTorch, any topic here, or what you can build with it. Everything I say is pulled from this site's own knowledge base, so you can trust it and click through to the source.",
      suggestions: SUGGESTED_OPENERS,
    },
  ])
  const [input, setInput] = useState('')
  const kb = useMemo(buildKB, [])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const n = scrollRef.current
    if (n) n.scrollTop = n.scrollHeight
  }, [msgs, open])

  const send = useCallback(
    (raw: string) => {
      const q = raw.trim()
      if (!q) return
      const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', text: q }
      const { primary, related } = answer(q, kb)
      let botMsg: Msg
      if (!primary) {
        botMsg = {
          id: `b-${Date.now()}`,
          role: 'bot',
          text:
            "I don't have a confident answer for that — I only speak from this site's knowledge base. Try rephrasing, or pick one of these starting points:",
          suggestions: SUGGESTED_OPENERS.slice(0, 4),
        }
      } else {
        botMsg = {
          id: `b-${Date.now()}`,
          role: 'bot',
          text: primary.entry.answer,
          links: [
            ...(primary.entry.links ?? []),
            ...related.flatMap((r) => r.entry.links ?? []).slice(0, 3),
          ],
          suggestions: related.slice(0, 3).map((r) => r.entry.question),
        }
      }
      setMsgs((m) => [...m, userMsg, botMsg])
      setInput('')
    },
    [kb],
  )

  return (
    <>
      {/* floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-5 right-5 z-[70] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center',
          'bg-gradient-to-br from-pink via-violet to-cyan text-white',
          'hover:scale-105 transition ring-2 ring-white/40',
        )}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? <X size={22} weight="bold" /> : <ChatCircleDots size={24} weight="fill" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className={cn(
              'fixed z-[69] right-5 bottom-24',
              'w-[min(420px,calc(100vw-2rem))] h-[min(640px,calc(100vh-7rem))]',
              'bg-card border-2 rounded-2xl shadow-2xl flex flex-col overflow-hidden',
            )}
          >
            {/* header */}
            <div className="p-3 border-b bg-gradient-to-br from-pink/10 via-violet/10 to-cyan/10 flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink to-cyan flex items-center justify-center">
                <Robot size={20} weight="fill" className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-1">
                  PyTorch Assistant <Sparkle size={12} weight="fill" className="text-accent" />
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Answers from this site&apos;s own knowledge base — no hallucinations.
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
                <X size={16} />
              </Button>
            </div>

            {/* messages — plain overflow div so it reliably scrolls inside the flex column */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-3"
            >
              {msgs.map((m) => (
                <Message
                  key={m.id}
                  msg={m}
                  onSuggest={send}
                  onOpenTopic={(t) => {
                    setOpen(false)
                    onOpenTopic?.(t)
                  }}
                  onOpenApplications={() => {
                    setOpen(false)
                    onOpenApplications?.()
                  }}
                />
              ))}
            </div>

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="p-3 border-t flex gap-2 items-center bg-background"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about tensors, autograd, LLMs…"
                className="text-sm"
              />
              <Button type="submit" size="icon" className="shrink-0" aria-label="Send">
                <PaperPlaneRight size={16} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
//  Single message bubble
// ──────────────────────────────────────────────────────────────────────────────

function Message({
  msg,
  onSuggest,
  onOpenTopic,
  onOpenApplications,
}: {
  msg: Msg
  onSuggest: (q: string) => void
  onOpenTopic: (t: DocTopic) => void
  onOpenApplications: () => void
}) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink to-cyan flex items-center justify-center shrink-0">
          <Robot size={14} weight="fill" className="text-white" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2 border',
          isUser
            ? 'bg-primary text-primary-foreground border-primary/40 rounded-br-sm'
            : 'bg-muted/40 rounded-bl-sm',
        )}
      >
        {isUser ? (
          <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
        ) : (
          <RenderAnswer text={msg.text} />
        )}

        {!!msg.links?.length && (
          <div className="mt-2 pt-2 border-t border-border/60 flex flex-wrap gap-1.5">
            {msg.links.map((l, i) => {
              if (l.kind === 'topic') {
                return (
                  <button
                    key={i}
                    onClick={() => onOpenTopic(l.topic)}
                    className="text-[11px] inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 px-2 py-0.5"
                    title={l.topic.description}
                  >
                    📖 {l.topic.title} <ArrowRight size={10} />
                  </button>
                )
              }
              return (
                <button
                  key={i}
                  onClick={onOpenApplications}
                  className="text-[11px] inline-flex items-center gap-1 rounded-full border border-cyan/30 bg-cyan/5 hover:bg-cyan/10 px-2 py-0.5"
                  title={l.app.tagline}
                >
                  🚀 {l.app.name} <ArrowRight size={10} />
                </button>
              )
            })}
          </div>
        )}

        {!!msg.suggestions?.length && (
          <div className="mt-2 pt-2 border-t border-border/60">
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
              <Lightbulb size={10} /> Try asking
            </div>
            <div className="flex flex-wrap gap-1">
              {msg.suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSuggest(s)}
                  className="text-[11px] rounded-full border bg-background/80 hover:bg-background px-2 py-0.5 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-muted border flex items-center justify-center shrink-0">
          <User size={14} weight="fill" />
        </div>
      )}
    </div>
  )
}

export default PyTorchChatbot
