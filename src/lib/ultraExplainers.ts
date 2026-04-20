/**
 * Ultra-detail explainers for HoverableCode.
 *
 * Each entry takes the LINE the keyword appears on (plus the full snippet for
 * reference) and returns a structured set of sections explaining the keyword
 * IN CONTEXT — not just the generic API doc.
 *
 * Example:
 *   line:   `model = MLP().eval()`
 *   keyword: `eval`
 *   → identifies the variable `model`, the class `MLP`, and explains:
 *     • what eval() does to a Module
 *     • what specifically changes for `model` (Dropout off, BN frozen)
 *     • what would happen if you forgot it
 *     • when and where to call it
 */

export type UltraSection = {
  heading: string
  body: string
  /** Optional muted code snippet rendered in a styled box */
  code?: string
}

export type UltraContext = {
  /** The full text of the line containing the keyword */
  line: string
  /** The full code snippet (for cross-referencing) */
  fullCode: string
  /** Token immediately before the keyword in the same line, if any */
  prevToken?: string
  /** Token immediately after the keyword (e.g. '(' for a method call) */
  nextToken?: string
}

export type UltraExplainer = (ctx: UltraContext) => UltraSection[]

/** Try to extract the LHS variable name from an assignment line, e.g. `x = ...` → `x`. */
function lhsVar(line: string): string | null {
  const m = /^\s*([A-Za-z_][A-Za-z_0-9]*)\s*=/.exec(line)
  return m ? m[1] : null
}

/** Extract the receiver before a `.method` call, e.g. `model.eval()` → `model`. */
function receiverFor(keyword: string, line: string): string | null {
  // Match either   `<recv>.<keyword>`   or   `<recv>().<keyword>` (chained).
  const re = new RegExp(`([A-Za-z_][A-Za-z_0-9]*(?:\\(\\s*\\))?)\\s*\\.\\s*${keyword}\\b`)
  const m = re.exec(line)
  if (!m) return null
  return m[1].replace(/\(\s*\)$/, '')
}

export const ULTRA_EXPLAINERS: Record<string, UltraExplainer> = {
  // ─────────────────────────────────────────────────────────────────────
  eval: ({ line }) => {
    const recv = receiverFor('eval', line) ?? 'this module'
    const lhs = lhsVar(line)
    const target = lhs ?? recv
    return [
      {
        heading: `What .eval() does to ${recv}`,
        body:
          `Calling .eval() on ${recv} flips a single internal flag — \`self.training = False\` — and then propagates that flag down to every child module inside it. It does NOT freeze weights, does NOT disable autograd, and does NOT change requires_grad. It only switches the BEHAVIOUR of layers that act differently between training and inference.`,
      },
      {
        heading: `What actually changes for ${target}`,
        body:
          `Two layer types behave differently after .eval():\n• nn.Dropout / nn.Dropout2d — stops zeroing activations. Every neuron now contributes.\n• nn.BatchNorm* / nn.LayerNorm with running stats — uses the SAVED running mean/variance instead of the current batch's stats. This makes outputs deterministic and not dependent on batch size.\nIf ${target} contains neither of those, .eval() is effectively a no-op for forward behaviour — but you should still call it as a habit.`,
      },
      {
        heading: 'What if you forget?',
        body:
          `Predictions become noisy and depend on batch size. With Dropout active, the same input gives different outputs each call. With BN in training mode and a small inference batch, your statistics get distorted and accuracy can drop dramatically — a classic "works in training, broken in production" bug.`,
      },
      {
        heading: 'Common pattern',
        code: `${target} = ${recv === 'this module' ? 'MyModel(...)' : recv}.eval()\nwith torch.no_grad():\n    y = ${target}(x)`,
        body:
          `Pair .eval() with \`torch.no_grad()\` (or \`torch.inference_mode()\` in newer PyTorch). .eval() handles layer mode; no_grad disables gradient tracking to save memory and speed up the forward pass.`,
      },
      {
        heading: 'How to undo it',
        body: `Call ${target}.train() to flip back into training mode before resuming gradient descent.`,
      },
    ]
  },

  train: ({ line }) => {
    const recv = receiverFor('train', line) ?? 'this module'
    return [
      {
        heading: `What .train() does to ${recv}`,
        body:
          `Sets \`self.training = True\` on ${recv} and recursively on every submodule. This is the opposite of .eval(). It re-enables the training behaviour of Dropout (random zeroing) and BatchNorm (using current batch statistics + updating running stats).`,
      },
      {
        heading: 'When to call it',
        body:
          `Right before the training loop — and again at the start of each epoch if you switched to .eval() for validation in between. A typical loop looks like:\n• model.train() → run training batches\n• model.eval() → run validation batches\n• model.train() → next epoch.`,
      },
      {
        heading: 'Does it touch gradients?',
        body:
          `No. .train() / .eval() only flip a flag. If you want gradients computed, you also need parameters with requires_grad=True (the default for nn.Module parameters) and you must NOT be inside torch.no_grad().`,
      },
    ]
  },

  backward: ({ line }) => {
    const recv = receiverFor('backward', line) ?? 'loss'
    return [
      {
        heading: `What ${recv}.backward() does`,
        body:
          `Walks the computation graph backwards from ${recv}, applying the chain rule at every node. For every leaf tensor that has \`requires_grad=True\`, it accumulates the gradient ∂${recv}/∂param into that tensor's .grad attribute. After this call, every learnable parameter knows how much it contributed to ${recv}.`,
      },
      {
        heading: 'Crucial: gradients ACCUMULATE',
        body:
          `PyTorch adds new gradients to whatever is already in .grad. That is why you must call optimizer.zero_grad() (or model.zero_grad()) BEFORE this line each iteration — otherwise gradients from previous batches leak into this update and training silently breaks.`,
        code: 'optimizer.zero_grad()\nloss.backward()\noptimizer.step()',
      },
      {
        heading: `Requirement: ${recv} must be a scalar`,
        body:
          `${recv} needs to be a single number (a 0-D tensor). If your loss is a vector, call ${recv}.sum().backward() or ${recv}.mean().backward(). Otherwise PyTorch needs you to pass a gradient argument of matching shape.`,
      },
      {
        heading: 'Where the cost lives',
        body:
          `.backward() runs over the SAVED activations from the forward pass — that is what eats GPU memory during training. If you set retain_graph=True, the graph survives the call and you can backward through it again (rare).`,
      },
    ]
  },

  step: ({ line }) => {
    const recv = receiverFor('step', line) ?? 'optimizer'
    return [
      {
        heading: `What ${recv}.step() does`,
        body:
          `Iterates over every parameter ${recv} is managing and applies the update rule of its specific algorithm (SGD, Adam, AdamW, …) using the gradient currently sitting in each parameter's .grad. This is the moment the model actually CHANGES.`,
      },
      {
        heading: 'Required ordering',
        body:
          `${recv}.step() must come AFTER loss.backward() — it has nothing to apply otherwise — and after ${recv}.zero_grad() at the start of the iteration. The standard rhythm is:`,
        code: `${recv}.zero_grad()\nloss.backward()\n${recv}.step()`,
      },
      {
        heading: 'Different optimizers, different math',
        body:
          `For SGD: param ← param − lr · grad. For Adam: param ← param − lr · m̂ / (√v̂ + ε), where m̂ and v̂ are running estimates of the first and second moments of the gradient. The .step() interface hides which formula is used — that is why you can swap optimizers without touching the loop.`,
      },
    ]
  },

  zero_grad: ({ line }) => {
    const recv = receiverFor('zero_grad', line) ?? 'optimizer'
    return [
      {
        heading: `What ${recv}.zero_grad() does`,
        body:
          `Iterates over every parameter under ${recv} and resets its .grad tensor to zero (or to None if you pass set_to_none=True, which is slightly faster).`,
      },
      {
        heading: 'Why you MUST call it',
        body:
          `PyTorch ADDS gradients to .grad on every backward() call. Without zero_grad(), batch N's gradient piles on top of batches 1..N-1, and the optimizer step uses the wrong direction. The most common silent bug in PyTorch beginners.`,
      },
      {
        heading: 'When to call it',
        body:
          `Right at the START of each iteration, before forward+backward+step. Any other position works mathematically but is harder to read.`,
        code: `for x, y in loader:\n    ${recv}.zero_grad()\n    loss = criterion(model(x), y)\n    loss.backward()\n    ${recv}.step()`,
      },
      {
        heading: 'Tip: gradient accumulation',
        body:
          `Want a bigger effective batch size than fits in memory? Skip zero_grad() for several iterations to ACCUMULATE gradients across mini-batches, then call .step() and .zero_grad() once. Equivalent to a larger batch.`,
      },
    ]
  },

  forward: ({ line }) => {
    const recv = receiverFor('forward', line) ?? 'this module'
    return [
      {
        heading: `What .forward() is on ${recv}`,
        body:
          `The method you OVERRIDE on nn.Module to define the model's computation. Everything that takes inputs and produces outputs lives here.`,
      },
      {
        heading: 'But never call it directly',
        body:
          `Use \`${recv}(x)\` instead of \`${recv}.forward(x)\`. The __call__ magic on nn.Module wraps forward() with hook firing, training/eval flag handling, and other bookkeeping. Calling forward directly skips all of it and is a frequent source of weird bugs (forward hooks not firing, mixed-precision contexts not applying, …).`,
        code: `# Right ✓\ny = ${recv}(x)\n\n# Wrong ✗\ny = ${recv}.forward(x)`,
      },
    ]
  },

  parameters: ({ line }) => {
    const recv = receiverFor('parameters', line) ?? 'model'
    return [
      {
        heading: `What ${recv}.parameters() returns`,
        body:
          `An iterator over every learnable tensor inside ${recv} — that is, every nn.Parameter registered by ${recv} or any of its submodules. Each yielded tensor has requires_grad=True.`,
      },
      {
        heading: 'Where it gets used',
        body:
          `Hand it to the optimizer so it knows which tensors to update:`,
        code: `optimizer = torch.optim.Adam(${recv}.parameters(), lr=1e-3)`,
      },
      {
        heading: 'Filtering parameters',
        body:
          `For partial training (e.g. freezing the backbone of a CNN, only fine-tuning the head), you can pass a filter:`,
        code: `optimizer = torch.optim.Adam(\n    [p for p in ${recv}.parameters() if p.requires_grad],\n    lr=1e-3,\n)`,
      },
      {
        heading: 'Counting params',
        body:
          `\`sum(p.numel() for p in ${recv}.parameters())\` gives you the total parameter count — that single number you brag about when comparing model sizes.`,
      },
    ]
  },

  no_grad: () => [
    {
      heading: 'What torch.no_grad() does',
      body:
        `A context manager that disables gradient tracking for everything inside its block. PyTorch stops building the autograd graph, so no activations are saved and no gradients can flow through these ops.`,
    },
    {
      heading: 'Why you want it for inference',
      body:
        `Saves a LOT of memory (no saved activations) and is faster (less bookkeeping). Always wrap evaluation / inference with it:`,
      code: `model.eval()\nwith torch.no_grad():\n    y = model(x_val)`,
    },
    {
      heading: 'no_grad() vs inference_mode()',
      body:
        `\`torch.inference_mode()\` (newer) is even more aggressive — it tells the runtime that tensors will never be used by autograd later. Slightly faster, but tensors created inside cannot be used in autograd graphs afterwards. Use no_grad() if you might need autograd on the result later.`,
    },
    {
      heading: 'Difference from .eval()',
      body:
        `.eval() flips layer behaviour (Dropout off, BN frozen). no_grad() disables autograd. They are independent — call BOTH for inference.`,
    },
  ],

  to: ({ line }) => {
    const recv = receiverFor('to', line) ?? 'tensor'
    const argMatch = /\.to\(\s*([^)]*)\)/.exec(line)
    const arg = argMatch ? argMatch[1].trim() : 'device or dtype'
    return [
      {
        heading: `What ${recv}.to(${arg}) does`,
        body:
          arg.includes('cuda') || arg.includes('cpu') || arg.includes('mps') || arg.includes('device')
            ? `Moves ${recv} to the specified device. For TENSORS this returns a NEW tensor on that device (the original stays put). For nn.Modules it moves the module IN-PLACE — every parameter and buffer is reallocated on the target device.`
            : arg.includes('float') || arg.includes('half') || arg.includes('bfloat') || arg.includes('int')
            ? `Casts ${recv} to a different dtype. Like device moves, returns a new tensor for tensors, in-place for modules.`
            : `Either moves ${recv} to a different device OR casts it to a different dtype, depending on what you pass.`,
      },
      {
        heading: 'Common pitfall: input must match',
        body:
          `If your model is on cuda but you forget to send the input batch, you get the dreaded "Expected all tensors to be on the same device" error. Move BOTH:`,
        code: `model = model.to('cuda')\nx = x.to('cuda')\ny = model(x)`,
      },
      {
        heading: 'Tensor returns, Module mutates',
        body:
          `\`x = x.to(device)\` — required, .to() on a tensor does NOT mutate in place.\n\`model.to(device)\` — works without reassignment because nn.Module overrides .to() to move things in place.`,
      },
    ]
  },

  detach: ({ line }) => {
    const recv = receiverFor('detach', line) ?? 'tensor'
    return [
      {
        heading: `What ${recv}.detach() does`,
        body:
          `Returns a NEW tensor that shares the same data as ${recv} but is cut out of the autograd graph. Operations on the result do not produce gradients that flow back into ${recv}.`,
      },
      {
        heading: 'Common uses',
        body:
          `• Logging: \`loss.detach().item()\` — get a Python float without keeping the graph alive.\n• Freezing part of the network: pass a detached tensor as input to the part you don't want to train.\n• In GANs: detach the generator output before feeding it to the discriminator's "fake" branch so the discriminator's gradient does not flow back into the generator.`,
        code: `# In a GAN:\nfake = generator(z)\nd_fake = discriminator(fake.detach())  # generator gets no grad here`,
      },
      {
        heading: 'Difference from .clone()',
        body:
          `.clone() copies data but stays in the graph. .detach() shares data but exits the graph. Combine: \`.detach().clone()\` for a true independent copy.`,
      },
    ]
  },

  item: ({ line }) => {
    const recv = receiverFor('item', line) ?? 'tensor'
    return [
      {
        heading: `What ${recv}.item() does`,
        body:
          `Pulls the single number out of a 0-dimensional (scalar) tensor and returns it as a regular Python float / int. Errors if ${recv} contains more than one element.`,
      },
      {
        heading: 'Why you want it',
        body:
          `For logging, comparisons, or storing in Python lists. A tensor on the GPU keeps the autograd graph alive — calling .item() materialises a CPU scalar that is detached and lightweight, so it is safe to print or save in metrics.`,
        code: `print(f"epoch {e}, loss = {loss.item():.4f}")`,
      },
      {
        heading: 'Beware: .item() forces a CPU sync',
        body:
          `On GPU, .item() blocks until the kernel finishes so it can read the value. Avoid calling it inside hot loops — log every N iterations instead.`,
      },
    ]
  },

  Linear: ({ line }) => {
    const argsMatch = /Linear\(\s*([^)]*)\)/.exec(line)
    const args = argsMatch ? argsMatch[1].trim() : ''
    const parts = args.split(',').map((s) => s.trim()).filter(Boolean)
    const inDim = parts[0] ?? '?'
    const outDim = parts[1] ?? '?'
    return [
      {
        heading: `nn.Linear(${args || '...'}) on this line`,
        body:
          `A fully-connected layer that maps a vector of size ${inDim} to a vector of size ${outDim}. Internally it stores a weight matrix of shape (${outDim}, ${inDim}) and a bias of shape (${outDim},). The forward computation is exactly:`,
        code: `y = x @ W.T + b   # x: (batch, ${inDim})  →  y: (batch, ${outDim})`,
      },
      {
        heading: 'Parameters added to the model',
        body:
          `${inDim !== '?' && outDim !== '?' ? `${inDim} × ${outDim} = ${Number.isFinite(+inDim) && Number.isFinite(+outDim) ? +inDim * +outDim : '?'} weights + ${outDim} biases` : `in_features × out_features weights, plus out_features biases`}. These are registered as nn.Parameter so they show up in model.parameters() automatically.`,
      },
      {
        heading: 'Initialisation',
        body:
          `By default PyTorch uses Kaiming-uniform init for the weights and a small uniform range for biases. You usually do not need to change this — the defaults work for ReLU-style nets.`,
      },
      {
        heading: 'Pass bias=False?',
        body:
          `Some patterns (Linear right before BatchNorm/LayerNorm, or in transformer attention projections) set bias=False because the normalisation layer learns its own bias and the Linear's bias is redundant.`,
      },
    ]
  },

  Conv2d: ({ line }) => {
    const argsMatch = /Conv2d\(\s*([^)]*)\)/.exec(line)
    const args = argsMatch ? argsMatch[1].trim() : ''
    return [
      {
        heading: `nn.Conv2d(${args || '...'}) on this line`,
        body:
          `Builds a 2-D convolution layer. It slides a learnable kernel across the spatial dimensions of a (batch, in_channels, H, W) input, producing a (batch, out_channels, H', W') output. Each output channel uses its own kernel tuned during training.`,
      },
      {
        heading: 'Where the parameters come from',
        body:
          `Kernel shape: (out_channels, in_channels, k, k). For 3 input channels, 16 output channels, and 3×3 kernels that is 3·16·9 = 432 weights, plus 16 biases.`,
      },
      {
        heading: 'Output spatial size',
        body:
          `H_out = floor((H + 2·padding − kernel_size) / stride + 1). To keep H_out = H, pass padding="same" (PyTorch ≥ 1.9) or padding=kernel_size//2 with stride=1.`,
      },
      {
        heading: 'Why convolutions instead of Linear',
        body:
          `Weight sharing: the same kernel scans the whole image, so the layer learns translation-invariant features with a tiny number of parameters. A Linear layer on a 224×224 image would need 50K+ inputs PER neuron.`,
      },
    ]
  },

  matmul: ({ line }) => [
    {
      heading: 'torch.matmul (or @) on this line',
      body:
        `Performs a batched matrix multiplication. The trailing two dimensions are the matrix shape; everything before them is treated as a batch and broadcast.`,
    },
    {
      heading: 'Shape rule',
      body:
        `(..., m, n) @ (..., n, k) → (..., m, k). The inner dimension n must match. Broadcasting handles the leading dims, so (B, m, n) @ (n, k) is valid.`,
    },
    {
      heading: 'When to use which form',
      body:
        `For 2-D × 2-D, .mm() is slightly faster but does not broadcast. For higher-dim inputs (almost always in deep learning), use @ or torch.matmul.`,
      code: `y = x @ W       # most readable\ny = torch.matmul(x, W)\ny = x.mm(W)     # 2-D only`,
    },
  ],

  softmax: ({ line }) => {
    const dimMatch = /softmax\([^,]+,\s*dim\s*=\s*(-?\d+)/.exec(line)
    const dim = dimMatch ? dimMatch[1] : null
    return [
      {
        heading: 'softmax on this line',
        body:
          `Converts raw scores (logits) into a probability distribution that sums to 1 along the chosen dimension. Each output is exp(xᵢ) divided by the sum of all exponentials in that slice.`,
      },
      {
        heading: dim ? `dim=${dim}` : 'Pick the right dim',
        body: dim
          ? dim === '-1' || dim === '1'
            ? `dim=${dim} means "softmax over the LAST axis" — typical for classifier outputs of shape (batch, num_classes).`
            : `dim=${dim} normalises along axis ${dim}. Double-check this is the axis where your classes live.`
          : `For a (batch, num_classes) tensor, use dim=-1 (or dim=1). Picking the wrong dim silently gives nonsense probabilities.`,
      },
      {
        heading: 'Almost never use this with CrossEntropyLoss',
        body:
          `nn.CrossEntropyLoss already applies log_softmax internally. Feeding it pre-softmaxed values double-applies the operation and ruins training. Pass the raw logits.`,
      },
    ]
  },

  cross_entropy: () => [
    {
      heading: 'F.cross_entropy on this line',
      body:
        `Combines log_softmax + negative log-likelihood loss in one numerically stable call. It is the loss function for almost every classification task.`,
    },
    {
      heading: 'Required input shapes',
      body:
        `Logits: (batch, num_classes) — raw outputs, NOT softmaxed.\nTargets: (batch,) of integer class IDs in [0, num_classes-1]. NOT one-hot vectors.`,
      code: `logits  = model(x)              # (B, C)\ntargets = y                     # (B,) long\nloss    = F.cross_entropy(logits, targets)`,
    },
    {
      heading: 'Useful arguments',
      body:
        `• weight=tensor(C,) — per-class loss weights for imbalanced data.\n• ignore_index=N — skip targets equal to N (great for padding tokens in NLP).\n• label_smoothing=0.1 — soft targets, helps generalisation in big classifiers.`,
    },
  ],

  CrossEntropyLoss: () => [
    {
      heading: 'nn.CrossEntropyLoss on this line',
      body:
        `Module form of F.cross_entropy. Same math, but stored as a stateful object you call later. Useful when the loss has trainable parameters or fixed configuration.`,
    },
    {
      heading: 'Use exactly like a layer',
      code: `criterion = nn.CrossEntropyLoss()\nloss = criterion(logits, targets)`,
      body:
        `Logits: raw, unnormalised. Targets: integer class IDs. Internally does log_softmax + NLL. Do NOT apply softmax to the input yourself.`,
    },
  ],

  DataLoader: ({ line }) => {
    const argsMatch = /DataLoader\(\s*([^)]*)\)/.exec(line)
    const args = argsMatch ? argsMatch[1] : ''
    return [
      {
        heading: `DataLoader(${args || '...'}) on this line`,
        body:
          `Wraps a Dataset and turns it into an iterator that yields mini-batches. Handles shuffling, batching, optional multi-process loading and pinning to GPU memory.`,
      },
      {
        heading: 'Key arguments',
        body:
          `• batch_size — usually 32–256 for vision, 4–64 for NLP.\n• shuffle=True — for training. shuffle=False — for validation.\n• num_workers — number of subprocesses preparing batches. 4–8 typical. 0 = main process.\n• pin_memory=True — speeds up host→GPU transfer.`,
      },
      {
        heading: 'How it is used',
        code: `for x, y in loader:\n    x, y = x.to(device), y.to(device)\n    loss = criterion(model(x), y)\n    ...`,
        body:
          `Iterating the loader yields one batch per step. Each batch is whatever your Dataset's __getitem__ returns, stacked along the batch dimension.`,
      },
    ]
  },

  // generic helpers people often hover but rarely have a "deep" story
  Sequential: ({ line }) => [
    {
      heading: 'nn.Sequential on this line',
      body:
        `A container that chains modules in order. The output of one becomes the input of the next. Equivalent to writing a small forward() that passes x through each layer.`,
    },
    {
      heading: 'When to use',
      body:
        `Great for purely feed-forward stacks (MLPs, simple CNNs). For anything with branching (residuals, multi-head outputs, conditionals) write a custom nn.Module subclass instead.`,
      code: `mlp = nn.Sequential(\n    nn.Linear(784, 128),\n    nn.ReLU(),\n    nn.Linear(128, 10),\n)`,
    },
  ],

  Module: () => [
    {
      heading: 'nn.Module on this line',
      body:
        `The base class for every layer and model in PyTorch. Subclass it, define __init__ to register submodules / parameters, and override forward() to define the computation.`,
    },
    {
      heading: 'What it gives you for free',
      body:
        `• .parameters() iterator over every learnable tensor.\n• .to(device) moves everything in one call.\n• .train() / .eval() flip mode globally.\n• .state_dict() / .load_state_dict() for checkpointing.\n• Forward / backward hooks.`,
    },
    {
      heading: 'Always call super().__init__() first',
      code: `class MLP(nn.Module):\n    def __init__(self):\n        super().__init__()    # MUST be the first line\n        self.fc1 = nn.Linear(784, 128)\n        self.fc2 = nn.Linear(128, 10)\n\n    def forward(self, x):\n        return self.fc2(F.relu(self.fc1(x)))`,
      body:
        `Without super().__init__(), parameter registration breaks and your "model" will silently have zero learnable weights.`,
    },
  ],
}

