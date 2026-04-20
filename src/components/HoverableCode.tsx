/**
 * HoverableCode
 * ─────────────
 * Renders a Python / PyTorch code block and wraps any known keyword or symbol
 * with a shadcn Tooltip that floats a "cloud" explanation on hover.
 *
 * Goal: make every API in a snippet feel learnable in place.
 *
 * Usage:
 *   <HoverableCode code={codeString} />
 *
 * Dictionary is intentionally conservative — we only decorate tokens that map
 * to well-known PyTorch building blocks so plain identifiers / variables stay
 * quiet. The dictionary is exported so new topics can extend it.
 */

import React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { getUltraSections, type UltraSection } from '@/lib/ultraExplainers'

export interface KeywordExplanation {
  label: string
  detail: string
  category: 'core' | 'nn' | 'autograd' | 'optim' | 'data' | 'device' | 'op' | 'training'
}

// keys are matched as whole tokens (optionally prefixed by "torch." or "nn." in the source)
export const PYTORCH_KEYWORDS: Record<string, KeywordExplanation> = {
  // ── core tensor ──
  'torch': { label: 'torch', detail: 'The top-level PyTorch package. Gives you tensors, math ops, autograd, and submodules like nn / optim / utils.data.', category: 'core' },
  'Tensor': { label: 'torch.Tensor', detail: 'The n-dimensional array that powers PyTorch. Like a NumPy array but can live on GPU and track gradients.', category: 'core' },
  'tensor': { label: 'torch.tensor(data)', detail: 'Create a new tensor from Python / NumPy data. Infers dtype unless you pass dtype=...', category: 'core' },
  'zeros': { label: 'torch.zeros(shape)', detail: 'Tensor of zeros with the given shape. Useful for initialising buffers.', category: 'core' },
  'ones': { label: 'torch.ones(shape)', detail: 'Tensor filled with 1.0. Common for bias init or masks.', category: 'core' },
  'randn': { label: 'torch.randn(shape)', detail: 'Tensor sampled from a standard normal N(0,1). Default weight-init for many layers.', category: 'core' },
  'rand': { label: 'torch.rand(shape)', detail: 'Tensor sampled uniformly from [0,1).', category: 'core' },
  'randint': { label: 'torch.randint(lo,hi,size)', detail: 'Integer tensor uniformly sampled in [lo, hi). Great for fake class labels.', category: 'core' },
  'arange': { label: 'torch.arange(start,end,step)', detail: 'Like Python range, but returns a 1-D tensor.', category: 'core' },
  'linspace': { label: 'torch.linspace(a,b,n)', detail: 'n evenly-spaced points from a to b (inclusive).', category: 'core' },
  'cat': { label: 'torch.cat(tensors, dim)', detail: 'Concatenate tensors along an existing dimension.', category: 'op' },
  'stack': { label: 'torch.stack(tensors, dim)', detail: 'Stack tensors along a NEW dimension.', category: 'op' },
  'matmul': { label: 'torch.matmul(a,b)', detail: 'Batched matrix multiply. Also written as a @ b.', category: 'op' },
  'mm': { label: 'torch.mm(a,b)', detail: '2-D matrix multiply — no broadcasting.', category: 'op' },
  'softmax': { label: 'torch.softmax(x, dim)', detail: 'Turns raw scores into a probability distribution summing to 1 along dim.', category: 'op' },
  'sigmoid': { label: 'sigmoid(x)', detail: '1 / (1 + e^-x). Squashes reals into (0,1) — classic binary classifier output.', category: 'op' },
  'tanh': { label: 'tanh(x)', detail: 'Hyperbolic tangent. Squashes into (-1,1), zero-centred — often better than sigmoid for hidden layers.', category: 'op' },
  'relu': { label: 'relu(x) = max(0,x)', detail: 'The default hidden-layer activation. Cheap, non-saturating on the positive side.', category: 'op' },

  // ── views / reshape ──
  'view': { label: '.view(*shape)', detail: 'Return a tensor with the same data but a new shape (must be contiguous in memory).', category: 'op' },
  'reshape': { label: '.reshape(*shape)', detail: 'Like view(), but may copy data if the original is non-contiguous.', category: 'op' },
  'unsqueeze': { label: '.unsqueeze(dim)', detail: 'Insert a size-1 dimension at dim. Handy for adding a batch axis.', category: 'op' },
  'squeeze': { label: '.squeeze(dim?)', detail: 'Remove size-1 dimensions. Inverse of unsqueeze.', category: 'op' },
  'permute': { label: '.permute(*dims)', detail: 'Reorder tensor dimensions. e.g. (N,H,W,C) → (N,C,H,W).', category: 'op' },
  'transpose': { label: '.transpose(a,b)', detail: 'Swap two dimensions.', category: 'op' },
  'flatten': { label: '.flatten(start_dim)', detail: 'Collapse dims from start_dim onward into one. Often used before a Linear layer.', category: 'op' },

  // ── autograd ──
  'requires_grad': { label: 'requires_grad=True', detail: "Tells autograd to record every op on this tensor so we can compute dL/dparam with .backward().", category: 'autograd' },
  'requires_grad_': { label: '.requires_grad_(True)', detail: 'In-place version — flip gradient tracking on an existing tensor.', category: 'autograd' },
  'backward': { label: '.backward()', detail: 'Reverse-mode autodiff: walks the computation graph and fills .grad on every leaf with requires_grad=True.', category: 'autograd' },
  'grad': { label: '.grad', detail: 'The accumulated gradient tensor for this parameter. Remember to zero it out each step.', category: 'autograd' },
  'detach': { label: '.detach()', detail: 'Return the same tensor but cut off from the autograd graph — useful when you want a value, not a gradient path.', category: 'autograd' },
  'no_grad': { label: 'torch.no_grad()', detail: 'Context manager that disables gradient tracking. Wrap eval / inference code with this to save memory.', category: 'autograd' },

  // ── nn ──
  'nn': { label: 'torch.nn', detail: 'Neural-network building blocks: layers, losses, containers, init helpers.', category: 'nn' },
  'Module': { label: 'nn.Module', detail: 'Base class for every model / layer. Give it a forward() method and it handles parameters, device moves, and state dicts for you.', category: 'nn' },
  'Sequential': { label: 'nn.Sequential', detail: 'A container that chains modules: output of one becomes input of the next. Great for feed-forward stacks.', category: 'nn' },
  'Linear': { label: 'nn.Linear(in, out)', detail: 'Fully-connected layer: y = x · Wᵀ + b. The workhorse of MLPs and Transformer FFNs.', category: 'nn' },
  'Conv2d': { label: 'nn.Conv2d', detail: '2-D convolution. Slides a learnable kernel over an image to detect local patterns (edges → shapes → objects).', category: 'nn' },
  'Conv1d': { label: 'nn.Conv1d', detail: '1-D convolution — good for sequences / audio / time series.', category: 'nn' },
  'ConvTranspose2d': { label: 'nn.ConvTranspose2d', detail: '"Deconvolution" / upsampling conv. Used in decoders, GANs, segmentation heads.', category: 'nn' },
  'BatchNorm1d': { label: 'nn.BatchNorm1d', detail: 'Normalises each feature across the mini-batch — speeds up training and adds a mild regulariser.', category: 'nn' },
  'BatchNorm2d': { label: 'nn.BatchNorm2d', detail: 'Same idea as BatchNorm1d but for (N,C,H,W) feature maps.', category: 'nn' },
  'LayerNorm': { label: 'nn.LayerNorm', detail: 'Normalises across features of each single example — preferred in Transformers.', category: 'nn' },
  'Dropout': { label: 'nn.Dropout(p)', detail: 'Randomly zeroes activations during training with probability p. Prevents co-adaptation / overfitting.', category: 'nn' },
  'Embedding': { label: 'nn.Embedding(N, d)', detail: 'Lookup table of size N×d. Maps token IDs → dense vectors. The input layer of every language model.', category: 'nn' },
  'ReLU': { label: 'nn.ReLU()', detail: 'Activation module — same math as F.relu but usable inside Sequential.', category: 'nn' },
  'LeakyReLU': { label: 'nn.LeakyReLU', detail: 'ReLU with a small negative slope. Avoids "dying ReLU" neurons.', category: 'nn' },
  'GELU': { label: 'nn.GELU', detail: 'Smooth ReLU-like activation used in BERT / GPT.', category: 'nn' },
  'Tanh': { label: 'nn.Tanh', detail: 'Module form of tanh.', category: 'nn' },
  'Sigmoid': { label: 'nn.Sigmoid', detail: 'Module form of sigmoid.', category: 'nn' },
  'Softmax': { label: 'nn.Softmax(dim)', detail: 'Module form of softmax.', category: 'nn' },
  'Flatten': { label: 'nn.Flatten', detail: 'Flattens feature-map dims into a single vector. Bridge between Conv stack and Linear classifier.', category: 'nn' },
  'MaxPool2d': { label: 'nn.MaxPool2d(k)', detail: 'Keeps the strongest activation in each k×k window — downsamples while preserving salient features.', category: 'nn' },
  'AvgPool2d': { label: 'nn.AvgPool2d(k)', detail: 'Average-pooled downsampling.', category: 'nn' },
  'AdaptiveAvgPool2d': { label: 'nn.AdaptiveAvgPool2d(out)', detail: 'Pools any feature-map to a fixed spatial size. Standard before the final classifier.', category: 'nn' },
  'MSELoss': { label: 'nn.MSELoss', detail: 'Mean-squared error. The go-to regression loss.', category: 'nn' },
  'CrossEntropyLoss': { label: 'nn.CrossEntropyLoss', detail: 'Combines log-softmax + NLL in one numerically stable loss. Feed RAW logits (not softmax).', category: 'nn' },
  'BCELoss': { label: 'nn.BCELoss', detail: 'Binary cross-entropy. Expects probabilities already in [0,1].', category: 'nn' },
  'BCEWithLogitsLoss': { label: 'nn.BCEWithLogitsLoss', detail: 'Binary cross-entropy fused with a sigmoid — feed raw logits, more stable than BCE after Sigmoid.', category: 'nn' },
  'Parameter': { label: 'nn.Parameter', detail: 'A tensor that auto-registers as a learnable parameter of its owning Module.', category: 'nn' },
  'forward': { label: '.forward(x)', detail: 'Method you override on nn.Module to define the model\'s computation. Call the module directly (`model(x)`) instead of forward()—that way hooks fire.', category: 'nn' },
  'parameters': { label: '.parameters()', detail: 'Returns an iterable of every learnable tensor in the module. Pass this to the optimizer.', category: 'nn' },
  'state_dict': { label: '.state_dict()', detail: 'Python dict of all parameters and buffers. Use with torch.save to checkpoint.', category: 'nn' },
  'load_state_dict': { label: '.load_state_dict', detail: 'Loads saved weights back into the module. Shapes must match.', category: 'nn' },
  'train': { label: '.train()', detail: 'Puts the module in training mode — enables Dropout, tracks BatchNorm running stats.', category: 'nn' },
  'eval': { label: '.eval()', detail: 'Puts the module in inference mode — disables Dropout, uses frozen BN stats.', category: 'nn' },

  // ── functional ──
  'F': { label: 'torch.nn.functional (F)', detail: 'Functional (stateless) versions of layers / losses. Import convention: `import torch.nn.functional as F`.', category: 'nn' },
  'mse_loss': { label: 'F.mse_loss', detail: 'Functional mean-squared error. Same as nn.MSELoss()(p,t).', category: 'nn' },
  'cross_entropy': { label: 'F.cross_entropy', detail: 'Functional version of CrossEntropyLoss. Feed raw logits + integer labels.', category: 'nn' },
  'binary_cross_entropy_with_logits': { label: 'F.binary_cross_entropy_with_logits', detail: 'Fused sigmoid + BCE — numerically stable.', category: 'nn' },
  'log_softmax': { label: 'F.log_softmax', detail: 'log(softmax(x)) computed in one stable pass.', category: 'op' },

  // ── optim ──
  'optim': { label: 'torch.optim', detail: 'Gradient-based optimizers. Built on top of the gradients that .backward() computes.', category: 'optim' },
  'SGD': { label: 'optim.SGD', detail: 'Stochastic gradient descent (with optional momentum). The simplest optimizer, still competitive with good LR schedules.', category: 'optim' },
  'Adam': { label: 'optim.Adam', detail: 'Adaptive per-parameter learning rates via running estimates of the 1st and 2nd moments of the gradient.', category: 'optim' },
  'AdamW': { label: 'optim.AdamW', detail: 'Adam with DECOUPLED weight decay — the default for modern Transformers.', category: 'optim' },
  'RMSprop': { label: 'optim.RMSprop', detail: 'Adaptive LR based on a running average of squared gradients.', category: 'optim' },
  'step': { label: 'optimizer.step()', detail: 'Apply the accumulated gradients: param ← param − lr · grad.', category: 'optim' },
  'zero_grad': { label: '.zero_grad()', detail: 'Clear .grad on every parameter BEFORE the next .backward()—gradients accumulate by default.', category: 'optim' },

  // ── data ──
  'Dataset': { label: 'torch.utils.data.Dataset', detail: 'Abstract class — override __len__ and __getitem__ to supply training examples.', category: 'data' },
  'TensorDataset': { label: 'TensorDataset(*tensors)', detail: 'Quick Dataset that yields tuples sliced from parallel tensors — e.g. (X,y).', category: 'data' },
  'DataLoader': { label: 'DataLoader(ds, batch_size, shuffle)', detail: 'Wraps a Dataset and iterates mini-batches. Handles shuffling, batching, optional multi-process loading.', category: 'data' },

  // ── device ──
  'device': { label: 'torch.device', detail: 'Handle to cpu / cuda / mps. Pass to .to(device) to move tensors and modules.', category: 'device' },
  'cuda': { label: 'torch.cuda', detail: 'Submodule with GPU helpers: is_available(), device_count(), synchronize(), memory_allocated()...', category: 'device' },
  'is_available': { label: 'cuda.is_available()', detail: 'Returns True if a CUDA GPU is visible. Always check before sending tensors to cuda.', category: 'device' },
  'to': { label: '.to(device / dtype)', detail: 'Move / cast a tensor or module. Returns a new tensor but moves modules in-place.', category: 'device' },

  // ── training helpers ──
  'manual_seed': { label: 'torch.manual_seed(s)', detail: 'Seed the RNG for reproducibility. Seed NumPy / Python / CUDA separately too.', category: 'training' },
  'save': { label: 'torch.save(obj, path)', detail: 'Pickle a state_dict or tensor to disk.', category: 'training' },
  'load': { label: 'torch.load(path)', detail: 'Load a pickled checkpoint.', category: 'training' },
  'item': { label: '.item()', detail: 'Extract a Python scalar from a 0-D tensor. Use for logging loss values.', category: 'core' },
  'numpy': { label: '.numpy()', detail: 'Share underlying memory as a NumPy array (CPU tensors only, no autograd).', category: 'core' },

  // ── mixed precision (torch.cuda.amp / torch.amp) ──
  'amp': { label: 'torch.amp', detail: 'Automatic mixed precision — runs ops in float16 / bfloat16 where safe for big speedups on modern GPUs.', category: 'optim' },
  'GradScaler': { label: 'GradScaler()', detail: 'Scales the loss before backward() to keep tiny fp16 gradients from underflowing. Pair with autocast().', category: 'optim' },
  'autocast': { label: 'torch.autocast()', detail: 'Context manager that automatically casts eligible ops to a lower-precision dtype during the forward pass.', category: 'optim' },

  // ── LR schedulers ──
  'lr_scheduler': { label: 'torch.optim.lr_scheduler', detail: 'Submodule of schedulers that adjust the learning rate over time. Call .step() each epoch (or iteration) after optimizer.step().', category: 'optim' },
  'CosineAnnealingLR': { label: 'CosineAnnealingLR(opt, T_max)', detail: 'Smoothly decays LR from the initial value down to ~0 following half a cosine wave over T_max steps.', category: 'optim' },
  'StepLR': { label: 'StepLR(opt, step_size, gamma)', detail: 'Multiplies the LR by gamma every step_size epochs. Classic staircase schedule.', category: 'optim' },
  'MultiStepLR': { label: 'MultiStepLR(opt, milestones, gamma)', detail: 'Multiplies LR by gamma at the listed epoch milestones.', category: 'optim' },
  'ReduceLROnPlateau': { label: 'ReduceLROnPlateau(opt)', detail: 'Drops LR when a monitored metric (usually val loss) stops improving. Call scheduler.step(metric) each epoch.', category: 'optim' },
  'OneCycleLR': { label: 'OneCycleLR(opt, max_lr)', detail: 'Warms up then cools down in one cycle. Popular fast-training schedule (super-convergence).', category: 'optim' },
  'LinearLR': { label: 'LinearLR(opt, start_factor, total_iters)', detail: 'Linearly scales LR from start_factor · base_lr to base_lr over total_iters. Often used as a warmup.', category: 'optim' },

  // ── clipping / utilities ──
  'clip_grad_norm_': { label: 'nn.utils.clip_grad_norm_', detail: 'Rescales gradients so their total L2 norm is at most max_norm. Prevents exploding gradients in RNNs / Transformers.', category: 'optim' },

  // ── Convention names people use in training loops ──
  'model':         { label: 'model',         detail: 'Convention: the nn.Module you are training. Call model(x) for forward, model.parameters() for the optimizer, model.train()/eval() to switch modes.', category: 'nn' },
  'epochs':        { label: 'epochs',        detail: 'Convention: number of FULL passes over the training set. More epochs = more training, but also more risk of overfitting.', category: 'training' },
  'lr':            { label: 'lr',            detail: 'Convention: learning rate — the step size optimizer takes along the gradient each update. The single most important hyperparameter.', category: 'optim' },
  'weight_decay':  { label: 'weight_decay',  detail: 'Convention: L2 regularisation strength passed to the optimizer. Pulls weights toward zero each step, fighting overfitting.', category: 'optim' },
  'loss_fn':       { label: 'loss_fn',       detail: 'Convention: the loss function / criterion that turns (predictions, targets) into a scalar loss. e.g. nn.CrossEntropyLoss().', category: 'nn' },
  'criterion':     { label: 'criterion',     detail: 'Convention: same thing as loss_fn — the callable that computes the training loss.', category: 'nn' },
  'opt':           { label: 'opt',           detail: 'Convention: shorthand for optimizer — the object that updates parameters using gradients.', category: 'optim' },
  'optimizer':     { label: 'optimizer',     detail: 'Convention: the torch.optim.* instance that applies gradient updates. Call .zero_grad(), .step() each iteration.', category: 'optim' },
  'sched':         { label: 'sched',         detail: 'Convention: shorthand for scheduler — adjusts the learning rate over time.', category: 'optim' },
  'scheduler':     { label: 'scheduler',     detail: 'Convention: torch.optim.lr_scheduler.* instance. Call .step() each epoch (or iteration) AFTER optimizer.step().', category: 'optim' },
  'scaler':        { label: 'scaler',        detail: 'Convention: a GradScaler used for mixed-precision training — scale the loss, backward, unscale, step.', category: 'optim' },
  'ckpt_path':     { label: 'ckpt_path',     detail: 'Convention: filesystem path where you save / load the best checkpoint (a state_dict).', category: 'training' },
  'checkpoint':    { label: 'checkpoint',    detail: 'Convention: the dict you save containing model.state_dict(), optimizer.state_dict(), epoch, metrics, …', category: 'training' },
  'batch_size':    { label: 'batch_size',    detail: 'Convention: number of samples per training step. Bigger = smoother gradients but more memory.', category: 'data' },
  'train_loader':  { label: 'train_loader',  detail: 'Convention: DataLoader over the training set (shuffle=True).', category: 'data' },
  'val_loader':    { label: 'val_loader',    detail: 'Convention: DataLoader over the validation set (shuffle=False, used for early stopping / best-checkpoint selection).', category: 'data' },
  'test_loader':   { label: 'test_loader',   detail: 'Convention: DataLoader over the held-out test set — never touched during hyperparameter tuning.', category: 'data' },
  'inputs':        { label: 'inputs',        detail: 'Convention: the batch of input features coming out of a DataLoader.', category: 'data' },
  'labels':        { label: 'labels',        detail: 'Convention: the ground-truth targets for the current batch.', category: 'data' },
  'targets':       { label: 'targets',       detail: 'Convention: synonym for labels — the ground-truth values the model tries to predict.', category: 'data' },
  'logits':        { label: 'logits',        detail: 'Convention: raw pre-softmax scores returned by a classifier. Feed these directly to CrossEntropyLoss — NOT softmaxed.', category: 'nn' },
  'preds':         { label: 'preds',         detail: 'Convention: the model\'s predictions, usually logits.argmax(dim=-1) for classification.', category: 'nn' },
  'loss':          { label: 'loss',          detail: 'Convention: scalar tensor returned by the loss function. Call loss.backward() to compute gradients.', category: 'nn' },
  'fit':           { label: 'fit(...)',      detail: 'Convention (Keras-style): a function that encapsulates the full training loop — epochs, batches, validation, checkpointing.', category: 'training' },

  // ── tensor math & indexing ──
  'einsum':        { label: 'torch.einsum(eq, *operands)', detail: "Einstein-summation: one string describes every matmul / sum / transpose. e.g. 'bij,bjk->bik' = batched matmul.", category: 'op' },
  'gather':        { label: '.gather(dim, index)', detail: 'Pick values along dim using an index tensor of the same shape. Classic way to read Q-values per chosen action in RL.', category: 'op' },
  'scatter':       { label: '.scatter(dim, index, src)', detail: 'Inverse of gather — write values from src into positions given by index along dim. Used for one-hot and sparse updates.', category: 'op' },
  'scatter_':      { label: '.scatter_(dim, index, src)', detail: 'In-place scatter. Common for building masks / one-hot labels.', category: 'op' },
  'index_select':  { label: '.index_select(dim, index)', detail: 'Pick whole slices along dim at positions listed in index (1-D LongTensor).', category: 'op' },
  'masked_select': { label: '.masked_select(mask)', detail: 'Return a 1-D tensor of elements where mask is True. Flattens by design.', category: 'op' },
  'masked_fill':   { label: '.masked_fill(mask, value)', detail: 'Replace positions where mask is True with value. Core trick for causal / padding masks in Transformers (fill with -inf before softmax).', category: 'op' },
  'where':         { label: 'torch.where(cond, a, b)', detail: 'Element-wise ternary: pick from a where cond is True, else from b. Broadcasts like NumPy.', category: 'op' },
  'topk':          { label: '.topk(k, dim)', detail: 'Return (values, indices) of the k largest elements along dim. Used for beam search, top-k sampling, retrieval.', category: 'op' },
  'argmax':        { label: '.argmax(dim)', detail: 'Index of the maximum along dim. Converts classifier logits into predicted class ids.', category: 'op' },
  'argmin':        { label: '.argmin(dim)', detail: 'Index of the minimum along dim.', category: 'op' },
  'argsort':       { label: '.argsort(dim)', detail: 'Indices that would sort the tensor along dim.', category: 'op' },
  'sort':          { label: '.sort(dim)', detail: 'Returns (sorted_values, sorted_indices) along dim.', category: 'op' },
  'unique':        { label: 'torch.unique(x)', detail: 'Deduplicate; optional return_counts / return_inverse for label encoding and vocab building.', category: 'op' },
  'nonzero':       { label: '.nonzero()', detail: 'Returns indices (as_tuple=True recommended) of every nonzero element — handy for mask → coordinate conversion.', category: 'op' },
  'clamp':         { label: '.clamp(min, max)', detail: 'Element-wise clipping: values below min become min, above max become max. Stabilises gradients / logits.', category: 'op' },
  'clip':          { label: '.clip(min, max)', detail: 'Alias for clamp — NumPy-style name.', category: 'op' },
  'abs':           { label: '.abs()', detail: 'Element-wise absolute value.', category: 'op' },
  'exp':           { label: '.exp()', detail: 'Element-wise e^x. Watch for overflow — use log-space when possible.', category: 'op' },
  'log':           { label: '.log()', detail: 'Element-wise natural log. Use log1p for numerical stability near 0.', category: 'op' },
  'sqrt':          { label: '.sqrt()', detail: 'Element-wise square root.', category: 'op' },
  'pow':           { label: '.pow(n)', detail: 'Element-wise power. Equivalent to x ** n.', category: 'op' },
  'sign':          { label: '.sign()', detail: 'Element-wise sign: -1, 0, or 1.', category: 'op' },
  'clone':         { label: '.clone()', detail: 'Return an independent copy of the tensor (tracked by autograd unless you .detach() too).', category: 'op' },
  'contiguous':    { label: '.contiguous()', detail: 'Materialise a tensor whose memory layout matches its shape. Required before .view() if the tensor was permuted/transposed.', category: 'op' },
  'expand':        { label: '.expand(*shape)', detail: 'Broadcast a tensor to a bigger shape WITHOUT copying memory. Read-only views — use .clone() if you need to modify.', category: 'op' },
  'repeat':        { label: '.repeat(*reps)', detail: 'Tile the tensor by the given factors along each dim — actually copies data (unlike expand).', category: 'op' },
  'tile':          { label: 'torch.tile(x, dims)', detail: 'NumPy-style tiling — equivalent to .repeat() with matching semantics.', category: 'op' },
  'roll':          { label: 'torch.roll(x, shifts, dims)', detail: 'Cyclically shift elements along dims. Used in Swin Transformer window shifting.', category: 'op' },
  'chunk':         { label: '.chunk(n, dim)', detail: 'Split a tensor into n roughly-equal chunks along dim. Returns a tuple of views.', category: 'op' },
  'split':         { label: '.split(size, dim)', detail: 'Split along dim into chunks of given size(s).', category: 'op' },
  'narrow':        { label: '.narrow(dim, start, length)', detail: 'Return a view of length slices starting at start along dim — zero-copy slicing.', category: 'op' },
  'meshgrid':      { label: 'torch.meshgrid(*tensors)', detail: 'Coordinate grids from 1-D vectors. Use indexing="ij" to avoid the 2.0 warning.', category: 'op' },
  'bmm':           { label: 'torch.bmm(a, b)', detail: 'Batched 2-D matrix multiply — (B,M,K) @ (B,K,N) → (B,M,N). No broadcasting.', category: 'op' },
  'addmm':         { label: 'torch.addmm(bias, a, b)', detail: 'Fused bias + matmul: bias + a @ b. Faster than doing it separately.', category: 'op' },
  'outer':         { label: 'torch.outer(u, v)', detail: 'Outer product of two 1-D vectors — returns a rank-1 matrix.', category: 'op' },
  'dot':           { label: 'torch.dot(u, v)', detail: 'Dot product of two 1-D vectors — returns a scalar.', category: 'op' },
  'norm':          { label: '.norm(p, dim)', detail: 'Vector / matrix norm. p=2 is Euclidean, p=1 is Manhattan. Prefer torch.linalg.norm for new code.', category: 'op' },

  // ── dtypes & casting ──
  'dtype':         { label: 'tensor.dtype', detail: 'The element type (torch.float32, torch.int64, torch.bool, …). Mismatches cause silent promotion or errors.', category: 'core' },
  'float32':       { label: 'torch.float32', detail: '32-bit float — the default training dtype.', category: 'core' },
  'float16':       { label: 'torch.float16', detail: '16-bit half precision — pair with GradScaler for AMP on older GPUs.', category: 'core' },
  'bfloat16':      { label: 'torch.bfloat16', detail: '16-bit brain float — same exponent range as float32, fewer mantissa bits. Preferred AMP dtype on Ampere+ GPUs / TPUs.', category: 'core' },
  'int64':         { label: 'torch.int64', detail: '64-bit integer — the default for indices and class labels.', category: 'core' },
  'long':          { label: '.long()', detail: 'Cast to int64. Required dtype for indices fed to nn.Embedding / cross_entropy targets.', category: 'core' },
  'bool':          { label: '.bool()', detail: 'Cast to bool. Boolean tensors are used as masks (e.g. for masked_fill).', category: 'core' },

  // ── autograd extras ──
  'autograd':      { label: 'torch.autograd', detail: 'Automatic differentiation engine. Hosts Function (custom ops), grad(), gradcheck, and Variable (legacy).', category: 'autograd' },
  'Function':      { label: 'autograd.Function', detail: 'Base for custom ops with your own forward / backward. Use when you need a special gradient or to wrap non-PyTorch code.', category: 'autograd' },
  'inference_mode':{ label: 'torch.inference_mode()', detail: 'Like no_grad but stricter and faster — disables version counting. Use for pure inference; tensors created inside cannot later be used in autograd.', category: 'autograd' },
  'enable_grad':   { label: 'torch.enable_grad()', detail: 'Re-enable gradient tracking inside a no_grad / inference_mode region. Context manager.', category: 'autograd' },
  'set_grad_enabled': { label: 'torch.set_grad_enabled(bool)', detail: 'Flip gradient tracking on/off with a flag — handy when you share code between train and eval.', category: 'autograd' },
  'retain_graph':  { label: 'backward(retain_graph=True)', detail: 'Keep the graph alive after .backward() so you can call backward again (e.g. higher-order gradients, GANs).', category: 'autograd' },
  'create_graph':  { label: 'backward(create_graph=True)', detail: 'Build a graph over the backward pass itself — needed for double backprop / meta-learning.', category: 'autograd' },

  // ── nn — activations & misc layers ──
  'ELU':           { label: 'nn.ELU', detail: 'Exponential Linear Unit — smooth negative tail. Mean activations closer to zero than ReLU.', category: 'nn' },
  'SiLU':          { label: 'nn.SiLU', detail: 'x * sigmoid(x), aka Swish. Default activation in many modern vision / audio models.', category: 'nn' },
  'SELU':          { label: 'nn.SELU', detail: 'Self-normalising activation — keeps mean/var stable without BatchNorm if weights are lecun-init.', category: 'nn' },
  'Softplus':      { label: 'nn.Softplus', detail: 'Smooth approximation of ReLU: log(1 + e^x). Always differentiable, always positive.', category: 'nn' },
  'LogSoftmax':    { label: 'nn.LogSoftmax', detail: 'log(softmax(x)) in one numerically-stable step. Feed into NLLLoss.', category: 'nn' },
  'Softmin':       { label: 'nn.Softmin', detail: 'softmax applied to negated scores — smallest value gets the highest weight.', category: 'nn' },

  // ── nn — containers & generic ──
  'ModuleList':    { label: 'nn.ModuleList([...])', detail: 'Python list that properly registers child modules so parameters() can see them. Use instead of a plain list.', category: 'nn' },
  'ModuleDict':    { label: 'nn.ModuleDict({...})', detail: 'Dict variant of ModuleList — keys are layer names, values are modules.', category: 'nn' },
  'ParameterList': { label: 'nn.ParameterList', detail: 'Registers a list of Parameters so they appear in .parameters().', category: 'nn' },
  'ParameterDict': { label: 'nn.ParameterDict', detail: 'Dict variant of ParameterList.', category: 'nn' },
  'Identity':      { label: 'nn.Identity()', detail: 'Returns its input unchanged. Handy as a placeholder / residual skip / head-replacement for transfer learning.', category: 'nn' },

  // ── nn — convolutional extras ──
  'Upsample':      { label: 'nn.Upsample', detail: 'Non-learnable spatial upsample (nearest / bilinear). Cheap alternative to ConvTranspose2d.', category: 'nn' },
  'PixelShuffle':  { label: 'nn.PixelShuffle(r)', detail: 'Rearrange (N, C·r², H, W) → (N, C, H·r, W·r). Efficient, artifact-free upsampling used in super-resolution.', category: 'nn' },
  'GroupNorm':     { label: 'nn.GroupNorm(G, C)', detail: 'Normalise within G groups of channels per sample. Batch-size-agnostic — great when batches are tiny.', category: 'nn' },
  'InstanceNorm2d':{ label: 'nn.InstanceNorm2d', detail: 'Per-sample, per-channel normalisation. Default in style-transfer and some GANs.', category: 'nn' },

  // ── nn — recurrent ──
  'RNN':           { label: 'nn.RNN', detail: 'Elman RNN cell(s) stacked into a multi-layer, optionally bidirectional RNN. Input is (L, N, H) or (N, L, H) if batch_first=True.', category: 'nn' },
  'LSTM':          { label: 'nn.LSTM', detail: 'Long Short-Term Memory — gated RNN with cell state; handles long-range deps far better than vanilla RNN.', category: 'nn' },
  'GRU':           { label: 'nn.GRU', detail: 'Gated Recurrent Unit — LSTM-lite with two gates instead of three. Faster, fewer parameters, usually similar quality.', category: 'nn' },
  'LSTMCell':      { label: 'nn.LSTMCell', detail: 'Single LSTM step. Use when you want to unroll manually (e.g. scheduled sampling, teacher forcing variants).', category: 'nn' },
  'GRUCell':       { label: 'nn.GRUCell', detail: 'Single GRU step.', category: 'nn' },

  // ── nn — transformer family ──
  'Transformer':   { label: 'nn.Transformer', detail: 'Full encoder-decoder Transformer. Rarely used directly — most people build encoder-only (BERT) or decoder-only (GPT) with the layer classes.', category: 'nn' },
  'TransformerEncoder':      { label: 'nn.TransformerEncoder', detail: 'Stack of TransformerEncoderLayer. Pre-LN or Post-LN depending on the constructor flag.', category: 'nn' },
  'TransformerEncoderLayer': { label: 'nn.TransformerEncoderLayer', detail: 'Self-attention + FFN block with residuals and norms. The unit of BERT / ViT encoders.', category: 'nn' },
  'TransformerDecoder':      { label: 'nn.TransformerDecoder', detail: 'Stack of TransformerDecoderLayer with cross-attention. Used in seq2seq / translation.', category: 'nn' },
  'TransformerDecoderLayer': { label: 'nn.TransformerDecoderLayer', detail: 'Masked self-attn + cross-attn + FFN. The unit of a decoder-only or seq2seq model.', category: 'nn' },
  'MultiheadAttention':      { label: 'nn.MultiheadAttention', detail: 'h parallel attention heads sharing input / output projections. The core layer of every Transformer.', category: 'nn' },

  // ── nn — losses (extras) ──
  'L1Loss':        { label: 'nn.L1Loss', detail: 'Mean absolute error. Robust to outliers; less smooth gradient than MSE.', category: 'nn' },
  'SmoothL1Loss':  { label: 'nn.SmoothL1Loss', detail: 'Quadratic near 0, linear far away — best of both worlds. Used in Faster R-CNN bbox regression.', category: 'nn' },
  'HuberLoss':     { label: 'nn.HuberLoss', detail: 'Generalisation of SmoothL1Loss with a tunable delta threshold.', category: 'nn' },
  'NLLLoss':       { label: 'nn.NLLLoss', detail: 'Negative log-likelihood. Pair with LogSoftmax; CrossEntropyLoss = LogSoftmax + NLLLoss fused.', category: 'nn' },
  'KLDivLoss':     { label: 'nn.KLDivLoss', detail: 'Kullback–Leibler divergence between log-probabilities and target probabilities. Used in knowledge distillation.', category: 'nn' },
  'TripletMarginLoss': { label: 'nn.TripletMarginLoss', detail: 'Metric-learning loss: pull anchor to positive, push from negative by at least margin.', category: 'nn' },
  'CTCLoss':       { label: 'nn.CTCLoss', detail: 'Connectionist Temporal Classification — for speech / handwriting where the target alignment is unknown.', category: 'nn' },

  // ── nn.Module API ──
  'register_buffer':    { label: '.register_buffer(name, tensor)', detail: "Add a persistent, non-learnable tensor to the module. Moves with .to() and saves in state_dict — but no gradient.", category: 'nn' },
  'register_parameter': { label: '.register_parameter(name, param)', detail: 'Programmatically attach an nn.Parameter — rarely needed (just assign with self.name = nn.Parameter(...)).', category: 'nn' },
  'register_forward_hook':       { label: '.register_forward_hook(fn)', detail: 'Callback fn(module, inputs, output) runs after every forward. Great for extracting intermediate features / debugging.', category: 'nn' },
  'register_full_backward_hook': { label: '.register_full_backward_hook(fn)', detail: 'Callback fn(module, grad_input, grad_output) runs during backward. Inspect / clip / replace gradients.', category: 'nn' },
  'named_parameters':   { label: '.named_parameters()', detail: 'Iterator over (name, parameter) pairs. Use to freeze by name or build per-group optimizer lists.', category: 'nn' },
  'named_modules':      { label: '.named_modules()', detail: 'Iterator over every submodule (including self) with dotted names.', category: 'nn' },
  'named_children':     { label: '.named_children()', detail: 'Iterator over direct child modules only.', category: 'nn' },
  'named_buffers':      { label: '.named_buffers()', detail: 'Iterator over (name, buffer) pairs — e.g. BatchNorm running_mean.', category: 'nn' },
  'children':           { label: '.children()', detail: 'Iterator over direct child modules (no names).', category: 'nn' },
  'modules':            { label: '.modules()', detail: 'Iterator over ALL submodules in the tree, including the module itself.', category: 'nn' },
  'buffers':            { label: '.buffers()', detail: 'Iterator over all persistent non-learnable tensors.', category: 'nn' },
  'apply':              { label: '.apply(fn)', detail: 'Recursively call fn on every submodule. Classic use: custom weight init.', category: 'nn' },
  'half':               { label: '.half()', detail: 'Cast module / tensor to float16.', category: 'nn' },
  'double':             { label: '.double()', detail: 'Cast module / tensor to float64.', category: 'nn' },
  'cpu':                { label: '.cpu()', detail: 'Move module / tensor to CPU.', category: 'device' },

  // ── nn.init ──
  'init':               { label: 'nn.init', detail: 'Weight-initialisation helpers. All names end with an underscore — they modify tensors in place.', category: 'nn' },
  'kaiming_normal_':    { label: 'nn.init.kaiming_normal_', detail: 'He init for ReLU / GELU nets. Sample N(0, √(2/fan_in)).', category: 'nn' },
  'kaiming_uniform_':   { label: 'nn.init.kaiming_uniform_', detail: 'He init, uniform variant. Default for nn.Linear / Conv in PyTorch.', category: 'nn' },
  'xavier_normal_':     { label: 'nn.init.xavier_normal_', detail: 'Glorot init — good for tanh/sigmoid nets.', category: 'nn' },
  'xavier_uniform_':    { label: 'nn.init.xavier_uniform_', detail: 'Glorot init, uniform variant.', category: 'nn' },
  'normal_':            { label: 'nn.init.normal_', detail: 'In-place fill with N(mean, std).', category: 'nn' },
  'uniform_':           { label: 'nn.init.uniform_', detail: 'In-place fill with U(a, b).', category: 'nn' },
  'constant_':          { label: 'nn.init.constant_', detail: 'In-place fill with a scalar value.', category: 'nn' },
  'zeros_':             { label: 'nn.init.zeros_', detail: 'In-place fill with 0 — common for biases.', category: 'nn' },
  'ones_':              { label: 'nn.init.ones_', detail: 'In-place fill with 1 — common for LayerNorm gain.', category: 'nn' },
  'orthogonal_':        { label: 'nn.init.orthogonal_', detail: 'Initialise with an orthogonal matrix — preserves signal magnitude in RNNs.', category: 'nn' },

  // ── optim — extra algorithms ──
  'Adagrad':            { label: 'optim.Adagrad', detail: 'Per-parameter learning rates based on historical squared gradients. Decays monotonically — often too aggressive.', category: 'optim' },
  'Adadelta':           { label: 'optim.Adadelta', detail: 'Adagrad variant with a rolling window — no monotonic lr decay.', category: 'optim' },
  'Adamax':             { label: 'optim.Adamax', detail: 'Adam with L∞ instead of L² — more stable for sparse gradients.', category: 'optim' },
  'NAdam':              { label: 'optim.NAdam', detail: 'Adam + Nesterov momentum — sometimes squeezes a bit more out of noisy tasks.', category: 'optim' },
  'RAdam':              { label: 'optim.RAdam', detail: 'Rectified Adam — auto-warmup built in; less sensitive to initial lr.', category: 'optim' },
  'LBFGS':              { label: 'optim.LBFGS', detail: 'Quasi-Newton method. Full-batch only; great for small problems (physics-informed nets, style transfer).', category: 'optim' },

  // ── scheduler — extras ──
  'LambdaLR':           { label: 'lr_scheduler.LambdaLR', detail: 'Scale lr by the value of a user lambda(epoch). Ultimate flexibility.', category: 'optim' },
  'ExponentialLR':      { label: 'lr_scheduler.ExponentialLR', detail: 'Multiply lr by gamma every epoch — simple exponential decay.', category: 'optim' },
  'PolynomialLR':       { label: 'lr_scheduler.PolynomialLR', detail: 'Polynomial decay to a minimum over total_iters. Common in segmentation training.', category: 'optim' },
  'CyclicLR':           { label: 'lr_scheduler.CyclicLR', detail: 'Triangular lr schedule between base_lr and max_lr. Great for fast convergence without a separate warmup.', category: 'optim' },
  'CosineAnnealingWarmRestarts': { label: 'lr_scheduler.CosineAnnealingWarmRestarts', detail: 'Cosine decay that restarts every T_0 epochs — the SGDR schedule.', category: 'optim' },
  'ChainedScheduler':   { label: 'lr_scheduler.ChainedScheduler', detail: 'Run several schedulers in series — one per epoch.', category: 'optim' },
  'SequentialLR':       { label: 'lr_scheduler.SequentialLR', detail: 'Switch between schedulers at predefined milestones (e.g. warmup then cosine).', category: 'optim' },

  // ── data — extras ──
  'random_split':       { label: 'data.random_split(ds, lengths)', detail: 'Split a dataset into non-overlapping Subsets of the given lengths (fractions allowed).', category: 'data' },
  'Subset':             { label: 'data.Subset(ds, indices)', detail: 'Lightweight view over an underlying Dataset — only the given indices are exposed.', category: 'data' },
  'ConcatDataset':      { label: 'data.ConcatDataset([...])', detail: 'Concatenate several Datasets end-to-end. Acts like a single unified dataset.', category: 'data' },
  'ChainDataset':       { label: 'data.ChainDataset([...])', detail: 'ConcatDataset for IterableDataset — chains their iterators.', category: 'data' },
  'IterableDataset':    { label: 'data.IterableDataset', detail: "Subclass for streaming / infinite data. Override __iter__ instead of __getitem__.", category: 'data' },
  'Sampler':            { label: 'data.Sampler', detail: 'Base class for index-sampling strategies passed to DataLoader(sampler=...).', category: 'data' },
  'RandomSampler':      { label: 'data.RandomSampler', detail: 'Shuffle indices uniformly each epoch. DataLoader(shuffle=True) uses this under the hood.', category: 'data' },
  'SequentialSampler':  { label: 'data.SequentialSampler', detail: 'Walk indices in order. Default when shuffle=False.', category: 'data' },
  'SubsetRandomSampler':{ label: 'data.SubsetRandomSampler', detail: 'RandomSampler restricted to a given list of indices — classic k-fold split trick.', category: 'data' },
  'WeightedRandomSampler':{ label: 'data.WeightedRandomSampler', detail: 'Sample with per-example weights (with replacement). Go-to fix for class imbalance.', category: 'data' },
  'BatchSampler':       { label: 'data.BatchSampler', detail: 'Wrap a Sampler to yield lists of indices (batches). Used for custom batching logic.', category: 'data' },
  'DistributedSampler': { label: 'data.DistributedSampler', detail: 'Partition a dataset across DDP ranks so each GPU sees a disjoint shard every epoch.', category: 'data' },
  'default_collate':    { label: 'data.default_collate', detail: 'Standard collate fn — stacks tensors along a new batch dim. Override with collate_fn for custom types.', category: 'data' },
  'get_worker_info':    { label: 'data.get_worker_info()', detail: 'Inside an IterableDataset, tells you which worker you are / how many there are — for sharding streams.', category: 'data' },
  'pin_memory':         { label: 'DataLoader(pin_memory=True)', detail: 'Allocate batches in page-locked memory so host→GPU copies are faster and async.', category: 'data' },
  'num_workers':        { label: 'DataLoader(num_workers=k)', detail: 'Number of subprocesses loading data in parallel. 4–8 is typical; set to 0 when debugging.', category: 'data' },
  'collate_fn':         { label: 'DataLoader(collate_fn=...)', detail: 'Custom function that turns a list of samples into a batch — needed for padded sequences, dicts, graphs.', category: 'data' },

  // ── distributed ──
  'distributed':        { label: 'torch.distributed', detail: 'Multi-process communication primitives. Underlies DDP, FSDP, and custom all-reduce training.', category: 'device' },
  'init_process_group': { label: 'dist.init_process_group', detail: 'Every rank calls this once to join the group. backend="nccl" on GPU, "gloo" on CPU.', category: 'device' },
  'destroy_process_group': { label: 'dist.destroy_process_group', detail: 'Cleanly tear down the process group at the end of training.', category: 'device' },
  'DataParallel':       { label: 'nn.DataParallel', detail: 'Single-process multi-GPU (one thread per GPU). Legacy — prefer DistributedDataParallel for real workloads.', category: 'device' },
  'DistributedDataParallel': { label: 'nn.parallel.DistributedDataParallel', detail: 'One process per GPU; gradients all-reduced every step. The standard way to train big models on many GPUs.', category: 'device' },
  'DDP':                { label: 'DDP', detail: 'Alias for DistributedDataParallel used in examples.', category: 'device' },
  'FullyShardedDataParallel': { label: 'FullyShardedDataParallel', detail: 'FSDP — shards parameters, grads, and optimizer state across ranks. Fits much bigger models than DDP.', category: 'device' },
  'FSDP':               { label: 'FSDP', detail: 'Alias for FullyShardedDataParallel.', category: 'device' },
  'all_reduce':         { label: 'dist.all_reduce', detail: 'Sum (or op) a tensor across all ranks and broadcast the result back. The heart of data-parallel training.', category: 'device' },
  'all_gather':         { label: 'dist.all_gather', detail: 'Gather a tensor from every rank into a list on every rank.', category: 'device' },
  'barrier':            { label: 'dist.barrier()', detail: 'Block until every rank reaches this point. Use sparingly — bottlenecks.', category: 'device' },
  'broadcast':          { label: 'dist.broadcast', detail: 'Send a tensor from src rank to every other rank.', category: 'device' },
  'get_rank':           { label: 'dist.get_rank()', detail: 'Zero-based index of this process within the group.', category: 'device' },
  'get_world_size':     { label: 'dist.get_world_size()', detail: 'Total number of processes in the group.', category: 'device' },

  // ── compile / jit / fx ──
  'compile':            { label: 'torch.compile(model)', detail: 'TorchDynamo + Inductor — captures and fuses the graph for big speedups with zero code changes. Requires PyTorch ≥ 2.0.', category: 'training' },
  'jit':                { label: 'torch.jit', detail: 'TorchScript: captures a Python nn.Module into a serialisable, Python-free graph for deployment.', category: 'training' },
  'script':             { label: 'torch.jit.script(fn_or_module)', detail: 'Statically analyse Python source → TorchScript. Handles control flow (if / for / while).', category: 'training' },
  'trace':              { label: 'torch.jit.trace(fn, example)', detail: 'Record a forward pass with example inputs → TorchScript. Fast but loses data-dependent control flow.', category: 'training' },
  'symbolic_trace':     { label: 'torch.fx.symbolic_trace(module)', detail: 'Capture a symbolic graph of a Module — edit / optimise / quantise, then compile back. Core of many transforms.', category: 'training' },
  'fx':                 { label: 'torch.fx', detail: 'Graph-level IR for nn.Module. Used for quantisation, fusion, and custom compilers.', category: 'training' },
  'GraphModule':        { label: 'fx.GraphModule', detail: 'Runnable nn.Module produced by symbolic_trace — exposes .graph for inspection / mutation.', category: 'training' },

  // ── export / quant / prune / checkpoint ──
  'onnx':               { label: 'torch.onnx', detail: 'Export a model to the ONNX format for cross-framework inference (TensorRT, OpenVINO, ONNX Runtime).', category: 'training' },
  'export':             { label: 'torch.onnx.export / torch.export', detail: 'Serialise a model to a portable graph. torch.export is the newer, more capable alternative to ONNX export.', category: 'training' },
  'quantization':       { label: 'torch.quantization', detail: 'Reduce weights / activations to int8 for 2–4× smaller, faster inference. Dynamic, static, and QAT flavours.', category: 'training' },
  'quantize_dynamic':   { label: 'quantization.quantize_dynamic', detail: 'Easiest quantisation: weights int8, activations on-the-fly. Great for Transformers on CPU.', category: 'training' },
  'QuantStub':          { label: 'quantization.QuantStub', detail: 'Marker module at the input of a region to be quantised — converts float → quantised.', category: 'training' },
  'DeQuantStub':        { label: 'quantization.DeQuantStub', detail: 'Marker at the output — converts quantised → float.', category: 'training' },
  'prune':              { label: 'nn.utils.prune', detail: 'Tools to zero-out weights (unstructured / structured). Reduces model size after retraining.', category: 'training' },
  'l1_unstructured':    { label: 'prune.l1_unstructured', detail: 'Set the k smallest-magnitude weights in a tensor to zero. Baseline pruning.', category: 'training' },
  'checkpoint_sequential': { label: 'checkpoint.checkpoint_sequential', detail: 'Apply gradient checkpointing to an nn.Sequential by splitting it into N chunks.', category: 'training' },

  // ── profiler / tensorboard ──
  'profiler':           { label: 'torch.profiler', detail: 'Low-overhead GPU / CPU / memory profiler. Export traces to Chrome / TensorBoard.', category: 'training' },
  'profile':            { label: 'profiler.profile(...)', detail: 'Context manager that records op-level timings. Wrap your training step to find the slow layer.', category: 'training' },
  'record_function':    { label: 'profiler.record_function("label")', detail: 'Annotate a code region so it shows up as a named span in the profiler trace.', category: 'training' },
  'ProfilerActivity':   { label: 'profiler.ProfilerActivity', detail: 'Enum selecting which activities to record: CPU, CUDA, XPU.', category: 'training' },
  'SummaryWriter':      { label: 'utils.tensorboard.SummaryWriter', detail: 'Log scalars / images / histograms / graphs to TensorBoard. Call .add_scalar, .add_image, .add_histogram.', category: 'training' },
  'tensorboard':        { label: 'torch.utils.tensorboard', detail: 'PyTorch’s TensorBoard integration — exports logs that `tensorboard --logdir` can read.', category: 'training' },

  // ── distributions ──
  'distributions':      { label: 'torch.distributions', detail: 'Probability distributions with .sample() / .log_prob() / .rsample() — powers REINFORCE, VAEs, Bayesian nets.', category: 'core' },
  'Normal':             { label: 'distributions.Normal(mu, sigma)', detail: 'Gaussian distribution. Use .rsample() for the reparameterisation trick (VAE).', category: 'core' },
  'Categorical':        { label: 'distributions.Categorical(probs)', detail: 'Discrete distribution. .sample() returns a class index; .log_prob(idx) gives log π(a|s) for policy gradient.', category: 'core' },
  'Bernoulli':          { label: 'distributions.Bernoulli(p)', detail: 'Binary distribution. Useful for masks, dropout analysis, binary policies.', category: 'core' },
  'Uniform':            { label: 'distributions.Uniform(lo, hi)', detail: 'Continuous uniform distribution.', category: 'core' },
  'MultivariateNormal': { label: 'distributions.MultivariateNormal', detail: 'Gaussian with a full (or low-rank / diagonal) covariance matrix.', category: 'core' },
  'kl_divergence':      { label: 'distributions.kl_divergence(p, q)', detail: 'Analytic KL(p ‖ q) when available for the pair of distribution types.', category: 'core' },
  'log_prob':           { label: '.log_prob(x)', detail: 'Log-probability of x under the distribution. Core term in REINFORCE / ELBO.', category: 'core' },
  'sample':             { label: '.sample()', detail: 'Draw a sample from the distribution — NO gradient flows through it.', category: 'core' },
  'rsample':            { label: '.rsample()', detail: 'Reparameterised sample — gradients DO flow through, enabling VAEs and soft policies.', category: 'core' },

  // ── linalg / fft / special / sparse / nested / masked / func ──
  'linalg':             { label: 'torch.linalg', detail: 'NumPy-style linear algebra: norm, svd, eigh, qr, inv, pinv, solve, det, matrix_rank.', category: 'op' },
  'svd':                { label: 'linalg.svd(A)', detail: 'Singular value decomposition U Σ Vᵀ. Used in PCA, low-rank approximation, LoRA initialisation.', category: 'op' },
  'qr':                 { label: 'linalg.qr(A)', detail: 'QR decomposition — orthogonal Q, upper-triangular R.', category: 'op' },
  'eigh':               { label: 'linalg.eigh(A)', detail: 'Eigendecomposition for symmetric / Hermitian matrices — real eigenvalues, orthonormal eigenvectors.', category: 'op' },
  'inv':                { label: 'linalg.inv(A)', detail: 'Matrix inverse. Prefer linalg.solve(A, b) over inv(A) @ b — faster and more stable.', category: 'op' },
  'pinv':               { label: 'linalg.pinv(A)', detail: 'Moore–Penrose pseudo-inverse — works for non-square / singular matrices.', category: 'op' },
  'solve':              { label: 'linalg.solve(A, B)', detail: 'Solve AX = B for X. Numerically better than computing inv(A) @ B.', category: 'op' },
  'det':                { label: 'linalg.det(A)', detail: 'Determinant of a square matrix.', category: 'op' },
  'fft':                { label: 'torch.fft', detail: 'Fast Fourier Transforms — fft, ifft, fft2, rfft, … with batch support and GPU kernels.', category: 'op' },
  'ifft':               { label: 'fft.ifft', detail: 'Inverse 1-D FFT — back to the time / spatial domain.', category: 'op' },
  'rfft':               { label: 'fft.rfft', detail: 'FFT for real inputs — returns only the non-redundant half of the spectrum.', category: 'op' },
  'special':            { label: 'torch.special', detail: 'Mathematical specials: erf, erfinv, gamma, digamma, expit, xlogy, …', category: 'op' },
  'sparse':             { label: 'torch.sparse', detail: 'Sparse tensor formats (COO, CSR, BSR) and ops. Huge memory wins for graphs / embeddings with many zeros.', category: 'core' },
  'sparse_coo_tensor':  { label: 'torch.sparse_coo_tensor', detail: 'Construct a sparse COO tensor from (indices, values, size).', category: 'core' },
  'nested':             { label: 'torch.nested', detail: 'Nested tensors — batches of ragged tensors (different lengths) without padding.', category: 'core' },
  'masked':             { label: 'torch.masked', detail: 'First-class masked tensors — ops respect the mask without manual masking boilerplate (prototype).', category: 'core' },
  'func':               { label: 'torch.func', detail: 'Functional transforms (ex-functorch): vmap, grad, jacrev, jacfwd, hessian, functional_call.', category: 'autograd' },
  'vmap':               { label: 'torch.func.vmap(fn)', detail: 'Auto-batch a function written for single examples — no Python loop, no manual reshape.', category: 'autograd' },
  'jacrev':             { label: 'torch.func.jacrev(fn)', detail: 'Reverse-mode Jacobian. Fast when output is smaller than input.', category: 'autograd' },
  'jacfwd':             { label: 'torch.func.jacfwd(fn)', detail: 'Forward-mode Jacobian. Fast when input is smaller than output.', category: 'autograd' },
  'hessian':            { label: 'torch.func.hessian(fn)', detail: 'Matrix of second derivatives — for Newton methods, influence functions, curvature analysis.', category: 'autograd' },
  'functional_call':    { label: 'torch.func.functional_call(mod, params, x)', detail: 'Run a module as a pure function of explicit parameters. Enables meta-learning, ensembles, model surgery.', category: 'autograd' },

  // ── device / cuda extras ──
  'mps':                { label: 'torch.mps', detail: 'Metal Performance Shaders backend — run on Apple Silicon GPUs.', category: 'device' },
  'current_device':     { label: 'cuda.current_device()', detail: 'Index of the GPU currently selected for this process.', category: 'device' },
  'set_device':         { label: 'cuda.set_device(idx)', detail: 'Select which GPU new tensors default to.', category: 'device' },
  'empty_cache':        { label: 'cuda.empty_cache()', detail: 'Release cached (unreferenced) GPU memory back to the driver. Usually unnecessary — CUDA caching allocator handles reuse.', category: 'device' },
  'memory_allocated':   { label: 'cuda.memory_allocated()', detail: 'Current GPU memory reserved by live tensors — great for debugging OOMs.', category: 'device' },
  'synchronize':        { label: 'cuda.synchronize()', detail: 'Block CPU until every queued GPU op finishes. Needed before timing GPU code with time.time().', category: 'device' },
  'Stream':             { label: 'cuda.Stream()', detail: 'Separate queue for GPU work — lets you overlap compute and data movement.', category: 'device' },
  'Event':              { label: 'cuda.Event()', detail: 'Lightweight GPU marker for precise timing or inter-stream sync.', category: 'device' },
  'Generator':          { label: 'torch.Generator', detail: 'Explicit RNG state object. Seed per-device or per-dataloader-worker for reproducibility.', category: 'core' },

  // ── hooks (tensor-level) ──
  'register_hook':      { label: 'tensor.register_hook(fn)', detail: 'Attach a callback fn(grad) that fires in backward when this tensor\'s gradient is computed. Return a new tensor to replace the gradient.', category: 'autograd' },

  // ── distributed — extras ──
  'no_sync':            { label: 'ddp_model.no_sync()', detail: 'Context manager that SKIPS the all-reduce on backward — use between gradient-accumulation micro-batches to avoid paying comm cost every step.', category: 'device' },
  'set_epoch':          { label: 'sampler.set_epoch(epoch)', detail: 'Tell a DistributedSampler which epoch it is so every rank reshuffles deterministically the same way.', category: 'data' },
  'size_based_auto_wrap_policy': { label: 'fsdp.size_based_auto_wrap_policy', detail: 'FSDP policy that wraps any submodule with more than min_num_params parameters into its own shard unit. Simple, works for most models.', category: 'device' },
  'transformer_auto_wrap_policy': { label: 'fsdp.transformer_auto_wrap_policy', detail: 'FSDP policy that wraps each transformer block (e.g. each GPT layer) as its own shard unit. The sweet spot for LLMs.', category: 'device' },
  'auto_wrap_policy':   { label: 'FSDP(auto_wrap_policy=...)', detail: 'Function that decides which submodules FSDP should wrap as independent shard units. Controls memory / comm trade-off.', category: 'device' },
  'reduce_scatter':     { label: 'dist.reduce_scatter', detail: 'Sum across ranks AND shard the result in one op — the gradient-averaging primitive FSDP uses instead of all-reduce.', category: 'device' },

  // ── torch.compile / dynamo ──
  '_dynamo':            { label: 'torch._dynamo', detail: 'TorchDynamo — the frame-evaluator that captures Python bytecode into an FX graph for torch.compile.', category: 'training' },
  'dynamo':             { label: 'torch._dynamo', detail: 'Shortcut for torch._dynamo. explain(model)(x) reports why graphs break.', category: 'training' },
  'explain':            { label: 'dynamo.explain(model)', detail: 'Run the model once and return a human-readable report of every graph break + its cause.', category: 'training' },

  // ── profiler — extras ──
  'schedule':           { label: 'profiler.schedule(wait, warmup, active, repeat)', detail: 'How many steps to skip / warm up / record. Prevents the first noisy iterations from polluting your trace.', category: 'training' },
  'tensorboard_trace_handler': { label: 'profiler.tensorboard_trace_handler(dir)', detail: 'Write trace.json files to dir so the TensorBoard profiler plugin can render flame graphs.', category: 'training' },
  'key_averages':       { label: 'prof.key_averages()', detail: 'Aggregate op-level stats across steps. Chain .table(sort_by="cuda_time_total") for a quick hot-list.', category: 'training' },
  'record_shapes':      { label: 'profile(record_shapes=True)', detail: 'Record input shapes per op — lets the profiler group / distinguish shape-dependent kernels.', category: 'training' },
  'profile_memory':     { label: 'profile(profile_memory=True)', detail: 'Track every tensor allocation / free. Essential for finding memory leaks and OOMs.', category: 'training' },
  'with_stack':         { label: 'profile(with_stack=True)', detail: 'Capture a Python stack for every op — lets you click from a hot kernel back to the line that launched it.', category: 'training' },

  // ── quantisation (torch.ao.quantization) ──
  'ao':                 { label: 'torch.ao', detail: 'Architecture-Optimization namespace — the new home of quantisation, pruning, and sparsity APIs.', category: 'training' },
  'qconfig':            { label: '.qconfig', detail: 'Per-module quantisation config: which observer + quantiser to use for weights and activations.', category: 'training' },
  'get_default_qconfig': { label: 'tq.get_default_qconfig(backend)', detail: 'Ready-made qconfig for fbgemm (x86) or qnnpack (ARM / mobile). Good starting point for post-training quant.', category: 'training' },
  'prepare':            { label: 'tq.prepare(model)', detail: 'Insert observers into the model so they can record activation ranges during calibration.', category: 'training' },
  'convert':            { label: 'tq.convert(model)', detail: 'Swap observed float modules for their int8 equivalents. Runs once calibration is done.', category: 'training' },
  'prepare_qat':        { label: 'tq.prepare_qat(model)', detail: 'Like prepare, but also inserts fake-quant nodes so the model can TRAIN under quantisation (QAT).', category: 'training' },
  'fuse_modules':       { label: 'tq.fuse_modules(model, [...])', detail: 'Fuse adjacent Conv+BN+ReLU into a single module — required before quantisation for best accuracy and speed.', category: 'training' },

  // ── pruning (torch.nn.utils.prune) — extras ──
  'global_unstructured': { label: 'prune.global_unstructured', detail: 'Rank ALL weights across the supplied params by magnitude and zero out the bottom amount%. Sparsity is shared, not per-layer.', category: 'training' },
  'L1Unstructured':     { label: 'prune.L1Unstructured', detail: 'Class version of l1_unstructured — pass to global_unstructured(pruning_method=...).', category: 'training' },
  'ln_structured':      { label: 'prune.ln_structured', detail: 'Remove entire rows / columns / channels based on their Ln norm. Real inference speedup on dense hardware (unlike unstructured).', category: 'training' },
  'remove':             { label: 'prune.remove(module, name)', detail: 'Bake the mask into the weight permanently and drop the reparametrisation. Call this when you\'re done pruning + fine-tuning.', category: 'training' },
}

// Simple Python-ish tokenizer: splits into strings | comments | identifiers | numbers | punctuation.
// We only wrap identifiers / dotted attributes that exist in the dictionary.
function tokenize(code: string): Array<{ kind: 'code' | 'string' | 'comment' | 'number' | 'keyword' | 'hover'; text: string; info?: KeywordExplanation }> {
  const out: Array<{ kind: 'code' | 'string' | 'comment' | 'number' | 'keyword' | 'hover'; text: string; info?: KeywordExplanation }> = []
  const pyKeywords = new Set(['def','class','return','import','from','as','if','else','elif','for','while','in','not','and','or','is','None','True','False','with','try','except','finally','raise','lambda','pass','break','continue','global','nonlocal','yield','self'])

  // Regex pieces
  const re = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|#[^\n]*|\b\d+(?:\.\d+)?\b|[A-Za-z_][A-Za-z_0-9]*|\s+|[^\s\w])/g

  let m: RegExpExecArray | null
  while ((m = re.exec(code)) !== null) {
    const t = m[0]
    if (t.startsWith('#')) { out.push({ kind: 'comment', text: t }); continue }
    if (t.startsWith('"') || t.startsWith("'")) { out.push({ kind: 'string', text: t }); continue }
    if (/^\d/.test(t)) { out.push({ kind: 'number', text: t }); continue }
    if (/^[A-Za-z_]/.test(t)) {
      if (pyKeywords.has(t)) { out.push({ kind: 'keyword', text: t }); continue }
      const info = PYTORCH_KEYWORDS[t]
      if (info) { out.push({ kind: 'hover', text: t, info }); continue }
      out.push({ kind: 'code', text: t }); continue
    }
    out.push({ kind: 'code', text: t })
  }
  return out
}