// ════════════════════════════════════════════════════════════════════════
// Below: ultra explainers for the rest of the PYTORCH_KEYWORDS dictionary.
// Added in one batch so EVERY hoverable token has a deep context-aware view.
// ════════════════════════════════════════════════════════════════════════

// ── CORE TENSOR ─────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.torch = () => [
  {
    heading: 'What torch is',
    body:
      'The root package of PyTorch. Everything else — tensors, autograd, neural-net layers, optimisers, data loaders — is either defined directly on `torch` or inside a submodule of it (`torch.nn`, `torch.optim`, `torch.utils.data`, `torch.cuda`, `torch.distributions`, …).',
  },
  {
    heading: 'What lives directly on torch',
    body:
      '• Constructors: `torch.tensor`, `torch.zeros`, `torch.ones`, `torch.randn`, `torch.arange`.\n• Math ops: `torch.matmul`, `torch.exp`, `torch.sum`, `torch.softmax`.\n• Autograd controls: `torch.no_grad()`, `torch.inference_mode()`.\n• Device and dtype helpers: `torch.device`, `torch.float32`, `torch.cuda.is_available()`.\n• Persistence: `torch.save`, `torch.load`.',
  },
  {
    heading: 'Import convention',
    body: 'Always `import torch` (never `from torch import *`). Submodules are imported explicitly:',
    code: 'import torch\nimport torch.nn as nn\nimport torch.nn.functional as F\nfrom torch.utils.data import Dataset, DataLoader',
  },
]

ULTRA_EXPLAINERS.Tensor = () => [
  {
    heading: 'What torch.Tensor is',
    body:
      'The primitive of PyTorch. An n-dimensional array of a single dtype that lives on a specific device (cpu / cuda / mps) and may optionally track the operations applied to it for automatic differentiation.',
  },
  {
    heading: 'Four numbers that define a tensor',
    body:
      '• .shape  — dimensions, e.g. (batch, channels, height, width).\n• .dtype  — torch.float32, torch.float16, torch.int64, …\n• .device — cpu, cuda:0, mps, …\n• .requires_grad — whether autograd tracks ops on it.',
  },
  {
    heading: 'NumPy parallels',
    body:
      'If you know NumPy, 90% of the API feels familiar: indexing, slicing, broadcasting, reductions. The big additions are GPU placement, autograd tracking, and the `nn.Module` ecosystem built on top.',
  },
]

ULTRA_EXPLAINERS.tensor = ({ line }) => {
  const m = /torch\.tensor\(\s*([^,)]*)/.exec(line)
  const arg = m ? m[1].trim() : 'your data'
  return [
    {
      heading: `What torch.tensor(${arg}) does`,
      body:
        `Creates a NEW tensor by copying ${arg}. The input can be a Python list, a nested list, a NumPy array, a scalar, or another tensor.`,
    },
    {
      heading: 'Inferred vs explicit dtype',
      body:
        'If you pass Python ints, PyTorch infers int64. Python floats → float32. Mixed lists → float32. Pass `dtype=torch.float32` to force it (important when feeding into a float model).',
      code: 'x = torch.tensor([1, 2, 3], dtype=torch.float32)',
    },
    {
      heading: 'Careful: torch.tensor vs torch.Tensor',
      body:
        '`torch.tensor(x)` copies data and infers dtype — use this 99% of the time.\n`torch.Tensor(shape)` is the class constructor and creates an UNINITIALISED float32 tensor of the given shape — full of garbage values. Easy footgun.',
    },
  ]
}

ULTRA_EXPLAINERS.zeros = ({ line }) => [
  {
    heading: 'What torch.zeros does',
    body:
      'Returns a new tensor filled with 0, of the shape you pass. Default dtype is float32, default device is cpu.',
  },
  {
    heading: 'Common uses',
    body:
      '• Pre-allocating buffers you will fill in a loop.\n• Initialising biases (though nn.Linear already does this).\n• Creating padding masks.\n• Creating an "empty" accumulator for metric tensors.',
  },
  {
    heading: 'Device / dtype matter',
    body:
      'If the rest of your tensors live on GPU, create on GPU directly — do not allocate on CPU and .to() after:',
    code: (() => {
      const m = /torch\.zeros\(\s*([^)]*)\)/.exec(line)
      const args = m ? m[1] : 'B, C'
      return `buf = torch.zeros(${args}, device=x.device, dtype=x.dtype)`
    })(),
  },
]

ULTRA_EXPLAINERS.ones = () => [
  {
    heading: 'What torch.ones does',
    body: 'Returns a new tensor of the given shape filled with 1.0. Default dtype float32, default device cpu.',
  },
  {
    heading: 'Common uses',
    body:
      '• Attention masks that start fully attending.\n• Scaling factors before learning kicks in.\n• Unit-weight reductions — e.g. `(x * ones).sum()` as a sanity debugger.',
  },
  {
    heading: 'See also',
    body: '`torch.ones_like(x)` — copies shape/dtype/device from x and fills with 1. Usually what you actually want.',
  },
]

ULTRA_EXPLAINERS.randn = ({ line }) => {
  const m = /randn\(\s*([^)]*)\)/.exec(line)
  const shape = m ? m[1].trim() : 'shape'
  return [
    {
      heading: `What torch.randn(${shape}) does`,
      body:
        `Samples each element independently from the STANDARD NORMAL distribution N(0, 1) — mean 0, std 1. Returns a new tensor of shape ${shape}.`,
    },
    {
      heading: 'Why this exact distribution matters',
      body:
        'Many weight-initialisation schemes (Xavier, Kaiming) are variants of N(0, σ²) chosen so the signal variance does not explode or vanish through many layers. randn() gives you the raw building block; for real init, use torch.nn.init.kaiming_normal_ on an existing parameter.',
    },
    {
      heading: 'Reproducibility',
      body:
        'randn() is random every call — set torch.manual_seed(N) first if you need deterministic output. For multi-GPU add torch.cuda.manual_seed_all(N).',
    },
  ]
}

ULTRA_EXPLAINERS.rand = () => [
  {
    heading: 'What torch.rand does',
    body:
      'Samples each element independently from the UNIFORM distribution on [0, 1). Returns a new tensor of the given shape.',
  },
  {
    heading: 'vs torch.randn',
    body:
      '• rand  → uniform in [0, 1). Use for masks, random dropout patterns, probabilities.\n• randn → normal N(0, 1). Use for weight inits, Gaussian noise.',
  },
  {
    heading: 'Reproducibility',
    body: 'Seed with torch.manual_seed(N). Same seed → same sequence.',
  },
]

ULTRA_EXPLAINERS.randint = ({ line }) => {
  const m = /randint\(\s*([^)]*)\)/.exec(line)
  const args = m ? m[1] : 'low, high, size=(...)'
  return [
    {
      heading: `What torch.randint(${args}) does`,
      body:
        'Returns a tensor of uniformly sampled integers in [low, high). Half-open interval — `high` itself is never generated. Dtype defaults to int64.',
    },
    {
      heading: 'Watch the signature',
      body:
        'Unlike numpy.random.randint which accepts just high, torch.randint requires low explicitly for its 3-arg form. The shape must be a tuple passed as size=(...):',
      code: 'y = torch.randint(0, 10, size=(32,))   # 32 fake class labels 0..9',
    },
    {
      heading: 'Common uses',
      body:
        '• Fake targets while building / debugging a model.\n• Random indices for subsampling.\n• Token IDs for testing embedding layers.',
    },
  ]
}

ULTRA_EXPLAINERS.arange = () => [
  {
    heading: 'What torch.arange does',
    body:
      'Like Python range(), but returns a 1-D tensor. Signatures: `arange(end)`, `arange(start, end)`, `arange(start, end, step)`. End is EXCLUSIVE.',
  },
  {
    heading: 'Common uses',
    body:
      '• Position indices for positional encodings: `pos = torch.arange(seq_len)`.\n• Building test tensors with known values.\n• Indexing tricks: `x[torch.arange(batch), labels]` selects the "target" logit per example.',
  },
  {
    heading: 'Dtype defaults to int64',
    body: 'Pass `dtype=torch.float32` if you are about to feed it to math that expects floats.',
  },
]

ULTRA_EXPLAINERS.linspace = () => [
  {
    heading: 'What torch.linspace does',
    body:
      'Returns N evenly-spaced values from `start` to `end`, INCLUSIVE on both ends. Useful when you want exact endpoints (arange does not hit `end`).',
  },
  {
    heading: 'Example',
    code: 'ts = torch.linspace(0, 1, steps=1000)   # 1000 points, 0.0 and 1.0 both present',
    body: 'Great for plotting a function over a range, or for noise-schedule timesteps in diffusion models.',
  },
]

ULTRA_EXPLAINERS.numpy = ({ line }) => {
  const recv = receiverFor('numpy', line) ?? 'tensor'
  return [
    {
      heading: `What ${recv}.numpy() does`,
      body:
        `Returns a NumPy array that SHARES the underlying memory with ${recv}. No copy happens — mutating one mutates the other.`,
    },
    {
      heading: 'Restrictions',
      body:
        '• ${recv} must be on CPU (call .cpu() first if it is on cuda).\n• ${recv} must not require grad — call .detach() first.\n• Bfloat16 is not supported by NumPy; cast to float32 first.',
      code: `arr = ${recv}.detach().cpu().numpy()`,
    },
    {
      heading: 'Going back',
      body: 'Use `torch.from_numpy(arr)` to get a tensor that shares memory with the NumPy array.',
    },
  ]
}

// ── OPS ─────────────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.cat = ({ line }) => {
  const m = /cat\(\s*\[?([^\],]+)[^,)]*,?\s*(?:dim\s*=\s*(-?\d+))?/.exec(line)
  const dim = m?.[2]
  return [
    {
      heading: 'What torch.cat does',
      body:
        'Concatenates a list of tensors along an EXISTING dimension. All tensors must have identical shapes except along the dim you concatenate.',
    },
    {
      heading: dim ? `dim=${dim} on this line` : 'Pick the right dim',
      body: dim
        ? `dim=${dim} means stacking happens along axis ${dim}. The OTHER axes must match across every input tensor.`
        : 'For (B, F) tensors: dim=0 grows batch, dim=1 grows features. For (B, C, H, W) images: dim=1 concats channels (classic U-Net skip connection).',
    },
    {
      heading: 'vs stack',
      body: 'cat uses an EXISTING dim (no rank change). stack creates a NEW dim (rank +1). Pick whichever matches your intent.',
    },
  ]
}

ULTRA_EXPLAINERS.stack = () => [
  {
    heading: 'What torch.stack does',
    body:
      'Takes a list of tensors with IDENTICAL shapes and stacks them along a NEW dimension. Output rank = input rank + 1.',
  },
  {
    heading: 'Example',
    code: 'a = torch.randn(3)\nb = torch.randn(3)\ntorch.stack([a, b], dim=0).shape  # → (2, 3)\ntorch.stack([a, b], dim=1).shape  # → (3, 2)',
    body: 'Classic use: converting a Python list of per-sample tensors into one batched tensor (what collate_fn does inside DataLoader).',
  },
  {
    heading: 'cat vs stack cheat sheet',
    body: '• Same rank in & out → cat.\n• Rank +1 in output → stack.',
  },
]

ULTRA_EXPLAINERS.mm = () => [
  {
    heading: 'What torch.mm does',
    body:
      'Strict 2-D matrix multiply. Both operands must be exactly 2-dimensional — shapes (m, n) and (n, k) → (m, k). Broadcasting is NOT supported.',
  },
  {
    heading: 'When to use mm vs matmul vs @',
    body:
      '• mm: only if you are certain both inputs are 2-D and want a tiny bit of speed.\n• matmul / @: for everything else (batched matmul, broadcasting, higher-rank tensors). In deep learning this is what you almost always want.',
  },
]

ULTRA_EXPLAINERS.sigmoid = () => [
  {
    heading: 'What sigmoid does',
    body: 'σ(x) = 1 / (1 + e^-x). Maps any real number into the open interval (0, 1). Interpretable as a probability.',
  },
  {
    heading: 'Where it fits today',
    body:
      '• Final layer of a BINARY classifier → pair with BCEWithLogitsLoss (which applies sigmoid internally — more stable than sigmoid + BCELoss).\n• Gating signals inside LSTMs and gated MLP variants.\n• Rarely as a hidden activation: it saturates on both sides, causing vanishing gradients in deep nets. ReLU / GELU are preferred there.',
  },
  {
    heading: 'Gotcha: vanishing gradients',
    body:
      'For |x| > ~5, σ(x) is nearly flat, so dσ/dx ≈ 0. Gradients through many stacked sigmoids vanish toward the input. This is exactly why ReLU won the 2010s.',
  },
]

ULTRA_EXPLAINERS.tanh = () => [
  {
    heading: 'What tanh does',
    body: 'tanh(x) = (eˣ − e⁻ˣ) / (eˣ + e⁻ˣ). Maps real numbers into (−1, 1). Zero-centred, unlike sigmoid.',
  },
  {
    heading: 'Where it shines',
    body: 'Preferred over sigmoid as a HIDDEN activation when you must use one — being zero-centred means gradient updates do not all push in the same sign direction. Common in RNN / LSTM cell state activations.',
  },
]

ULTRA_EXPLAINERS.relu = () => [
  {
    heading: 'What ReLU does',
    body: 'relu(x) = max(0, x). Keeps positives, zeroes negatives. That is it.',
  },
  {
    heading: 'Why it dominated the 2010s',
    body:
      '• Gradient for positive inputs is exactly 1 — no vanishing.\n• Computationally dirt cheap.\n• Induces sparsity (most activations ~0 after training), which is useful for generalisation.',
  },
  {
    heading: 'The "dying ReLU" problem',
    body:
      'If a neuron enters a region where it is always negative, its gradient is 0 forever — the neuron is dead. Large learning rates or poor init can kill many neurons. Remedies: LeakyReLU, GELU, better init (Kaiming), lower LR.',
  },
]

ULTRA_EXPLAINERS.view = ({ line }) => {
  const recv = receiverFor('view', line) ?? 'tensor'
  return [
    {
      heading: `What ${recv}.view() does`,
      body:
        `Returns a new tensor with the SAME data and a different shape, without copying. Requires ${recv} to be CONTIGUOUS in memory; otherwise it errors.`,
    },
    {
      heading: '-1 means "infer this dim"',
      body:
        'You can replace one dimension with -1 and PyTorch solves for it using the total element count:',
      code: `x = ${recv}.view(batch, -1)   # flatten everything after batch`,
    },
    {
      heading: 'If .view() errors, use .reshape()',
      body:
        'Operations like .transpose() and .permute() return non-contiguous tensors. Either call .contiguous() first, or use .reshape() which copies if needed.',
    },
  ]
}

ULTRA_EXPLAINERS.reshape = ({ line }) => {
  const recv = receiverFor('reshape', line) ?? 'tensor'
  return [
    {
      heading: `What ${recv}.reshape() does`,
      body:
        `Returns a tensor with the given shape, sharing data when possible and copying when the source is non-contiguous. More forgiving than .view().`,
    },
    {
      heading: 'When to use reshape over view',
      body:
        'After a .transpose() / .permute() the tensor is non-contiguous; .view() will raise an error there. .reshape() just works. The cost: a potential memory copy.',
    },
  ]
}

ULTRA_EXPLAINERS.unsqueeze = ({ line }) => {
  const recv = receiverFor('unsqueeze', line) ?? 'tensor'
  const m = /unsqueeze\(\s*(-?\d+)\s*\)/.exec(line)
  const dim = m ? m[1] : '?'
  return [
    {
      heading: `What ${recv}.unsqueeze(${dim}) does`,
      body:
        `Inserts a dimension of size 1 at position ${dim}. Rank goes from R to R+1. No data moves — it is a metadata change.`,
    },
    {
      heading: 'Canonical use: add a batch dimension',
      code: `x = ${recv}.unsqueeze(0)   # (C,H,W) → (1,C,H,W), ready for a model`,
      body: 'Image models expect a batch axis even for single inputs. Unsqueeze at 0 is the fastest fix.',
    },
  ]
}

ULTRA_EXPLAINERS.squeeze = ({ line }) => {
  const recv = receiverFor('squeeze', line) ?? 'tensor'
  return [
    {
      heading: `What ${recv}.squeeze() does`,
      body:
        `Removes ALL dimensions of size 1. Pass a dim argument to remove ONLY that dim (and only if it is size 1) — safer in library code where unknown dims shouldn't vanish.`,
    },
    {
      heading: 'Typical fix',
      code: 'pred = model(x).squeeze(-1)   # (B,1) → (B,)',
      body: 'Regression heads often output a trailing size-1 dim. Squeeze it before comparing to targets of shape (B,).',
    },
  ]
}

ULTRA_EXPLAINERS.permute = ({ line }) => {
  const recv = receiverFor('permute', line) ?? 'tensor'
  return [
    {
      heading: `What ${recv}.permute() does`,
      body:
        `Reorders dimensions according to the indices you pass. Purely a metadata change — no data copy — so the result is typically non-contiguous.`,
    },
    {
      heading: 'Classic image case',
      code: 'x = x.permute(0, 3, 1, 2)   # (N,H,W,C) → (N,C,H,W) for PyTorch conv layers',
      body: 'PyTorch convolutions expect channels-first. Images loaded by PIL / NumPy arrive channels-last; permute fixes this once.',
    },
    {
      heading: 'Non-contiguous output',
      body: 'Follow with .contiguous() if the next op requires contiguous memory (e.g. .view).',
    },
  ]
}

ULTRA_EXPLAINERS.transpose = ({ line }) => {
  const recv = receiverFor('transpose', line) ?? 'tensor'
  return [
    {
      heading: `What ${recv}.transpose(a, b) does`,
      body: `Swaps exactly two dimensions. For higher-rank rearrangements, .permute() is cleaner.`,
    },
    {
      heading: 'Common use',
      body: 'Matrix transpose in 2-D: `W.T` is shorthand for `W.transpose(0, 1)`.',
    },
  ]
}

ULTRA_EXPLAINERS.flatten = ({ line }) => {
  const recv = receiverFor('flatten', line) ?? 'tensor'
  return [
    {
      heading: `What ${recv}.flatten() does`,
      body:
        `Collapses dims from start_dim onward into one big dim. With no arguments, flattens everything.`,
    },
    {
      heading: 'Typical bridge between Conv and Linear',
      code: 'x = conv_stack(x)              # (B, C, H, W)\nx = x.flatten(1)               # (B, C*H*W)\nlogits = classifier(x)         # Linear expects 2-D',
      body: 'This is the standard way to end a CNN and start an MLP head in the same model.',
    },
  ]
}

ULTRA_EXPLAINERS.log_softmax = () => [
  {
    heading: 'What log_softmax does',
    body: 'Computes log(softmax(x)) in one numerically stable pass. Equivalent in math to chaining the two, but without the overflow / underflow risk of computing huge exponentials first.',
  },
  {
    heading: 'When you actually need it',
    body:
      '• Paired with nn.NLLLoss — the classic split of "model outputs log-probs, loss consumes log-probs".\n• Building custom losses where you need log-probabilities.\nFor ordinary classification, just use nn.CrossEntropyLoss on raw logits and skip this manually.',
  },
]

// ── AUTOGRAD ────────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.requires_grad = ({ line }) => {
  const lhs = lhsVar(line) ?? 'this tensor'
  return [
    {
      heading: `requires_grad on ${lhs}`,
      body:
        `Tells autograd to record every operation whose output depends on ${lhs}, so gradients can be computed later via .backward(). When it's False, ops on ${lhs} are cheap and forget-me-not — like NumPy.`,
    },
    {
      heading: 'Default behaviour',
      body:
        '• User tensors (torch.tensor, torch.zeros, …) default to requires_grad=False.\n• nn.Parameter (weights inside nn.Module) defaults to True — that is why model parameters get gradients automatically.',
    },
    {
      heading: 'Practical patterns',
      body:
        '• Freezing a backbone: `for p in backbone.parameters(): p.requires_grad_(False)`.\n• Learnable input (adversarial examples, DeepDream): `x = torch.randn(..., requires_grad=True)`.',
    },
  ]
}

ULTRA_EXPLAINERS.requires_grad_ = ({ line }) => {
  const recv = receiverFor('requires_grad_', line) ?? 'tensor'
  return [
    {
      heading: `What ${recv}.requires_grad_() does`,
      body:
        `In-place flip of the requires_grad flag on ${recv}. Underscore suffix = PyTorch convention for "mutates in place and returns self", so you can chain it.`,
    },
    {
      heading: 'Freezing a subnet',
      code: 'for p in encoder.parameters():\n    p.requires_grad_(False)',
      body: 'Classic fine-tuning pattern: freeze the pretrained encoder, only train the new head. The optimizer then skips frozen params because their .grad stays None.',
    },
  ]
}

ULTRA_EXPLAINERS.grad = ({ line }) => {
  const recv = receiverFor('grad', line) ?? 'parameter'
  return [
    {
      heading: `What ${recv}.grad is`,
      body:
        `The tensor that holds the ACCUMULATED gradient dLoss/d${recv} after .backward(). Same shape and device as ${recv}. Starts as None until the first backward.`,
    },
    {
      heading: 'Accumulation, not replacement',
      body:
        'Every .backward() ADDS to .grad. That is why you must call optimizer.zero_grad() before each step. Missing this is the most common silent training bug.',
    },
    {
      heading: 'Manual inspection',
      body: 'You can look at per-parameter gradient norms for debugging:',
      code: `for n, p in model.named_parameters():\n    if p.grad is not None:\n        print(n, p.grad.norm().item())`,
    },
  ]
}

// ── NN ──────────────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.nn = () => [
  {
    heading: 'What torch.nn is',
    body:
      'The submodule containing every STATEFUL building block: layers (Linear, Conv2d, …), losses (CrossEntropyLoss, …), containers (Sequential, ModuleList, …), init helpers, and the Module base class itself.',
  },
  {
    heading: 'Import convention',
    code: 'import torch.nn as nn\nclass Net(nn.Module): ...',
    body: 'Almost every PyTorch codebase uses `nn` as the alias. Stick to it — it makes your code readable to anyone.',
  },
  {
    heading: 'nn vs nn.functional',
    body:
      '`nn.ReLU` is a Module (an object you put inside Sequential). `F.relu` is a pure function. Same math, different style. Use Module form when you need state or want to register submodules; functional form for one-off ops.',
  },
]

ULTRA_EXPLAINERS.Conv1d = ({ line }) => [
  {
    heading: 'nn.Conv1d on this line',
    body:
      'A 1-D convolution — slides a learnable kernel along a single spatial dimension. Input shape (batch, in_channels, length); output (batch, out_channels, length\'). Perfect for audio, time-series, raw text, and any sequence of feature vectors.',
  },
  {
    heading: 'vs Linear on a sequence',
    body:
      'Conv1d SHARES weights across time positions (translation invariance) while Linear would learn a separate weight per position. Conv1d has far fewer parameters and generalises across lengths.',
  },
  {
    heading: (() => {
      const m = /Conv1d\(\s*([^)]*)\)/.exec(line)
      return m ? `Args: (${m[1]})` : 'Key args'
    })(),
    body:
      '• in_channels / out_channels — feature dim in and out.\n• kernel_size — receptive field per step.\n• stride — how far the kernel moves.\n• padding — preserves length when set to kernel_size // 2 with stride 1.\n• dilation — spacing between kernel taps (WaveNet trick).',
  },
]

ULTRA_EXPLAINERS.ConvTranspose2d = () => [
  {
    heading: 'nn.ConvTranspose2d on this line',
    body:
      'Performs the "transposed" (sometimes misleadingly called "deconvolution") operation. It is the learnable upsampling counterpart to Conv2d — it INCREASES spatial resolution rather than decreasing it.',
  },
  {
    heading: 'Where you see it',
    body:
      '• Decoders of autoencoders / U-Net.\n• GAN generators that map a latent vector up to an image.\n• Segmentation heads upsampling feature maps back to image size.',
  },
  {
    heading: 'Beware: checkerboard artifacts',
    body:
      'Certain kernel_size / stride combos produce a visible checkerboard in outputs. A safer modern alternative is Upsample(nearest or bilinear) followed by a Conv2d — same effect, no artifacts.',
  },
]