const CAT_COLOR: Record<KeywordExplanation['category'], string> = {
  core:     'text-cyan-300 decoration-cyan-400/60',
  nn:       'text-fuchsia-300 decoration-fuchsia-400/60',
  autograd: 'text-amber-300 decoration-amber-400/60',
  optim:    'text-emerald-300 decoration-emerald-400/60',
  data:     'text-sky-300 decoration-sky-400/60',
  device:   'text-rose-300 decoration-rose-400/60',
  op:       'text-violet-300 decoration-violet-400/60',
  training: 'text-yellow-300 decoration-yellow-400/60',
}

interface Props {
  code: string
  /** Optional header label shown above the block */
  title?: string
  className?: string
  /**
   * Optional per-line plain-English explanation.
   * Keys are 1-based line numbers. When provided, a "Explain each line" toggle
   * is shown; enabling it renders a two-column view with the commentary beside
   * the matching source line.
   */
  annotations?: Record<number, string>
}

type Tok = ReturnType<typeof tokenize>[number]

function splitLines(tokens: Tok[]): Tok[][] {
  const lines: Tok[][] = [[]]
  for (const t of tokens) {
    const parts = t.text.split('\n')
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) lines.push([])
      if (parts[i] !== '') lines[lines.length - 1].push({ ...t, text: parts[i] })
    }
  }
  return lines
}