ULTRA_EXPLAINERS.BatchNorm1d = () => [
  {
    heading: 'nn.BatchNorm1d on this line',
    body:
      'Normalises each feature independently across the MINI-BATCH: subtract batch mean, divide by batch std, then apply learned scale γ and shift β per feature. Expects input shape (batch, features) or (batch, features, length).',
  },
  {
    heading: 'Why it speeds up training',
    body:
      'Keeps activations in a well-conditioned range regardless of how the upstream weights drift, allowing higher learning rates and more layers. The running statistics also add a mild regulariser.',
  },
  {
    heading: 'Training vs eval behaviour',
    body:
      'In train mode: uses CURRENT batch mean/var, AND updates running averages.\nIn eval mode: uses the FROZEN running averages. That is exactly why model.eval() matters before inference.',
  },
]

ULTRA_EXPLAINERS.BatchNorm2d = () => [
  {
    heading: 'nn.BatchNorm2d on this line',
    body:
      'Same idea as BatchNorm1d but for (N, C, H, W) feature maps. Normalises each CHANNEL across all (N, H, W) positions — so each channel gets its own γ and β.',
  },
  {
    heading: 'Interaction with Conv2d',
    body:
      'Standard pattern: `Conv2d(... bias=False) → BatchNorm2d → ReLU`. The conv bias is redundant when BN follows (BN has its own β). bias=False saves a handful of parameters and is considered best practice.',
  },
  {
    heading: 'Small-batch caveat',
    body:
      'With very small batch sizes (1-4), batch statistics are noisy and BN can hurt. In that regime people switch to GroupNorm or LayerNorm.',
  },
]

ULTRA_EXPLAINERS.LayerNorm = () => [
  {
    heading: 'nn.LayerNorm on this line',
    body:
      'Normalises across the FEATURE dimension(s) of each SINGLE example — not across the batch. Each example is renormalised independently, so it is batch-size invariant.',
  },
  {
    heading: 'Why Transformers use it',
    body:
      'Transformer training is highly sensitive and often runs with unusual batch shapes (variable sequence length, accumulated gradients). LayerNorm is batch-independent and numerically stable, making it the default in every modern LLM.',
  },
  {
    heading: 'PreNorm vs PostNorm',
    body:
      'Original Transformer: attention → add → LayerNorm. Modern GPT-style: LayerNorm → attention → add. PreNorm trains more stably at depth; almost all current LLMs use it.',
  },
]

ULTRA_EXPLAINERS.Dropout = ({ line }) => {
  const m = /Dropout\(\s*([^)]*)\)/.exec(line)
  const p = m ? m[1].trim() : 'p'
  return [
    {
      heading: `nn.Dropout(${p}) on this line`,
      body:
        `During TRAINING, each element of the input is independently set to zero with probability ${p === 'p' ? 'p' : p}. Surviving elements are scaled up by 1/(1−p) so expected activations stay the same. During EVAL the layer is a no-op.`,
    },
    {
      heading: 'Why it regularises',
      body:
        'It forces the network not to rely on any single neuron — information has to be spread across co-operating features. Conceptually it trains an exponential ensemble of sub-networks that share weights.',
    },
    {
      heading: 'Place it deliberately',
      body:
        'Usual spot: AFTER an activation function, before the next Linear. In Transformers: after attention-softmax and after the FFN output, typical p=0.1.',
    },
  ]
}

ULTRA_EXPLAINERS.Embedding = ({ line }) => {
  const m = /Embedding\(\s*([^)]*)\)/.exec(line)
  const args = m ? m[1].trim() : 'vocab_size, embed_dim'
  return [
    {
      heading: `nn.Embedding(${args}) on this line`,
      body:
        'A learnable lookup table with vocab_size rows and embed_dim columns. Given an integer token ID, it returns the corresponding row as a dense vector. No matmul — just indexing.',
    },
    {
      heading: 'The input layer of every language model',
      body:
        'Tokens → integer IDs → embedding → rest of the network. The embedding matrix itself is trained jointly with the model and ends up capturing semantic similarity (famous king − man + woman ≈ queen).',
    },
    {
      heading: 'Shapes',
      body:
        'Input: LongTensor of any shape, entries in [0, vocab_size). Output: same shape with an extra trailing dim of size embed_dim.',
      code: 'ids = torch.tensor([[2, 5, 9], [1, 0, 7]])   # (B=2, T=3)\nemb = nn.Embedding(10, 16)\nemb(ids).shape                                # (2, 3, 16)',
    },
  ]
}

ULTRA_EXPLAINERS.ReLU = () => [
  {
    heading: 'nn.ReLU on this line',
    body:
      'Module form of relu: max(0, x). Identical math to F.relu but usable inside Sequential and inspectable as a child module.',
  },
  {
    heading: 'inplace=True option',
    body:
      'Overwrites the input to save memory. Safe inside Sequential where the input is not reused, risky otherwise. Saves a small constant of memory per activation.',
  },
]

ULTRA_EXPLAINERS.LeakyReLU = () => [
  {
    heading: 'nn.LeakyReLU on this line',
    body:
      'Like ReLU for positive inputs, but for negatives multiplies by a small slope (default 0.01) instead of zeroing. Prevents the "dying ReLU" failure mode where a neuron gets stuck producing all-zero outputs forever.',
  },
  {
    heading: 'When to reach for it',
    body:
      '• GAN discriminators (popular choice).\n• Any network where you observe many dead neurons after training.\n• Very deep nets before GELU became standard.',
  },
]

ULTRA_EXPLAINERS.GELU = () => [
  {
    heading: 'nn.GELU on this line',
    body:
      'Gaussian Error Linear Unit: x · Φ(x), where Φ is the standard normal CDF. Smooth, non-monotonic, approximately "ReLU with a soft start". The default activation in BERT, GPT, Llama, etc.',
  },
  {
    heading: 'Why Transformers prefer it over ReLU',
    body:
      'Empirically GELU gives slightly better loss at the same parameter count and is smoother (good for optimisation). The approximate form uses a tanh and is what most LLM implementations actually use.',
  },
]

ULTRA_EXPLAINERS.Tanh = () => [
  {
    heading: 'nn.Tanh on this line',
    body:
      'Module form of tanh — output range (−1, 1), zero-centred. Used as the state activation inside LSTM cells and sometimes as a final activation when you want bounded outputs.',
  },
]

ULTRA_EXPLAINERS.Sigmoid = () => [
  {
    heading: 'nn.Sigmoid on this line',
    body:
      'Module form of σ(x) = 1 / (1 + e^-x). Output ∈ (0, 1). Almost exclusively used as the final layer of a BINARY classifier.',
  },
  {
    heading: 'Usually you should skip it',
    body:
      'If you then feed into BCELoss, numerical stability suffers for extreme logits. Use BCEWithLogitsLoss on raw logits instead — it fuses sigmoid + BCE in a stable way.',
  },
]

ULTRA_EXPLAINERS.Softmax = ({ line }) => {
  const m = /Softmax\(\s*(?:dim\s*=\s*)?(-?\d+)?/.exec(line)
  const dim = m?.[1]
  return [
    {
      heading: 'nn.Softmax on this line',
      body:
        `Module form of softmax. ${dim ? `dim=${dim} — normalises along axis ${dim}.` : 'You must pass dim — without it PyTorch raises a warning because picking the wrong axis silently produces garbage.'}`,
    },
    {
      heading: 'Do NOT feed CrossEntropyLoss this',
      body:
        'nn.CrossEntropyLoss internally applies log_softmax. Applying Softmax beforehand double-applies the op and breaks training. Keep Softmax for final user-facing probabilities, not for loss computation.',
    },
  ]
}

ULTRA_EXPLAINERS.Flatten = () => [
  {
    heading: 'nn.Flatten on this line',
    body:
      'Collapses all dims from start_dim (default 1) to end_dim (default -1) into a single flat feature dim. Standard bridge between a convolutional stack and a linear classifier inside Sequential.',
  },
  {
    heading: 'Typical placement',
    code: 'model = nn.Sequential(\n    nn.Conv2d(3, 16, 3), nn.ReLU(),\n    nn.AdaptiveAvgPool2d(1),   # → (B, 16, 1, 1)\n    nn.Flatten(),              # → (B, 16)\n    nn.Linear(16, 10),\n)',
    body: 'AdaptiveAvgPool2d(1) + Flatten is the standard vision classifier head.',
  },
]

ULTRA_EXPLAINERS.MaxPool2d = ({ line }) => {
  const m = /MaxPool2d\(\s*([^)]*)\)/.exec(line)
  const args = m ? m[1].trim() : 'kernel_size'
  return [
    {
      heading: `nn.MaxPool2d(${args}) on this line`,
      body:
        'Slides a window over each channel of the input and outputs the MAX value in each window. Downsamples spatially while keeping the strongest responses — pooling is not learned, it is a fixed op.',
    },
    {
      heading: 'Why max, not average',
      body:
        'Max pooling preserves the most salient feature — a strong edge or texture — which tends to be what the next layer cares about. Average pooling smooths instead.',
    },
    {
      heading: 'Modern nets often skip it',
      body:
        'Many newer architectures replace MaxPool with STRIDED convolutions (learn the downsampling) or with AdaptiveAvgPool2d at the very end. MaxPool is still a fine, cheap baseline.',
    },
  ]
}

ULTRA_EXPLAINERS.AvgPool2d = () => [
  {
    heading: 'nn.AvgPool2d on this line',
    body: 'Averages each spatial window per channel. Gentler than MaxPool — preserves magnitude information instead of picking extremes.',
  },
]

ULTRA_EXPLAINERS.AdaptiveAvgPool2d = ({ line }) => {
  const m = /AdaptiveAvgPool2d\(\s*([^)]*)\)/.exec(line)
  const target = m ? m[1].trim() : 'output_size'
  return [
    {
      heading: `nn.AdaptiveAvgPool2d(${target}) on this line`,
      body:
        `Pools any input spatial size down to exactly ${target}. PyTorch computes the stride and kernel for you. This is the secret that lets a single ResNet accept 224×224, 256×256, or 512×512 images without rewiring the head.`,
    },
    {
      heading: 'Standard classifier ending',
      code: 'features = conv_stack(x)                  # (B, C, H, W) with variable H, W\nvec = nn.AdaptiveAvgPool2d(1)(features)   # (B, C, 1, 1)\nvec = vec.flatten(1)                       # (B, C)\nlogits = linear_head(vec)',
      body: 'Every torchvision backbone (ResNet, EfficientNet, ConvNeXt) ends this way.',
    },
  ]
}

ULTRA_EXPLAINERS.MSELoss = () => [
  {
    heading: 'nn.MSELoss on this line',
    body: 'Mean of (prediction − target)². The default regression loss. Penalises big errors quadratically and is smooth everywhere (nice for optimisation).',
  },
  {
    heading: 'When NOT to use it',
    body:
      '• Outliers dominate the gradient because of the squaring → consider L1Loss or SmoothL1Loss (Huber) for heavy-tailed targets.\n• Predicting PROBABILITIES → use BCE/CE instead, they match the task.',
  },
]

ULTRA_EXPLAINERS.BCELoss = () => [
  {
    heading: 'nn.BCELoss on this line',
    body:
      'Binary cross-entropy. Expects predictions already squashed to [0, 1] (i.e. you have applied sigmoid). Targets also in [0, 1].',
  },
  {
    heading: 'Prefer BCEWithLogitsLoss',
    body:
      'Applying sigmoid then BCE separately is less numerically stable than BCEWithLogitsLoss which fuses them in log-space. Use BCELoss only if, for some reason, you have probabilities without the underlying logits.',
  },
]

ULTRA_EXPLAINERS.BCEWithLogitsLoss = () => [
  {
    heading: 'nn.BCEWithLogitsLoss on this line',
    body:
      'Binary cross-entropy fused with sigmoid — takes RAW logits. Numerically stable even for very confident predictions thanks to a log-sum-exp trick internally. The default binary-classification loss.',
  },
  {
    heading: 'Useful arguments',
    body:
      '• pos_weight=tensor(1,) — scales the positive-class loss. Use for imbalanced data (e.g. pos_weight=neg_count/pos_count).\n• reduction="none" — returns per-example loss if you want to weight samples yourself.',
  },
]

ULTRA_EXPLAINERS.Parameter = () => [
  {
    heading: 'nn.Parameter on this line',
    body:
      'A Tensor subclass with one magic trick: when assigned as an attribute of an nn.Module, it automatically registers as a learnable parameter of that Module. It shows up in .parameters(), in .state_dict(), and moves with .to(device).',
  },
  {
    heading: 'Custom learnable weights',
    body: 'Use it when you need a parameter that is not part of a pre-built layer — e.g. a learnable temperature, a positional bias, or the centroids of a prototypical network:',
    code: 'self.temperature = nn.Parameter(torch.ones(1))',
  },
  {
    heading: 'Plain torch.tensor vs nn.Parameter',
    body:
      'A plain tensor assigned as self.foo does NOT get picked up by .parameters() and the optimizer will never update it. Always wrap in nn.Parameter for learnable state; use self.register_buffer for non-learnable tensors you still want saved/moved.',
  },
]

ULTRA_EXPLAINERS.state_dict = ({ line }) => {
  const recv = receiverFor('state_dict', line) ?? 'model'
  return [
    {
      heading: `What ${recv}.state_dict() returns`,
      body:
        `An ordered dict mapping each parameter / buffer NAME ("encoder.fc1.weight", …) to the corresponding tensor. It is the canonical on-disk representation of a trained model.`,
    },
    {
      heading: 'Saving / loading',
      code: `torch.save(${recv}.state_dict(), 'model.pt')\n\n# Later:\n${recv} = MyModel(...)\n${recv}.load_state_dict(torch.load('model.pt', map_location='cpu'))`,
      body:
        'Always save the state_dict, not the whole module object. State_dicts are portable across PyTorch versions; pickled modules are not.',
    },
    {
      heading: 'Includes buffers too',
      body:
        'Running mean / variance in BatchNorm, KV caches, etc. are "buffers" and are stored in state_dict alongside learnable parameters. This is why eval accuracy is reproducible after reload.',
    },
  ]
}

ULTRA_EXPLAINERS.load_state_dict = ({ line }) => {
  const recv = receiverFor('load_state_dict', line) ?? 'model'
  return [
    {
      heading: `What ${recv}.load_state_dict() does`,
      body:
        `Copies tensors from the provided dict into ${recv}'s parameters and buffers by matching names. Shapes must match; dtypes should match (it will cast if not, with a warning).`,
    },
    {
      heading: 'strict=False is your friend when fine-tuning',
      body:
        'If you have renamed / added / removed some layers, pass strict=False to skip mismatched keys instead of raising:',
      code: `missing, unexpected = ${recv}.load_state_dict(ckpt, strict=False)\nprint('missing:', missing)       # layers in the model not found in ckpt\nprint('unexpected:', unexpected) # keys in ckpt not used by the model`,
    },
    {
      heading: 'Load on the right device',
      body: 'Pass map_location to torch.load if the checkpoint was saved on cuda and you are loading on cpu (or vice versa):',
      code: "ckpt = torch.load('model.pt', map_location='cpu')",
    },
  ]
}

// ── FUNCTIONAL ──────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.F = () => [
  {
    heading: 'torch.nn.functional (F)',
    body:
      'The stateless / functional counterpart to torch.nn. Contains the math of layers (F.relu, F.conv2d, F.linear, F.cross_entropy, …) as plain functions — no Module wrapping, no internal parameters.',
  },
  {
    heading: 'When to use F vs nn',
    body:
      '• Inside Sequential, you need the Module form (nn.ReLU).\n• Inside a custom forward() where you already have the weights as tensors, the functional form is cleaner: `F.linear(x, self.W, self.b)`.\n• For losses, functional is often shorter: `loss = F.cross_entropy(logits, y)`.',
  },
  {
    heading: 'Import convention',
    code: 'import torch.nn.functional as F',
    body: 'Universal convention — everyone reads your code faster if you use F.',
  },
]

ULTRA_EXPLAINERS.mse_loss = () => [
  {
    heading: 'F.mse_loss on this line',
    body: 'Functional mean-squared error. Equivalent to nn.MSELoss()(p, t). Returns a scalar by default.',
  },
  {
    heading: 'reduction argument',
    body:
      '• reduction="mean" (default) — divide by number of elements.\n• reduction="sum" — no division.\n• reduction="none" — return per-element loss tensor (useful when you want to mask before averaging).',
  },
]

ULTRA_EXPLAINERS.binary_cross_entropy_with_logits = () => [
  {
    heading: 'F.binary_cross_entropy_with_logits on this line',
    body:
      'Numerically stable binary cross-entropy fused with sigmoid. Takes RAW logits, not probabilities. This is what you want 99% of the time for binary or multi-label classification.',
  },
  {
    heading: 'Shapes',
    body: 'logits and targets must match in shape. Targets are floats in [0, 1] — typically 0.0 and 1.0, but soft labels work too.',
    code: 'loss = F.binary_cross_entropy_with_logits(logits, targets.float())',
  },
]

// ── OPTIM ───────────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.optim = () => [
  {
    heading: 'torch.optim on this line',
    body:
      'The submodule containing every standard gradient-based optimiser: SGD, Adam, AdamW, RMSprop, Adagrad, LBFGS, and others. Each one is a class you instantiate with model.parameters() and hyperparameters.',
  },
  {
    heading: 'Common pattern',
    code: 'optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)\n\nfor x, y in loader:\n    optimizer.zero_grad()\n    loss = criterion(model(x), y)\n    loss.backward()\n    optimizer.step()',
    body: 'Every optimiser follows this rhythm. The only thing that changes between SGD and Adam is the math inside .step().',
  },
  {
    heading: 'torch.optim.lr_scheduler',
    body:
      'A sibling submodule — wraps the optimiser to vary the learning rate over time. Warmup + cosine decay is the default recipe for modern Transformers.',
  },
]

ULTRA_EXPLAINERS.SGD = ({ line }) => {
  const m = /SGD\(\s*([^)]*)\)/.exec(line)
  const args = m ? m[1] : '...'
  return [
    {
      heading: `torch.optim.SGD(${args}) on this line`,
      body:
        'Stochastic Gradient Descent. Each step: param ← param − lr · grad. With momentum=0.9 it adds a velocity term that averages recent gradients, smoothing updates and escaping shallow saddle points.',
    },
    {
      heading: 'Still competitive',
      body:
        'For vision tasks (ResNet, ConvNeXt), SGD+momentum with a proper LR schedule often MATCHES or beats Adam. It generalises slightly better because its noisier updates act as an implicit regulariser.',
    },
    {
      heading: 'Typical config',
      body: '• lr=0.1 for ResNet-style, decayed by 10x at milestones.\n• momentum=0.9.\n• weight_decay=1e-4 (L2 regularisation on weights).\n• nesterov=True — slightly better variant of momentum.',
    },
  ]
}

ULTRA_EXPLAINERS.Adam = ({ line }) => {
  const m = /Adam\(\s*([^)]*)\)/.exec(line)
  const args = m ? m[1] : '...'
  return [
    {
      heading: `torch.optim.Adam(${args}) on this line`,
      body:
        'Adaptive Moment Estimation. Maintains two running averages per parameter: m (first moment, ≈ mean of gradients) and v (second moment, ≈ variance). Update uses m̂ / (√v̂ + ε) — large for consistent gradients, small for noisy ones.',
    },
    {
      heading: 'Why people default to it',
      body:
        '• Sane results with minimal LR tuning.\n• Handles sparse gradients well.\n• Robust across many architectures.\n• Good first choice when you do not know the problem yet.',
    },
    {
      heading: 'Typical hyperparameters',
      body: '• lr=1e-3 for most problems; 1e-4 or 3e-4 for Transformers.\n• betas=(0.9, 0.999) — rarely change these.\n• eps=1e-8 — numerical floor; bump to 1e-6 for float16.',
    },
  ]
}

ULTRA_EXPLAINERS.AdamW = () => [
  {
    heading: 'torch.optim.AdamW on this line',
    body:
      'Adam with DECOUPLED weight decay. In original Adam, the weight decay term was implicitly scaled by the adaptive LR — messy. AdamW separates them: the decay is applied directly to the parameter on each step.',
  },
  {
    heading: 'Why this matters',
    body:
      'Decoupled weight decay generalises measurably better than naive L2-in-loss for large models. Every modern Transformer (BERT, GPT, Llama, ViT) trains with AdamW, not Adam.',
  },
  {
    heading: 'Typical defaults',
    body: 'lr=3e-4, betas=(0.9, 0.95) for LLMs, weight_decay=0.1. If you are training a Transformer, start here.',
  },
]

ULTRA_EXPLAINERS.RMSprop = () => [
  {
    heading: 'torch.optim.RMSprop on this line',
    body:
      'Maintains a running AVERAGE of squared gradients per parameter and divides the update by its square root. Adaptive per-parameter learning rates, but without Adam\'s first-moment term.',
  },
  {
    heading: 'When to reach for it',
    body:
      'Classic choice for RNNs before Adam took over. Still sometimes used in reinforcement learning. For most supervised deep learning today, Adam/AdamW are better starting points.',
  },
]

// ── DATA ────────────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.Dataset = () => [
  {
    heading: 'torch.utils.data.Dataset on this line',
    body:
      'Abstract base class representing a collection of training examples. You subclass it and implement two methods:\n• __len__(self) — total number of examples.\n• __getitem__(self, idx) — return the example at index idx.',
  },
  {
    heading: 'Minimal example',
    code: 'class MyData(Dataset):\n    def __init__(self, X, y):\n        self.X = X\n        self.y = y\n    def __len__(self):\n        return len(self.X)\n    def __getitem__(self, i):\n        return self.X[i], self.y[i]',
    body: 'DataLoader then takes care of batching, shuffling and multi-worker loading.',
  },
  {
    heading: 'Lazy is good',
    body:
      'Do expensive work (decoding images, tokenising text) inside __getitem__, not in __init__. That way multiple workers parallelise the cost and memory stays low.',
  },
]

ULTRA_EXPLAINERS.TensorDataset = () => [
  {
    heading: 'TensorDataset on this line',
    body:
      'Quick-and-dirty Dataset that wraps already-in-memory parallel tensors. __getitem__(i) returns a tuple sliced at index i from each tensor you passed.',
  },
  {
    heading: 'Good for prototypes',
    code: 'ds = TensorDataset(X_tensor, y_tensor)\ndl = DataLoader(ds, batch_size=64, shuffle=True)',
    body: 'Perfect when your whole dataset fits in RAM. For larger / streamed data, write a custom Dataset with lazy loading.',
  },
]

// ── DEVICE ──────────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.device = () => [
  {
    heading: 'torch.device on this line',
    body:
      'A lightweight object representing a physical target: "cpu", "cuda", "cuda:0", "cuda:1", "mps" (Apple Silicon). Used to move tensors and modules.',
  },
  {
    heading: 'Canonical pattern',
    code: "device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')\nmodel = Model().to(device)\nfor x, y in loader:\n    x, y = x.to(device), y.to(device)\n    ...",
    body: 'This exact idiom appears in almost every PyTorch training script.',
  },
  {
    heading: 'On Apple Silicon',
    body: "Use 'mps' instead of 'cuda': `torch.device('mps' if torch.backends.mps.is_available() else 'cpu')`.",
  },
]

ULTRA_EXPLAINERS.cuda = () => [
  {
    heading: 'torch.cuda on this line',
    body:
      'The GPU runtime interface. Provides device queries (is_available, device_count), memory stats (memory_allocated, memory_reserved), synchronisation (synchronize), seed control (manual_seed_all), and more.',
  },
  {
    heading: 'You rarely need it directly',
    body:
      'Most day-to-day work uses .to(device). Reach for torch.cuda.* when you are: debugging memory, measuring kernel time (use torch.cuda.synchronize() before your timer), or managing multiple GPUs.',
  },
]

ULTRA_EXPLAINERS.is_available = () => [
  {
    heading: 'torch.cuda.is_available() on this line',
    body:
      'Returns True iff PyTorch can see at least one CUDA-capable GPU AND the driver + runtime are compatible with the installed torch build. Fast, safe to call at program start.',
  },
  {
    heading: 'Typical guard',
    code: "device = 'cuda' if torch.cuda.is_available() else 'cpu'",
    body:
      'Always wrap GPU choice in this check so your code runs on laptops too. For Apple Silicon there is a parallel torch.backends.mps.is_available().',
  },
]

// ── TRAINING HELPERS ────────────────────────────────────────────────────
ULTRA_EXPLAINERS.manual_seed = ({ line }) => {
  const m = /manual_seed\(\s*(\d+)\s*\)/.exec(line)
  const s = m?.[1] ?? 'S'
  return [
    {
      heading: `torch.manual_seed(${s}) on this line`,
      body:
        `Seeds the PyTorch CPU random-number generator with ${s}. Subsequent calls to torch.randn, dropout, random init, random_split, … become deterministic for this process.`,
    },
    {
      heading: 'Seeding is per-library',
      body:
        'For fully reproducible runs you need to seed EVERY RNG your code touches:',
      code: `import random, numpy as np, torch\nrandom.seed(${s})\nnp.random.seed(${s})\ntorch.manual_seed(${s})\ntorch.cuda.manual_seed_all(${s})`,
    },
    {
      heading: 'Full determinism has a cost',
      body:
        'Setting torch.backends.cudnn.deterministic=True and torch.use_deterministic_algorithms(True) removes non-determinism from GPU kernels, but many kernels slow down or error out. Only enable for rigorous experiments.',
    },
  ]
}

ULTRA_EXPLAINERS.save = ({ line }) => [
  {
    heading: 'torch.save on this line',
    body:
      'Serialises a tensor, state_dict, or any picklable Python object to disk. Under the hood uses Python pickle + a zip-based format (since PyTorch 1.6).',
  },
  {
    heading: 'Always save state_dicts, not models',
    code: "torch.save(model.state_dict(), 'ckpt.pt')    # ✓ portable\ntorch.save(model,             'model.pt')  # ✗ fragile: ties to class layout",
    body:
      'State dicts survive refactors of your model code. Pickled module objects break if you rename a class or move it to a different file.',
  },
  {
    heading: 'Complete checkpoint',
    code: "torch.save({\n    'epoch': epoch,\n    'model': model.state_dict(),\n    'optim': optimizer.state_dict(),\n    'loss': loss.item(),\n}, 'ckpt.pt')",
    body: 'Saving the optimizer state lets you resume training with the exact same momentum / Adam moments.',
  },
]

ULTRA_EXPLAINERS.load = () => [
  {
    heading: 'torch.load on this line',
    body: 'Inverse of torch.save. Deserialises whatever object was stored. Returns the Python object directly — for state_dicts that is the dict you then pass to load_state_dict.',
  },
  {
    heading: 'map_location is crucial',
    body:
      'Without it, load tries to place tensors on the EXACT device they were saved on. If you saved on cuda:3 and load on a single-GPU machine, that errors. Always pass map_location:',
    code: "ckpt = torch.load('ckpt.pt', map_location='cpu')\nmodel.load_state_dict(ckpt['model'])",
  },
  {
    heading: 'Security note',
    body:
      'torch.load uses pickle under the hood, which can execute arbitrary code. Never torch.load a checkpoint from an untrusted source. For untrusted weights use safetensors instead.',
  },
]

// ── MIXED PRECISION ────────────────────────────────────────────────────
ULTRA_EXPLAINERS.amp = () => [
  {
    heading: 'torch.amp on this line',
    body:
      'Automatic Mixed Precision. Runs most forward ops in float16 (or bfloat16) — 2-4× faster on modern GPUs — while keeping a few numerically sensitive ops in float32. Gradients still accumulate in float32 for stability.',
  },
  {
    heading: 'Three pieces that work together',
    body:
      '• torch.autocast(device_type, dtype) — the forward-pass context.\n• torch.amp.GradScaler() — scales the loss before backward() so tiny fp16 gradients don\'t underflow to zero.\n• scaler.step(optimizer) / scaler.update() — replaces optimizer.step() to handle the unscaling.',
  },
]

ULTRA_EXPLAINERS.GradScaler = ({ line }) => {
  const lhs = lhsVar(line) ?? 'scaler'
  return [
    {
      heading: `What ${lhs} = GradScaler() gives you`,
      body:
        `A helper that multiplies the loss by a dynamically tuned scale factor before .backward(), so gradients in float16 don't underflow to zero. It then UNSCALES before the optimizer step so math works out identically to full-precision training.`,
    },
    {
      heading: 'The AMP training loop',
      code: `${lhs} = torch.amp.GradScaler()\n\nfor x, y in loader:\n    opt.zero_grad()\n    with torch.autocast(device_type='cuda', dtype=torch.float16):\n        logits = model(x)\n        loss = loss_fn(logits, y)\n    ${lhs}.scale(loss).backward()\n    ${lhs}.step(opt)\n    ${lhs}.update()`,
      body: 'Note the asymmetry: forward uses autocast, backward uses the scaler. scale(loss).backward() does BOTH the scaling and the backward pass.',
    },
    {
      heading: 'Why you need it',
      body:
        'In pure fp16, gradient magnitudes below ~6e-5 round to zero and training silently fails. GradScaler picks a scale (e.g. 65536) that keeps gradients representable, then divides it back out inside .step(). If an overflow is detected, it halves the scale for next time and skips the step.',
    },
    {
      heading: 'bfloat16 usually needs no scaler',
      body: 'bfloat16 has the SAME exponent range as fp32, so gradients don\'t underflow. If you autocast to bfloat16 on Ampere/Hopper GPUs, you can skip GradScaler entirely.',
    },
  ]
}

ULTRA_EXPLAINERS.autocast = () => [
  {
    heading: 'torch.autocast on this line',
    body:
      'A context manager that auto-casts ops inside its block to a chosen lower-precision dtype (float16 or bfloat16) where it is safe, leaving the rest in float32.',
  },
  {
    heading: 'Only wrap the forward pass',
    body:
      'Put autocast around the forward + loss computation, NOT around .backward(). PyTorch handles the mixed-dtype backward automatically:',
    code: "with torch.autocast(device_type='cuda', dtype=torch.float16):\n    logits = model(x)\n    loss   = loss_fn(logits, y)\nscaler.scale(loss).backward()",
  },
  {
    heading: 'CPU vs CUDA',
    body: "Pass device_type='cuda' for GPU, 'cpu' for CPU bfloat16 AMP. On Apple Silicon use device_type='mps' (PyTorch ≥ 2.0).",
  },
]

// ── LR SCHEDULERS ──────────────────────────────────────────────────────
ULTRA_EXPLAINERS.lr_scheduler = () => [
  {
    heading: 'torch.optim.lr_scheduler on this line',
    body:
      'The submodule holding learning-rate schedulers: CosineAnnealingLR, StepLR, MultiStepLR, ReduceLROnPlateau, OneCycleLR, LinearLR, SequentialLR, and more. Each wraps an optimizer and adjusts its lr over time.',
  },
  {
    heading: 'Rule of thumb',
    body:
      '• Flat LR = leaves performance on the table.\n• Step decay (drop LR at milestones) = simple, works.\n• Cosine annealing + warmup = default for Transformers.\n• OneCycleLR = fastest convergence for small-to-medium models.',
  },
  {
    heading: 'Always call scheduler.step() after optimizer.step()',
    body: 'Schedulers read optimizer state. Calling them in the wrong order produces a warning and may skip the first update.',
  },
]