function UltraTooltipBody({
  sections,
  label,
  fallback,
}: {
  sections: UltraSection[]
  label: string
  fallback: string
}) {
  if (!sections || sections.length === 0) {
    return (
      <>
        <div className="font-mono font-semibold mb-1 text-cyan-300">{label}</div>
        <div className="text-slate-200">{fallback}</div>
        <div className="mt-2 text-[10px] uppercase tracking-wide text-amber-300/70">
          Ultra-detail not yet written for this keyword — showing the short version.
        </div>
      </>
    )
  }
  return (
    <div className="space-y-2.5">
      <div className="font-mono font-semibold text-cyan-300 border-b border-slate-700 pb-1">
        {label}
      </div>
      {sections.map((s, i) => (
        <div key={i}>
          <div className="text-[11px] font-semibold text-amber-300 mb-1">{s.heading}</div>
          <div className="text-slate-200 whitespace-pre-line">{s.body}</div>
          {s.code && (
            <pre className="mt-1 p-2 rounded bg-black/60 border border-slate-800 text-[10.5px] text-slate-100 overflow-x-auto whitespace-pre">
              {s.code}
            </pre>
          )}
        </div>
      ))}
    </div>
  )
}

function renderToken(
  tk: Tok,
  key: number,
  ultra: boolean,
  lineText: string,
  fullCode: string,
  lineToks: Tok[],
  tokIdx: number,
) {
  if (tk.kind === 'comment') return <span key={key} className="text-slate-500 italic">{tk.text}</span>
  if (tk.kind === 'string')  return <span key={key} className="text-green-300">{tk.text}</span>
  if (tk.kind === 'number')  return <span key={key} className="text-orange-300">{tk.text}</span>
  if (tk.kind === 'keyword') return <span key={key} className="text-pink-300">{tk.text}</span>
  if (tk.kind === 'hover' && tk.info) {
    const color = CAT_COLOR[tk.info.category]

    // Locate prev/next non-whitespace tokens in the same line for the ultra context.
    let prevToken: string | undefined
    let nextToken: string | undefined
    for (let i = tokIdx - 1; i >= 0; i--) {
      const t = lineToks[i].text
      if (t.trim().length) { prevToken = t; break }
    }
    for (let i = tokIdx + 1; i < lineToks.length; i++) {
      const t = lineToks[i].text
      if (t.trim().length) { nextToken = t; break }
    }

    const ultraSections = ultra
      ? getUltraSections(tk.text, { line: lineText, fullCode, prevToken, nextToken }) ?? []
      : []

    return (
      <Tooltip key={key}>
        <TooltipTrigger asChild>
          <span className={`${color} underline decoration-dotted underline-offset-4 cursor-help hover:bg-white/10 rounded px-0.5 ${
            ultra ? 'decoration-amber-400/70 decoration-2' : ''
          }`}>
            {tk.text}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className={`bg-slate-900 text-slate-100 border border-slate-700 shadow-2xl px-3 py-2.5 text-xs leading-relaxed [&>*]:text-slate-100 ${
            ultra ? 'max-w-md' : 'max-w-sm'
          }`}
        >
          {ultra ? (
            <UltraTooltipBody
              sections={ultraSections}
              label={tk.info.label}
              fallback={tk.info.detail}
            />
          ) : (
            <>
              <div className="font-mono font-semibold mb-1 text-cyan-300">{tk.info.label}</div>
              <div className="text-slate-200">{tk.info.detail}</div>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }
  return <span key={key}>{tk.text}</span>
}

export function HoverableCode({ code, className = '', annotations }: Props) {
  const tokens = React.useMemo(() => tokenize(code), [code])
  const lines = React.useMemo(() => splitLines(tokens), [tokens])
  const hasAnn = !!annotations && Object.keys(annotations).length > 0
  const [showAnn, setShowAnn] = React.useState(false)
  const [ultra, setUltra] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [isNarrow, setIsNarrow] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement | null>(null)
  const gutterW = String(lines.length).length

  // Responsive: watch the container's own width so the block adapts whether
  // the viewport is narrow or a sidebar is squeezing it.
  React.useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setIsNarrow(e.contentRect.width < 640)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const sideBySideAnn = showAnn && !isNarrow

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      ref={wrapRef}
      className={`group/code relative rounded-2xl border border-slate-800/80 bg-slate-950 shadow-lg shadow-black/40 overflow-hidden ring-1 ring-white/5 ${className}`}
    >
      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-900/60 backdrop-blur">
        {/* Traffic-light dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 shadow-[0_0_0_1px_rgba(0,0,0,0.3)_inset]" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300/80 shadow-[0_0_0_1px_rgba(0,0,0,0.3)_inset]" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 shadow-[0_0_0_1px_rgba(0,0,0,0.3)_inset]" />
          <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-slate-500 hidden sm:inline">
            python
          </span>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <button
            onClick={() => setUltra((v) => !v)}
            className={`text-[10px] px-2 py-1 rounded-md border transition font-mono ${
              ultra
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-inner shadow-amber-500/20'
                : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
            }`}
            title="Hover tooltips become context-aware mini-articles that explain the keyword for THIS exact line."
          >
            {ultra ? '✓ Ultra detail' : '★ Ultra detail'}
          </button>
          {hasAnn && (
            <button
              onClick={() => setShowAnn((v) => !v)}
              className={`text-[10px] px-2 py-1 rounded-md border transition font-mono ${
                showAnn
                  ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200 shadow-inner shadow-cyan-500/20'
                  : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
              }`}
              title="Show plain-English explanation for every line"
            >
              {showAnn ? '✓ Explain lines' : '☰ Explain lines'}
            </button>
          )}
          <button
            onClick={onCopy}
            className={`text-[10px] px-2 py-1 rounded-md border transition font-mono ${
              copied
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
            }`}
            title="Copy code"
          >
            {copied ? '✓ Copied' : '⧉ Copy'}
          </button>
        </div>
      </div>

      {/* ── Code body ────────────────────────────────────────────────── */}
      <div
        className="bg-slate-950 text-slate-100 overflow-auto font-mono text-[12.5px] leading-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        style={{ maxHeight: 'min(72vh, 720px)' }}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((lineToks, idx) => {
              const lineNo = idx + 1
              const ann = annotations?.[lineNo]
              const lineText = lineToks.map((t) => t.text).join('')
              return (
                <React.Fragment key={idx}>
                  <tr className="align-top hover:bg-white/[0.035] transition-colors">
                    <td
                      className="select-none text-right pr-3 pl-3 py-0.5 text-slate-600 border-r border-slate-800/80 tabular-nums bg-slate-950 sticky left-0 z-10"
                      style={{ width: `${gutterW + 2}ch` }}
                    >
                      {lineNo}
                    </td>
                    <td className="py-0.5 pl-3 pr-3 whitespace-pre">
                      {lineToks.length === 0
                        ? '\u00A0'
                        : lineToks.map((tk, j) =>
                            renderToken(tk, j, ultra, lineText, code, lineToks, j),
                          )}
                    </td>
                    {sideBySideAnn && (
                      <td
                        className="py-0.5 pl-3 pr-3 border-l border-slate-800/80 text-[11px] leading-5 text-slate-300 bg-slate-900/40 align-top"
                        style={{ width: '42%' }}
                      >
                        {ann ? (
                          <span className="text-slate-200">
                            <span className="text-cyan-400 mr-1">→</span>
                            {ann}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                  {showAnn && !sideBySideAnn && ann && (
                    <tr className="align-top">
                      <td className="bg-slate-950 border-r border-slate-800/80" />
                      <td
                        colSpan={1}
                        className="pl-3 pr-3 pb-1 text-[11px] leading-5 text-cyan-200/90 bg-cyan-500/[0.04] border-l-2 border-cyan-400/40"
                      >
                        <span className="text-cyan-400 mr-1">→</span>
                        {ann}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HoverableCode