ULTRA_EXPLAINERS.CosineAnnealingLR = ({ line }) => {
  const m = /CosineAnnealingLR\(\s*([^)]*)\)/.exec(line)
  const args = m ? m[1] : 'optimizer, T_max'
  return [
    {
      heading: `CosineAnnealingLR(${args}) on this line`,
      body:
        'Decays the learning rate from the initial value down to eta_min following HALF a cosine wave over T_max scheduler steps. Starts gentle, plateaus smoothly at the low end.',
    },
    {
      heading: 'Why cosine works so well',
      body:
        'Large LR early = fast coarse progress. Smoothly-decreasing LR late = fine-tune into a deep minimum. No discontinuities (unlike StepLR), so loss curves are clean.',
    },
    {
      heading: 'Common pattern',
      code: 'opt   = torch.optim.AdamW(model.parameters(), lr=3e-4)\nsched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)\n\nfor epoch in range(epochs):\n    train_one_epoch(...)\n    sched.step()           # once per epoch',
      body: 'Pair with a short linear warmup (SequentialLR or LinearLR → CosineAnnealingLR) for Transformer training.',
    },
  ]
}

ULTRA_EXPLAINERS.StepLR = () => [
  {
    heading: 'StepLR on this line',
    body: 'Multiplies the LR by `gamma` every `step_size` epochs. A staircase decay — LR stays flat then drops sharply.',
  },
  {
    heading: 'Classic ResNet recipe',
    code: 'sched = StepLR(opt, step_size=30, gamma=0.1)   # drop ×0.1 every 30 epochs',
    body: 'Ugly loss curve (big jumps) but rock-solid and easy to reason about. Still a perfectly fine baseline.',
  },
]

ULTRA_EXPLAINERS.MultiStepLR = () => [
  {
    heading: 'MultiStepLR on this line',
    body: 'Like StepLR but drops at the exact epoch MILESTONES you specify. Useful when you know empirically which epochs need a cut.',
    code: 'sched = MultiStepLR(opt, milestones=[60, 120, 160], gamma=0.2)',
  },
]

ULTRA_EXPLAINERS.ReduceLROnPlateau = () => [
  {
    heading: 'ReduceLROnPlateau on this line',
    body:
      'Watches a validation metric and drops the LR when it stops improving for `patience` epochs. Adaptive — you don\'t have to pick epoch numbers in advance.',
  },
  {
    heading: 'Pass the metric to .step()',
    code: 'sched = ReduceLROnPlateau(opt, mode="min", factor=0.5, patience=5)\n\nval_loss = evaluate(...)\nsched.step(val_loss)      # ← pass the metric',
    body: 'Unlike other schedulers, this one takes a value. Forgetting to pass it is a classic bug.',
  },
]

ULTRA_EXPLAINERS.OneCycleLR = () => [
  {
    heading: 'OneCycleLR on this line',
    body:
      'Leslie Smith\'s super-convergence schedule: warm up from a low LR to `max_lr`, then smoothly decay to near zero, all within ONE run. Often trains 2-10× faster than fixed or step schedules.',
  },
  {
    heading: 'Step EVERY iteration, not every epoch',
    code: 'sched = OneCycleLR(opt, max_lr=1e-2, epochs=E, steps_per_epoch=len(loader))\n\nfor epoch in range(E):\n    for x, y in loader:\n        opt.zero_grad()\n        loss_fn(model(x), y).backward()\n        opt.step()\n        sched.step()           # per-batch!',
    body: 'OneCycleLR expects iteration-level steps — `steps_per_epoch × epochs` of them. Calling per-epoch wastes most of the schedule.',
  },
]

ULTRA_EXPLAINERS.LinearLR = () => [
  {
    heading: 'LinearLR on this line',
    body:
      'Linearly interpolates the LR from `start_factor × base_lr` to `end_factor × base_lr` over `total_iters` scheduler steps. Most common use: a WARMUP at the start of training.',
    code: 'warmup = LinearLR(opt, start_factor=0.01, total_iters=500)   # 500 iters to reach base lr',
  },
]

// ── UTILITIES ──────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.clip_grad_norm_ = () => [
  {
    heading: 'nn.utils.clip_grad_norm_ on this line',
    body:
      'Computes the global L2 norm of every parameter\'s gradient, and if it exceeds `max_norm`, SCALES ALL gradients down so the global norm is exactly `max_norm`. Prevents exploding gradients in RNNs and Transformers.',
  },
  {
    heading: 'Correct placement',
    code: 'loss.backward()\ntorch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\nopt.step()',
    body: 'Clip AFTER backward (you need gradients to exist) and BEFORE optimizer step (that\'s where they get applied). Standard Transformer value is max_norm=1.0.',
  },
  {
    heading: 'Trailing underscore = in-place',
    body: 'The underscore means gradients are modified IN PLACE. The return value is just the norm (useful to log).',
  },
]

// ── CONVENTION NAMES ───────────────────────────────────────────────────
ULTRA_EXPLAINERS.model = ({ line }) => {
  const lhs = lhsVar(line)
  return [
    {
      heading: `${lhs ?? 'model'} — the nn.Module you are training`,
      body:
        'By convention `model` is the root nn.Module — the object you called YourClass(...) on. Everything the training loop touches goes through it: forward pass, parameters, device placement, save / load, train / eval mode.',
    },
    {
      heading: 'Typical interactions',
      code: 'model = MyModel(...).to(device)\nopt = torch.optim.Adam(model.parameters(), lr=1e-3)\n\nmodel.train()                 # training mode\nlogits = model(x)             # forward\nloss   = loss_fn(logits, y)\nloss.backward()\nopt.step()\n\nmodel.eval()                  # inference mode\ntorch.save(model.state_dict(), "ckpt.pth")',
      body: 'If you see `model` somewhere in deep-learning code, 99% of the time it means "this nn.Module".',
    },
  ]
}

ULTRA_EXPLAINERS.epochs = ({ line }) => {
  const m = /epochs\s*=\s*(\d+)/.exec(line)
  const n = m ? m[1] : null
  return [
    {
      heading: n ? `epochs = ${n} on this line` : 'epochs on this line',
      body:
        n
          ? `This run will sweep the full training set ${n} times. Each epoch = one pass over every training example (in random order if shuffle=True).`
          : 'The number of COMPLETE passes over the training set. Each epoch = one full loop over every training example.',
    },
    {
      heading: 'How to choose it',
      body:
        '• Too few → underfitting, loss still trending down at end.\n• Too many → overfitting, val loss starts rising while train loss keeps falling.\n• Safest: pick a generous upper bound and use early stopping / best-checkpoint selection on val loss.',
    },
    {
      heading: 'Epochs vs steps',
      body:
        'Some codebases (LLM training especially) count STEPS (= iterations = batches) instead of epochs. Equivalent relation: total_steps = epochs × len(train_loader).',
    },
  ]
}

ULTRA_EXPLAINERS.lr = ({ line }) => {
  const m = /lr\s*=\s*([0-9.eE+-]+)/.exec(line)
  const val = m ? m[1] : null
  return [
    {
      heading: val ? `lr = ${val} on this line` : 'lr on this line',
      body:
        val
          ? `Sets the learning rate to ${val}. This is how far the optimizer moves along the negative gradient each step.`
          : 'The learning rate — the size of each parameter update. Param ← Param − lr · grad (for plain SGD).',
    },
    {
      heading: 'Ballpark values',
      body:
        '• Adam / AdamW default:  1e-3.\n• Transformers (AdamW + warmup): 1e-4 to 3e-4.\n• Fine-tuning a pretrained model: 1e-5 to 5e-5.\n• SGD with momentum on vision: 0.1 → decayed.',
    },
    {
      heading: 'Single most important hyperparameter',
      body:
        'Too high → loss diverges to NaN. Too low → painfully slow training. Do an LR-range test first (try 1e-6 → 1, note where loss starts improving), then set base_lr near that value.',
    },
  ]
}

ULTRA_EXPLAINERS.weight_decay = ({ line }) => {
  const m = /weight_decay\s*=\s*([0-9.eE+-]+)/.exec(line)
  const val = m ? m[1] : null
  return [
    {
      heading: val ? `weight_decay = ${val} on this line` : 'weight_decay on this line',
      body:
        'L2 regularisation passed to the optimizer. Each step, every weight is pulled slightly toward zero: `w ← w − lr · (grad + weight_decay · w)`. Fights overfitting by preferring smaller-magnitude weights.',
    },
    {
      heading: 'Typical values',
      body:
        '• CNN / ResNet with SGD: 1e-4.\n• AdamW for Transformers: 0.01 to 0.1.\n• Very small models / lots of data: can often use 0.',
    },
    {
      heading: 'AdamW vs Adam',
      body:
        'In plain Adam the decay interacts weirdly with the adaptive LR. AdamW applies the decay SEPARATELY from the gradient — mathematically cleaner and measurably better for large models. Always prefer AdamW when you want weight decay.',
    },
  ]
}

ULTRA_EXPLAINERS.loss_fn = ({ line }) => {
  const lhs = lhsVar(line)
  return [
    {
      heading: `${lhs ?? 'loss_fn'} — the loss criterion`,
      body:
        'A callable (often an nn.Module instance, sometimes a plain function) that takes `(predictions, targets)` and returns a scalar tensor. The training loop then calls `.backward()` on that scalar.',
    },
    {
      heading: 'Which one to pick',
      body:
        '• Multi-class classification: `nn.CrossEntropyLoss()` (feed raw logits + integer labels).\n• Binary / multi-label classification: `nn.BCEWithLogitsLoss()`.\n• Regression: `nn.MSELoss()` or `nn.SmoothL1Loss()` if outliers matter.\n• Sequence tasks with padding: pass `ignore_index=PAD_ID` to CrossEntropyLoss.',
    },
    {
      heading: 'Called like a function',
      body: 'Pass (predictions, targets) and you get back a scalar tensor ready for .backward().',
      code: 'loss = loss_fn(logits, labels)   # scalar\nloss.backward()',
    },
  ]
}

ULTRA_EXPLAINERS.criterion = () => [
  {
    heading: 'criterion — same thing as loss_fn',
    body:
      'Older PyTorch convention (inherited from Torch7) for the loss object. Indistinguishable from `loss_fn` in meaning. Some codebases use `criterion`, others use `loss_fn` — pick one and stay consistent.',
    code: 'criterion = nn.CrossEntropyLoss()\nloss = criterion(logits, y)',
  },
]

ULTRA_EXPLAINERS.opt = ({ line }) => {
  const lhs = lhsVar(line)
  return [
    {
      heading: `${lhs ?? 'opt'} — shorthand for optimizer`,
      body:
        'A torch.optim.* instance (SGD, Adam, AdamW, …) bound to your model\'s parameters. It is the thing that actually updates weights using gradients.',
    },
    {
      heading: 'The three calls you make on it',
      code: 'opt.zero_grad()    # clear .grad on every managed parameter\nloss.backward()    # fill .grad\nopt.step()          # apply update using .grad',
      body: 'That rhythm is the heart of every PyTorch training loop.',
    },
  ]
}

ULTRA_EXPLAINERS.optimizer = () => [
  {
    heading: 'optimizer — the parameter updater',
    body:
      'Exactly the same role as `opt` — just spelled out. A torch.optim.* instance that stores your parameters + hyperparameters (lr, betas, weight_decay) and applies updates via .step().',
  },
]

ULTRA_EXPLAINERS.sched = ({ line }) => {
  const lhs = lhsVar(line)
  return [
    {
      heading: `${lhs ?? 'sched'} — shorthand for scheduler`,
      body:
        'An LR scheduler from torch.optim.lr_scheduler. Wraps an optimizer and adjusts its learning rate according to a policy (cosine, step, plateau, one-cycle, …).',
    },
    {
      heading: 'Call order matters',
      code: 'opt.step()     # first\nsched.step()    # then',
      body: 'Always step the scheduler AFTER the optimizer, once per epoch (or per iteration for OneCycleLR).',
    },
  ]
}

ULTRA_EXPLAINERS.scheduler = () => [
  {
    heading: 'scheduler — the LR policy',
    body:
      'Same as `sched`. The object that moves the optimizer\'s learning rate over time. Must be stepped AFTER the optimizer, typically once per epoch.',
  },
]

ULTRA_EXPLAINERS.scaler = () => [
  {
    heading: 'scaler — the AMP gradient scaler',
    body:
      'A torch.amp.GradScaler instance. Scales the loss before backward so tiny fp16 gradients survive, then unscales them inside its .step(optimizer) call. Only needed for float16 AMP (bfloat16 works without it).',
  },
  {
    heading: 'Four calls in the loop',
    code: 'scaler.scale(loss).backward()\nscaler.step(opt)\nscaler.update()',
    body: 'scale() multiplies the loss; step() unscales gradients and calls opt.step() (skipping on overflow); update() tunes the scale factor for next iteration.',
  },
]

ULTRA_EXPLAINERS.ckpt_path = ({ line }) => {
  const m = /ckpt_path\s*=\s*["']([^"']+)["']/.exec(line)
  const path = m ? m[1] : null
  return [
    {
      heading: path ? `ckpt_path = "${path}" on this line` : 'ckpt_path on this line',
      body:
        path
          ? `Filesystem path where the best checkpoint will be written. Convention: ".pth" or ".pt" extension.`
          : 'Filesystem path to the checkpoint file. Usually written after each improvement in val metric, so you end up with the best weights not just the last.',
    },
    {
      heading: 'What goes inside',
      body:
        'A state_dict is enough for inference. For FULL resumability save a dict including optimizer + scheduler + epoch + scaler:',
      code: "torch.save({\n    'epoch': epoch,\n    'model': model.state_dict(),\n    'optimizer': opt.state_dict(),\n    'scheduler': sched.state_dict(),\n    'scaler': scaler.state_dict(),\n    'best_val': best,\n}, ckpt_path)",
    },
  ]
}

ULTRA_EXPLAINERS.checkpoint = () => [
  {
    heading: 'checkpoint — the training snapshot',
    body:
      'A Python dict containing enough to resume training exactly where you left off: model weights, optimizer state, scheduler state, current epoch, best metric so far. Saved with torch.save and loaded with torch.load.',
  },
  {
    heading: 'Minimum viable checkpoint',
    code: "ckpt = {'model': model.state_dict(),\n        'optimizer': opt.state_dict(),\n        'epoch': epoch}",
    body: 'Missing the optimizer state means Adam\'s moment estimates restart at zero — a jarring discontinuity when you resume.',
  },
]

ULTRA_EXPLAINERS.batch_size = ({ line }) => {
  const m = /batch_size\s*=\s*(\d+)/.exec(line)
  const n = m ? m[1] : null
  return [
    {
      heading: n ? `batch_size = ${n} on this line` : 'batch_size on this line',
      body: n
        ? `Each training step will use ${n} examples. Larger batches → smoother gradient estimates, smaller → more stochastic / regularised.`
        : 'Number of examples processed per forward/backward pass.',
    },
    {
      heading: 'Sensible ranges',
      body:
        '• CNN classifiers: 32 – 256.\n• Transformers with short sequences: 16 – 128.\n• LLM pretraining: measured in thousands (via gradient accumulation).\n• Increase until you hit a GPU memory wall, then scale LR linearly if you want the same training dynamics.',
    },
  ]
}

ULTRA_EXPLAINERS.train_loader = () => [
  {
    heading: 'train_loader — training DataLoader',
    body:
      'By convention, the DataLoader over your training set with shuffle=True. Each `for x, y in train_loader:` yields one mini-batch ready to feed into the model.',
  },
  {
    heading: 'Typical configuration',
    code: 'train_loader = DataLoader(train_ds, batch_size=64, shuffle=True,\n                          num_workers=4, pin_memory=True)',
    body: 'shuffle=True is essential — not shuffling means each epoch sees examples in identical order and training stalls.',
  },
]

ULTRA_EXPLAINERS.val_loader = () => [
  {
    heading: 'val_loader — validation DataLoader',
    body:
      'DataLoader over the validation split with shuffle=False. Used inside `model.eval()` + `with torch.no_grad():` blocks to monitor generalisation and pick the best checkpoint.',
  },
  {
    heading: 'Why shuffle=False',
    body: 'Validation metrics must be deterministic and comparable across runs. Shuffle adds zero information for metrics and complicates reproducibility.',
  },
]

ULTRA_EXPLAINERS.test_loader = () => [
  {
    heading: 'test_loader — the held-out split',
    body:
      'DataLoader over the TEST set — the split you only touch at the very end of the project to report final numbers. Using it for hyperparameter tuning leaks information and inflates your quoted accuracy.',
  },
]

ULTRA_EXPLAINERS.inputs = () => [
  {
    heading: 'inputs — the batch of features',
    body:
      'Convention for the x side of a (x, y) pair coming out of a DataLoader. Shape depends on the modality: (B, C, H, W) for images, (B, T) for token sequences, (B, F) for tabular.',
  },
]

ULTRA_EXPLAINERS.labels = () => [
  {
    heading: 'labels — ground-truth targets',
    body:
      'The y side of a batch. For classification, a LongTensor of shape (B,) with integer class IDs. For regression, a FloatTensor of shape (B,) or (B, D).',
  },
]

ULTRA_EXPLAINERS.targets = () => [
  {
    heading: 'targets — synonym for labels',
    body: 'Same role as `labels`. Some codebases use `targets`, especially when the output is not a categorical label (e.g. regression, next-token prediction).',
  },
]

ULTRA_EXPLAINERS.logits = () => [
  {
    heading: 'logits — raw pre-softmax scores',
    body:
      'The unnormalised output of a classifier. A (batch, num_classes) tensor where larger values mean more likely. They can be any real number — positive or negative.',
  },
  {
    heading: 'Always feed logits (not probs) to CrossEntropyLoss',
    body:
      'nn.CrossEntropyLoss applies log_softmax internally. If you softmax first, you double-apply the operation and training silently breaks. Same for BCEWithLogitsLoss + sigmoid.',
  },
  {
    heading: 'Get probabilities / predictions',
    body: 'Softmax converts logits to a probability distribution; argmax gives the predicted class ID.',
    code: 'probs = logits.softmax(dim=-1)     # for display\npreds = logits.argmax(dim=-1)       # for accuracy',
  },
]

ULTRA_EXPLAINERS.preds = () => [
  {
    heading: 'preds — the model\'s predictions',
    body:
      'For classification, usually `logits.argmax(dim=-1)` giving integer class IDs. For regression, often the raw model output. Used for accuracy / confusion-matrix computation, NOT loss.',
  },
]

ULTRA_EXPLAINERS.loss = ({ line }) => {
  const lhs = lhsVar(line)
  return [
    {
      heading: `${lhs ?? 'loss'} — the scalar you backprop from`,
      body:
        'A zero-dimensional tensor returned by the loss function. `loss.backward()` walks the autograd graph from this scalar and accumulates dloss/dparam into every parameter\'s .grad.',
    },
    {
      heading: 'Must be a scalar',
      body:
        'If your loss is a batched vector, reduce it first: `loss = per_sample_loss.mean()` (or .sum()). Otherwise .backward() needs an explicit gradient argument of matching shape.',
    },
    {
      heading: 'Log with .item()',
      body: 'Use `loss.item()` — not `loss` — inside `print`, f-strings, or `.append(...)` to avoid keeping the autograd graph alive longer than needed.',
    },
  ]
}

ULTRA_EXPLAINERS.fit = ({ line }) => {
  const m = /def\s+fit\s*\(([^)]*)/.exec(line)
  const sig = m ? m[1].trim() : ''
  return [
    {
      heading: 'fit(...) — the whole training loop',
      body:
        sig
          ? `A Keras-style wrapper around everything training-related. Takes at least (${sig}) and runs: for each epoch → iterate train_loader → forward / loss / backward / optimizer step → evaluate on val_loader → save checkpoint if improved.`
          : 'A Keras-style wrapper that hides the epoch loop, batch loop, optimization, validation, and checkpointing behind one call: `fit(model, train_loader, val_loader, ...)`.',
    },
    {
      heading: 'Why wrap the loop',
      body:
        'Keeps experiment scripts short, centralises the boring-but-critical bits (zero_grad, no_grad for eval, train/eval mode, best-checkpoint selection), and makes it easy to swap in mixed precision, gradient accumulation, or schedulers without touching callers.',
    },
    {
      heading: 'Minimal skeleton',
      code: 'def fit(model, train_loader, val_loader, epochs=20, lr=1e-4,\n        device="cuda", ckpt_path="best.pth"):\n    model.to(device)\n    opt    = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-2)\n    sched  = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)\n    scaler = torch.amp.GradScaler()\n    loss_fn = nn.CrossEntropyLoss()\n\n    best = float("inf")\n    for epoch in range(epochs):\n        model.train()\n        for x, y in train_loader:\n            x, y = x.to(device), y.to(device)\n            opt.zero_grad()\n            with torch.autocast(device_type=device, dtype=torch.float16):\n                logits = model(x)\n                loss   = loss_fn(logits, y)\n            scaler.scale(loss).backward()\n            scaler.step(opt)\n            scaler.update()\n        sched.step()\n\n        val = evaluate(model, val_loader, loss_fn, device)\n        if val < best:\n            best = val\n            torch.save(model.state_dict(), ckpt_path)',
      body: 'Every element on your line appears here: model.to(device), AdamW + weight_decay, CosineAnnealingLR, GradScaler, CrossEntropyLoss, ckpt_path.',
    },
  ]
}

// ════════════════════════════════════════════════════════════════════════
// Advanced topics — torch.compile, hooks, checkpointing, DDP/FSDP,
// profiler, distributions, torch.func, weight init, quantisation, pruning.
// Context-aware ultra detail for every API used in the new code examples.
// ════════════════════════════════════════════════════════════════════════

// ── torch.compile ─────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.compile = ({ line }) => {
  const lhs = lhsVar(line)
  const target = lhs ?? 'compiled'
  const modeMatch = /mode\s*=\s*["']([^"']+)["']/.exec(line)
  const mode = modeMatch ? modeMatch[1] : null
  return [
    {
      heading: `What torch.compile is doing to ${target}`,
      body:
        `torch.compile wraps the module so that the FIRST time ${target}(x) is called, three things happen under the hood:\n1. TorchDynamo walks the Python bytecode of forward() and captures an FX graph (data-dependent control flow becomes a graph break).\n2. AOTAutograd traces forward AND backward together so they can be optimised jointly.\n3. The backend (TorchInductor by default) lowers the graph to fused Triton / C++ kernels, autotunes tile sizes, and caches the result.\nSubsequent calls with the same shapes/dtypes skip straight to the cached kernels.`,
    },
    {
      heading: mode ? `mode="${mode}"` : 'Available modes',
      body: mode === 'reduce-overhead'
        ? 'reduce-overhead uses CUDA Graphs on top of the compiled kernels — eliminates per-iteration Python/launch overhead. Ideal for small-to-medium models that launch many tiny ops per step.'
        : mode === 'max-autotune'
          ? 'max-autotune benchmarks multiple kernel variants per fused region and keeps the fastest — slower compile, squeezes the last 5–10% of runtime. Use for production deploys, not iteration.'
          : '• default — balanced compile time vs runtime.\n• reduce-overhead — adds CUDA Graphs, kills per-iter Python overhead.\n• max-autotune — exhaustive kernel autotuning, slowest compile, fastest runtime.',
    },
    {
      heading: 'Gotchas in practice',
      body:
        '• First call is SLOW (compilation). Always do a warm-up step before timing.\n• Every new input shape / dtype triggers a recompile. Keep batch/seq shapes stable (pad, not dynamic).\n• .item() / .cpu() / data-dependent ifs cause graph BREAKS — fragment the graph and lose fusion.\n• If things look wrong, run torch._dynamo.explain(model)(x) to see every break + reason.',
    },
    {
      heading: 'Typical speedup',
      body:
        'For attention / FFN / conv heavy models on modern GPUs: 1.3–3× faster end-to-end with a one-line change. Tiny models bottlenecked on data loading see little gain.',
      code: `${target} = torch.compile(model${mode ? `, mode="${mode}"` : ''})\n# first call compiles, later calls are fast\nfor _ in range(3):\n    y = ${target}(x)`,
    },
  ]
}

// ── hooks ─────────────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.register_forward_hook = ({ line }) => {
  const recv = receiverFor('register_forward_hook', line) ?? 'module'
  return [
    {
      heading: `What ${recv}.register_forward_hook(fn) installs`,
      body:
        `A callback fn(module, inputs, output) that fires AFTER ${recv} produces an output. You can read the activation, log statistics, save it for Grad-CAM, or return a modified tensor to replace the output going forward.`,
    },
    {
      heading: 'Return the handle — always',
      body:
        'register_forward_hook returns a RemovableHandle. Keep it in a variable so you can call .remove() when done. Forgotten hooks are a top-3 source of phantom bugs: they fire on every forward, accumulate memory, and silently warp outputs in later runs.',
      code: `h = ${recv}.register_forward_hook(fn)\n# ... use the model ...\nh.remove()   # CRITICAL`,
    },
    {
      heading: 'Classic use: feature extraction',
      code: `features = {}\ndef save(name):\n    def hook(mod, inp, out):\n        features[name] = out.detach()   # .detach() so we don't keep the graph\n    return hook\n\nh = ${recv}.register_forward_hook(save("block4"))`,
      body:
        'Calling .detach() on the stored tensor is important — otherwise every forward keeps the entire autograd graph alive through `features`, and your VRAM fills within a few steps.',
    },
    {
      heading: 'Related hooks',
      body:
        '• register_forward_pre_hook(fn) — fires BEFORE forward, receives inputs.\n• register_full_backward_hook(fn) — fires during backward with grad_input / grad_output.\n• tensor.register_hook(fn) — attached to a single tensor, not a module.',
    },
  ]
}

ULTRA_EXPLAINERS.register_full_backward_hook = ({ line }) => {
  const recv = receiverFor('register_full_backward_hook', line) ?? 'module'
  return [
    {
      heading: `What ${recv}.register_full_backward_hook(fn) does`,
      body:
        `Callback signature: fn(module, grad_input, grad_output). Fires during backward when autograd computes gradients for this module's inputs. grad_output is what came from later layers; grad_input is what this module will propagate further up.`,
    },
    {
      heading: 'Read or rewrite',
      body:
        'Return None to just observe (logging, norms, histograms). Return a tuple of new tensors to REPLACE grad_input — useful for custom gradient clipping, inverse passes, or bugfixing a specific layer without rewriting it.',
    },
    {
      heading: 'Why "full"?',
      body:
        'The older register_backward_hook had subtle issues with modules whose forward had side effects or multiple inputs. "full" is the modern, correct version — use it for any new code.',
    },
  ]
}

ULTRA_EXPLAINERS.register_hook = ({ line }) => {
  const recv = receiverFor('register_hook', line) ?? 'tensor'
  return [
    {
      heading: `tensor.register_hook(fn) on ${recv}`,
      body:
        `Attaches a callback fn(grad) that fires when autograd computes d(loss)/d(${recv}). The returned value replaces the gradient flowing through.`,
    },
    {
      heading: 'Use cases',
      body:
        '• Gradient logging at an intermediate activation.\n• Gradient clipping / rescaling per activation.\n• Saliency maps — store abs(grad) per pixel in a forward hook-paired setup.\n• Double-checking a "gradients aren\'t flowing" bug — if the hook never fires, the op wasn\'t actually differentiable.',
      code: `grads = []\n${recv}.register_hook(lambda g: grads.append(g.detach()))`,
    },
  ]
}

// ── gradient checkpointing ────────────────────────────────────────────────
ULTRA_EXPLAINERS.checkpoint_sequential = ({ line }) => {
  const segMatch = /segments\s*=\s*(\d+)/.exec(line)
  const segs = segMatch ? segMatch[1] : 'N'
  return [
    {
      heading: 'checkpoint_sequential — memory-saving forward',
      body:
        `Splits the nn.Sequential into ${segs} equal segments. Only the activation at each SEGMENT boundary is kept in memory; the activations INSIDE each segment are dropped and recomputed during backward.`,
    },
    {
      heading: 'Memory ↔ compute trade',
      body:
        'Peak memory drops from O(num_layers) to roughly O(num_layers / segments) + O(segments). Backward recomputes each segment once, so total compute ≈ 1.33× normal. A very good deal for transformer training.',
    },
    {
      heading: 'use_reentrant=False',
      body:
        'Always pass use_reentrant=False in new code. The legacy reentrant path has quiet bugs around inputs that don\'t require grad and modules with buffers. The non-reentrant path is the modern default.',
      code: `from torch.utils.checkpoint import checkpoint_sequential\nout = checkpoint_sequential(layers, segments=${segs}, input=x,\n                             use_reentrant=False)`,
    },
  ]
}

// ── mixed precision (scaler.scale / unscale_) ────────────────────────────
ULTRA_EXPLAINERS.scale = ({ line }) => {
  const recv = receiverFor('scale', line)
  if (recv !== 'scaler' && !(/GradScaler/.test(line))) return []
  return [
    {
      heading: 'scaler.scale(loss) — multiply before backward',
      body:
        'GradScaler multiplies the loss by a (large) scale factor BEFORE .backward() so that tiny fp16 gradients don\'t underflow to zero. The scale factor is the single reason AMP works reliably in fp16.',
    },
    {
      heading: 'What happens next',
      body:
        '1. scaled_loss.backward() — grads are S× too large but non-zero.\n2. scaler.unscale_(optimizer) — divides the grads by S so optimizer sees real magnitudes; this is when you clip_grad_norm.\n3. scaler.step(optimizer) — skips the step and reduces S if any grad is inf/NaN.\n4. scaler.update() — adjusts S for the next iteration (halves on overflow, doubles every ~2000 clean steps).',
    },
  ]
}

ULTRA_EXPLAINERS.unscale_ = () => [
  {
    heading: 'scaler.unscale_(optimizer)',
    body:
      'Divides the parameters\' .grad tensors by the current GradScaler factor, so downstream code (clipping, logging) sees true-scale gradients. Must be called before torch.nn.utils.clip_grad_norm_ when using AMP.',
    code: 'scaler.scale(loss).backward()\nscaler.unscale_(opt)\ntorch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)\nscaler.step(opt)\nscaler.update()',
  },
]

// ── DDP ───────────────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.init_process_group = ({ line }) => {
  const backendMatch = /["'](nccl|gloo|mpi)["']/.exec(line)
  const backend = backendMatch ? backendMatch[1] : 'nccl'
  return [
    {
      heading: `dist.init_process_group(backend="${backend}")`,
      body:
        `Every process calls this ONCE at startup to join the distributed group. Reads RANK, WORLD_SIZE, MASTER_ADDR, MASTER_PORT from env (set by torchrun). After this call, collective ops (all_reduce, reduce_scatter, broadcast) work across all ranks.`,
    },
    {
      heading: `Why backend="${backend}"`,
      body: backend === 'nccl'
        ? 'NCCL is NVIDIA\'s GPU-collective library — the only sane choice for multi-GPU training. Uses NVLink / PCIe / InfiniBand optimally and overlaps comm with compute.'
        : backend === 'gloo'
          ? 'Gloo is a CPU / cross-platform backend. Use for CPU-only training or debugging on machines without CUDA.'
          : 'MPI backend — only if you already have an MPI-based cluster. NCCL is preferred for GPUs.',
    },
    {
      heading: 'Pairing with torchrun',
      body:
        'Launch with `torchrun --nproc_per_node=4 train.py`. torchrun sets RANK / LOCAL_RANK / WORLD_SIZE / MASTER_ADDR / MASTER_PORT; your script just reads them via dist.get_rank() etc. Always pair with dist.destroy_process_group() at the end.',
    },
  ]
}

ULTRA_EXPLAINERS.DistributedDataParallel = ({ line }) => {
  const lhs = lhsVar(line)
  return [
    {
      heading: `${lhs ?? 'model'} = DDP(model, device_ids=[rank])`,
      body:
        `Wraps the model so that after every backward() the gradients are averaged across all ranks via NCCL ring all-reduce. Each rank keeps a full model replica and consumes a different data shard.`,
    },
    {
      heading: 'Gradient bucketing (why it\'s fast)',
      body:
        'DDP groups params into ~25MB buckets. The moment a bucket\'s gradients are all ready (some layers finish backward before others), the all-reduce for that bucket fires — OVERLAPPED with the remaining backward compute. This is why DDP scales near-linearly.',
    },
    {
      heading: 'Critical pairing',
      body:
        '• DistributedSampler + sampler.set_epoch(epoch) — proper reshuffling per epoch.\n• Only rank 0 should log/save/validate (if dist.get_rank() == 0).\n• find_unused_parameters=True if your forward skips some params (e.g. MoE routing) — but it\'s slower, use only when needed.\n• Call model.module.state_dict() to save the underlying model, not the DDP wrapper.',
    },
    {
      heading: 'Gradient accumulation optimization',
      body:
        'When accumulating over K micro-batches, use model.no_sync() for the first K-1 so DDP skips the all-reduce; only the final backward triggers one. Saves K-1 comm rounds per step.',
      code: 'for i, batch in enumerate(micro_batches):\n    ctx = model.no_sync() if i < K-1 else nullcontext()\n    with ctx:\n        loss = model(batch).mean() / K\n        loss.backward()\nopt.step(); opt.zero_grad()',
    },
  ]
}

// ── FSDP ─────────────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.FullyShardedDataParallel = () => [
  {
    heading: 'FSDP — sharding, not replication',
    body:
      'Each rank stores only 1/N of every parameter, gradient, and optimizer state. DDP replicates everything (memory ≈ O(params)); FSDP splits everything (memory ≈ O(params / N)). That is how you fit 70B-parameter models on 8-GPU nodes.',
  },
  {
    heading: 'All-gather on demand',
    body:
      'Just BEFORE a wrapped submodule\'s forward (and backward) runs, FSDP all-gathers the full parameters into the active GPU, executes the op, then immediately reshards them away. Peak memory is ONE unit, not the whole model.',
  },
  {
    heading: 'reduce-scatter for gradients',
    body:
      'Where DDP does all-reduce (everyone gets full averaged grads), FSDP fuses average + shard into reduce-scatter in one collective. Gradients land already-sharded on the owning rank — zero wasted bandwidth.',
  },
  {
    heading: 'The stack that unlocks 70B training',
    body:
      'FSDP + bf16 autocast + gradient checkpointing + CPU offload (optional). Each component composes cleanly with FSDP. The transformer_auto_wrap_policy is the right default for LLMs; wrap each transformer block as its own shard unit.',
  },
]

// ── profiler ──────────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.profile = ({ line }) => {
  if (!/profiler|ProfilerActivity|schedule/i.test(line)) return []
  return [
    {
      heading: 'torch.profiler.profile — the modern profiler',
      body:
        'Context manager that records every op + kernel + memory event within its block. Unlike Python cProfile, it understands GPU timing (kernel start/end on each stream) and operator-level dispatch.',
    },
    {
      heading: 'The schedule pattern',
      body:
        'schedule(wait=1, warmup=1, active=3, repeat=1) = skip 1 step, warm up 1 step, record 3 steps, then stop. Crucial — the first few iterations are dominated by cuDNN heuristics, allocator warm-up, and lazy init; including them skews everything.',
    },
    {
      heading: 'How to read the output',
      body:
        '• tensorboard_trace_handler writes trace.json → view in the TensorBoard profiler plugin (the only sane UI).\n• prof.key_averages().table(sort_by="cuda_time_total") prints a hot-list.\n• Common findings: data-loader starvation (GPU idle between steps), unfused tiny kernels, surprise .item()/.cpu() syncs, unnecessary host-device copies.',
    },
  ]
}

// ── distributions / reparameterisation ───────────────────────────────────
ULTRA_EXPLAINERS.rsample = ({ line }) => {
  const recv = receiverFor('rsample', line) ?? 'q'
  return [
    {
      heading: `${recv}.rsample() — the reparameterisation trick`,
      body:
        `Draws a sample z from ${recv} such that ∂z/∂(parameters of ${recv}) exists and autograd can propagate through it. For a Normal(μ, σ), rsample() internally computes z = μ + σ·ε with ε ~ N(0, 1) — ε is random, μ and σ are the learnable path.`,
    },
    {
      heading: 'rsample vs sample',
      body:
        '• sample() — just a random draw. Gradients do NOT flow. Fine for Monte-Carlo estimates where you don\'t backprop through the sample.\n• rsample() — reparameterised. Gradients DO flow. Required when the sample feeds back into something you differentiate (VAE decoder, soft policies).',
    },
    {
      heading: 'Which distributions support it',
      body:
        'Normal, MultivariateNormal, LogNormal, Gumbel, Laplace, Uniform, Exponential, StudentT, RelaxedOneHotCategorical, … Discrete distributions (Categorical, Bernoulli) do NOT — use Gumbel-Softmax for a continuous relaxation.',
      code: `from torch.distributions import Normal\nq = Normal(mu, std)\nz = q.rsample()            # differentiable sample\nkl = torch.distributions.kl_divergence(q, Normal(0, 1)).sum()`,
    },
  ]
}

// ── torch.func / vmap ────────────────────────────────────────────────────
ULTRA_EXPLAINERS.vmap = ({ line }) => {
  const inDimsMatch = /in_dims\s*=\s*([^,)]+)/.exec(line)
  return [
    {
      heading: 'torch.func.vmap — automatic batching',
      body:
        'Wraps a function written for a SINGLE sample and returns one that accepts a batch, running the single-sample code once conceptually per element (but vectorised under the hood). No manual broadcasting, no explicit loops.',
    },
    {
      heading: 'in_dims',
      body: inDimsMatch
        ? `in_dims=${inDimsMatch[1]} tells vmap which axis of each argument to batch over. None means "share this arg across the batch" (common for model parameters); 0 means "the leading dim is the batch".`
        : 'in_dims controls per-argument batching. None = share across batch (e.g. parameters), int = batch along that axis. Tuple of values when you have multiple args.',
    },
    {
      heading: 'Killer feature: per-sample gradients',
      body:
        'vmap(grad(loss_fn))(params, x, y) — ONE LINE computes the gradient of the loss w.r.t. parameters FOR EACH sample independently. The old way required per-sample forward+backward loops and was painfully slow. Now it\'s native.',
      code: `from torch.func import vmap, grad\nper_sample_grad = vmap(grad(loss_fn),\n                       in_dims=(None, 0, 0))(params, x, y)`,
    },
  ]
}

ULTRA_EXPLAINERS.functional_call = () => [
  {
    heading: 'functional_call(module, params, args)',
    body:
      'Runs `module` as if it were a pure function of an explicit `params` dict — no hidden state, no reliance on self.*. Lets you treat a stateful nn.Module like a function for composability with torch.func transforms.',
  },
  {
    heading: 'Why it unlocks torch.func',
    body:
      'vmap/grad/jacrev assume pure functions. A normal model call `model(x)` hides the parameters as attributes on model. functional_call exposes them as an argument — now you can grad with respect to them, vmap over a batch of parameter sets (ensembles!), etc.',
    code: 'params = dict(model.named_parameters())\ndef f(params, x):\n    return functional_call(model, params, (x,))\n\ngrads = grad(lambda p, x: f(p, x).sum())(params, x)',
  },
]

// ── weight init ──────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.kaiming_normal_ = ({ line }) => {
  const modeMatch = /mode\s*=\s*["']([^"']+)["']/.exec(line)
  const nonlinMatch = /nonlinearity\s*=\s*["']([^"']+)["']/.exec(line)
  return [
    {
      heading: 'nn.init.kaiming_normal_(tensor, ...)',
      body:
        'In-place fill (note the trailing underscore) with samples from N(0, std²) where std = gain / √fan. The gain depends on the activation you\'re going to apply next — for ReLU it is √2, which is the whole point.',
    },
    {
      heading: 'Why ReLU needs √2',
      body:
        'ReLU kills half its input (everything below 0). To keep activation variance constant layer-to-layer you need to double the weight variance → multiply std by √2. That is Kaiming/He initialisation.',
    },
    {
      heading: 'Arguments in context',
      body:
        `• mode="${modeMatch?.[1] ?? 'fan_in'}" — fan_in preserves FORWARD variance; fan_out preserves BACKWARD variance. fan_in is the standard default.\n• nonlinearity="${nonlinMatch?.[1] ?? 'relu'}" — picks the right gain (relu: √2, leaky_relu: depends on slope, linear: 1).`,
    },
    {
      heading: 'Where to call it',
      body:
        'Apply inside the Module\'s __init__ — after the layers exist but before training starts. A common pattern is self.apply(self._init_weights) as the last line of __init__.',
      code: '@staticmethod\ndef _init_weights(m):\n    if isinstance(m, nn.Linear):\n        nn.init.kaiming_normal_(m.weight, nonlinearity="relu")\n        nn.init.zeros_(m.bias)',
    },
  ]
}

ULTRA_EXPLAINERS.xavier_uniform_ = () => [
  {
    heading: 'nn.init.xavier_uniform_(tensor)',
    body:
      'In-place fill with U(−a, a) where a = gain · √(6/(fan_in + fan_out)). Designed to keep forward AND backward variance balanced for SYMMETRIC activations (tanh, sigmoid, linear).',
  },
  {
    heading: 'When to use Xavier vs Kaiming',
    body:
      '• tanh / sigmoid / linear outputs → Xavier (Glorot).\n• ReLU / GELU / LeakyReLU → Kaiming (He).\nGetting this wrong silently shrinks or explodes activations across depth.',
  },
]

ULTRA_EXPLAINERS.apply = ({ line }) => {
  const recv = receiverFor('apply', line) ?? 'self'
  return [
    {
      heading: `${recv}.apply(fn) — recursive init pattern`,
      body:
        `Calls fn(m) on EVERY submodule in the tree, including ${recv} itself. The canonical use is weight initialisation: write one fn that checks isinstance(m, nn.Linear) etc. and applies the right init_*, then do ${recv}.apply(fn) once.`,
    },
    {
      heading: 'Typical skeleton',
      code: `def _init(m):\n    if isinstance(m, nn.Linear):\n        nn.init.kaiming_normal_(m.weight, nonlinearity="relu")\n        nn.init.zeros_(m.bias)\n    elif isinstance(m, (nn.BatchNorm1d, nn.LayerNorm)):\n        nn.init.ones_(m.weight)\n        nn.init.zeros_(m.bias)\n\n${recv}.apply(_init)`,
      body:
        'Order matters: put more specific isinstance checks first. For deep residual nets, zero-init the last linear/conv inside each block (a common trick that makes very deep nets trainable out of the gate).',
    },
  ]
}

// ── quantisation ─────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.quantize_dynamic = () => [
  {
    heading: 'torch.ao.quantization.quantize_dynamic',
    body:
      'The simplest quantisation path. Converts WEIGHTS of Linear/LSTM/Embedding modules to int8 ahead of time. ACTIVATIONS are quantised on-the-fly per inference call (hence "dynamic"). Zero calibration data, zero retraining, one function call.',
  },
  {
    heading: 'Where it shines',
    body:
      'Transformers and RNNs on CPU — the bulk of their cost is giant Linear matmuls, and int8 matmul on fbgemm/qnnpack is 2–4× faster. Conv-heavy vision models see smaller wins; for those, prefer static (post-training) quantisation with per-channel weights.',
    code: 'import torch.ao.quantization as tq\nint8_model = tq.quantize_dynamic(\n    float_model, {torch.nn.Linear}, dtype=torch.qint8\n)',
  },
  {
    heading: 'Accuracy',
    body:
      'Typical drop is <0.5% for text / speech models, slightly worse on very small models where every bit matters. If you need more accuracy recovery, step up to post-training static → QAT.',
  },
]

ULTRA_EXPLAINERS.prepare = ({ line }) => {
  if (!/quantization|qconfig|tq\./i.test(line)) return []
  return [
    {
      heading: 'tq.prepare(model) — install observers',
      body:
        'Walks the model and inserts per-module Observer modules that record min/max (or histogram) of activations as they flow through. The model now BEHAVES identically in float but is COLLECTING calibration stats.',
    },
    {
      heading: 'Calibrate → convert',
      body:
        'After prepare, run a few hundred representative inputs through the model (in eval mode, no grad). Observers accumulate ranges; then tq.convert(model) uses those ranges to swap floats for int8 modules.',
      code: 'model.qconfig = tq.get_default_qconfig("fbgemm")\ntq.prepare(model, inplace=True)\nfor x in calibration_batches:\n    model(x)\nint8_model = tq.convert(model, inplace=False)',
    },
  ]
}

ULTRA_EXPLAINERS.convert = ({ line }) => {
  if (!/quantization|tq\./i.test(line)) return []
  return [
    {
      heading: 'tq.convert(model) — bake the ints',
      body:
        'Swaps each observed float submodule for its quantised equivalent (Linear → quantized.Linear, ReLU → quantized.ReLU, etc.). After this call the model is frozen int8 and can be saved / run on CPU inference backends.',
    },
    {
      heading: 'Backend note',
      body:
        'Pick a backend matching the target hardware BEFORE prepare/convert: "fbgemm" for x86 servers, "qnnpack" for ARM / mobile. Converting with the wrong backend means ops without matching kernels → runtime error.',
    },
  ]
}

// ── pruning ──────────────────────────────────────────────────────────────
ULTRA_EXPLAINERS.global_unstructured = () => [
  {
    heading: 'prune.global_unstructured — one budget across all layers',
    body:
      'Pools the listed parameter tensors together, ranks every weight by magnitude, and zeros out the bottom `amount` fraction. The sparsity is GLOBAL — some layers may lose 80% of their weights, others 10%, depending on where the small weights live.',
  },
  {
    heading: 'Mask, not delete',
    body:
      'PyTorch attaches a BUFFER mask to each param and a forward-pre-hook that multiplies the original weight by the mask. The pre-mask weight is preserved → you can fine-tune after pruning and the "pruned" positions stay zero through the mask (they won\'t come back).',
    code: 'params = [(model.fc1, "weight"), (model.fc2, "weight")]\nprune.global_unstructured(\n    params, pruning_method=prune.L1Unstructured, amount=0.4,\n)\n# sparsity inspection\nfor mod, name in params:\n    w = getattr(mod, name)\n    print(float((w == 0).sum()) / w.numel())',
  },
  {
    heading: 'Make it permanent',
    body:
      'Once you\'re done iterating (prune a bit → fine-tune → repeat), call prune.remove(mod, name). That bakes the mask into the weight and drops the reparametrisation. Now the model is a plain nn.Module with many zeros.',
  },
]

ULTRA_EXPLAINERS.l1_unstructured = () => [
  {
    heading: 'prune.l1_unstructured(module, name, amount)',
    body:
      'Zeros the `amount` fraction of a SINGLE parameter tensor by L1 magnitude. The baseline pruning primitive — simple, surprisingly competitive, especially iterative (prune 10% → fine-tune → prune another 10% → fine-tune).',
  },
  {
    heading: 'When it isn\'t enough',
    body:
      'Unstructured masks are great for SHRINKING the model on disk but rarely speed up inference on dense GPUs — there\'s no sparse matmul for random patterns. For real speedup use ln_structured (channel/head pruning) or pair with sparse kernels (torch.sparse) on backends that exploit them.',
  },
]

// ── torch._dynamo / explain ─────────────────────────────────────────────
ULTRA_EXPLAINERS.explain = ({ line }) => {
  if (!/dynamo|_dynamo/.test(line)) return []
  return [
    {
      heading: 'torch._dynamo.explain(model)(input)',
      body:
        'Runs Dynamo once and reports every graph break, its line of code, and its cause. The single most useful debug tool when torch.compile is unexpectedly slow — a graph-heavy model with many breaks ends up running mostly in eager mode.',
    },
    {
      heading: 'How to act on it',
      body:
        'Common graph-break fixes: move .item() / .cpu() OUT of the hot path, replace data-dependent ifs with torch.where, avoid third-party C extensions inside forward, refactor Python control flow so shapes are static.',
    },
  ]
}

// ────────────────────────────────────────────────────────────────────────
// Public lookup
// ────────────────────────────────────────────────────────────────────────

export function getUltraSections(keyword: string, ctx: UltraContext): UltraSection[] | null {
  const fn = ULTRA_EXPLAINERS[keyword]
  return fn ? fn(ctx) : null
}
