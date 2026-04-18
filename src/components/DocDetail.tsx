import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CheckCircle, Code, Play, BookOpen } from '@phosphor-icons/react'
import type { DocTopic } from '@/lib/docs'
import { TensorVisualizer } from '@/components/TensorVisualizer'
import { NeuralNetworkVisualizer } from '@/components/NeuralNetworkVisualizer'
import { TrainingSimulator } from '@/components/TrainingSimulator'
import { GANVisualizer } from '@/components/visuals/GANVisualizer'
import { RLVisualizer } from '@/components/visuals/RLVisualizer'
import { CVVisualizer } from '@/components/visuals/CVVisualizer'
import { PyTorchLogoVisual } from '@/components/visuals/PyTorchLogoVisual'
import { AIBrainVisual } from '@/components/visuals/AIBrainVisual'
import { LayersFlowVisual } from '@/components/visuals/LayersFlowVisual'
import { ActivationFunctionVisual } from '@/components/visuals/ActivationFunctionVisual'
import { TensorOperationVisual } from '@/components/visuals/TensorOperationVisual'
import { cn } from '@/lib/utils'

interface DocDetailProps {
  topic: DocTopic
  onBack: () => void
  onComplete: () => void
  isCompleted: boolean
}

export function DocDetail({ topic, onBack, onComplete, isCompleted }: DocDetailProps) {
  const [activeTab, setActiveTab] = useState('concepts')
  
  const renderVisualization = () => {
    switch (topic.id) {
      case 'pytorch-intro':
        return (
          <div className="space-y-6">
            <PyTorchLogoVisual />
            <AIBrainVisual />
          </div>
        )
      case 'tensor-fundamentals':
        return (
          <div className="space-y-6">
            <TensorVisualizer title="Tensor Operations" description="Experiment with tensor dimensions and operations" />
            <TensorOperationVisual />
          </div>
        )
      case 'tensor-broadcasting':
        return (
          <div className="space-y-6">
            <TensorVisualizer title="Broadcasting Rules" description="See how tensors of different shapes combine" />
            <TensorOperationVisual />
          </div>
        )
      case 'autograd-basics':
      case 'custom-autograd':
        return (
          <div className="space-y-6">
            <LayersFlowVisual />
            <AIBrainVisual />
          </div>
        )
      case 'nn-module':
      case 'cnn-architectures':
      case 'rnn-lstm':
      case 'transformers':
        return (
          <div className="space-y-6">
            <NeuralNetworkVisualizer />
            <ActivationFunctionVisual />
          </div>
        )
      case 'loss-functions':
      case 'training-loop':
      case 'optimizers':
        return (
          <div className="space-y-6">
            <TrainingSimulator />
            <ActivationFunctionVisual />
          </div>
        )
      case 'distributed-training':
      case 'model-optimization':
        return (
          <div className="space-y-6">
            <LayersFlowVisual />
            <NeuralNetworkVisualizer />
          </div>
        )
      case 'gan-basics':
      case 'dcgan':
      case 'stylegan':
      case 'wgan':
      case 'diffusion-models':
        return <GANVisualizer />
      case 'rl-basics':
      case 'dqn':
      case 'policy-gradient':
      case 'ppo-trpo':
      case 'model-based-rl':
        return <RLVisualizer />
      case 'cv-fundamentals':
      case 'object-detection':
      case 'image-segmentation':
      case 'pose-estimation':
        return <CVVisualizer />
      case 'word-embeddings':
      case 'seq2seq':
      case 'bert-transformers':
        return (
          <div className="space-y-6">
            <NeuralNetworkVisualizer />
            <LayersFlowVisual />
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Code size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
              <p>Interactive visualization coming soon</p>
            </div>
          </div>
        )
    }
  }

  const renderContent = () => {
    return (
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
            Overview
          </h2>
          <Card className="p-6 bg-gradient-to-br from-muted/30 to-transparent border-2">
            <p className="text-lg leading-relaxed">{getTopicOverview(topic.id)}</p>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
            Key Concepts
          </h2>
          <div className="grid gap-4">
            {getKeyConcepts(topic.id).map((concept, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-5 hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {index + 1}
                    </span>
                    {concept.title}
                  </h3>
                  <p className="text-muted-foreground ml-10">{concept.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
            Code Example
          </h2>
          <Card className="p-6 bg-gradient-to-br from-card to-muted/20 border-2">
            <pre className="overflow-x-auto">
              <code className="text-sm">{getCodeExample(topic.id)}</code>
            </pre>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
            Common Patterns & Best Practices
          </h2>
          <div className="grid gap-3">
            {getBestPractices(topic.id).map((practice, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-lime/5 border border-lime/20"
              >
                <CheckCircle size={20} weight="fill" className="text-lime mt-0.5 flex-shrink-0" />
                <p className="text-sm">{practice}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, oklch(0.55 0.22 280 / 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, oklch(0.62 0.24 300 / 0.1) 0%, transparent 50%),
            repeating-linear-gradient(90deg, transparent, transparent 100px, oklch(0.55 0.22 280 / 0.02) 100px, oklch(0.55 0.22 280 / 0.02) 200px)
          `
        }}
      />

      <div className="relative z-10">
        <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="gap-2"
                >
                  <ArrowLeft size={18} />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{topic.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    {topic.category} • {topic.estimatedTime} • {topic.complexity}
                  </p>
                </div>
              </div>
              <Button
                onClick={onComplete}
                className={cn(
                  "gap-2",
                  isCompleted && "bg-lime hover:bg-lime/90 text-lime-foreground"
                )}
              >
                <CheckCircle size={18} weight={isCompleted ? "fill" : "regular"} />
                {isCompleted ? 'Completed' : 'Mark Complete'}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50">
              <TabsTrigger value="concepts" className="gap-2">
                <BookOpen size={16} />
                Concepts
              </TabsTrigger>
              <TabsTrigger value="interactive" className="gap-2">
                <Play size={16} />
                Interactive
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code size={16} />
                Code
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="concepts" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="pr-4">
                      {renderContent()}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="interactive" className="mt-0">
                  <Card className="p-6 min-h-[600px]">
                    {renderVisualization()}
                  </Card>
                </TabsContent>

                <TabsContent value="code" className="mt-0">
                  <Card className="p-6 bg-gradient-to-br from-card to-muted/20">
                    <h3 className="text-xl font-bold mb-4">Complete Implementation</h3>
                    <ScrollArea className="h-[600px]">
                      <pre className="text-sm">
                        <code>{getFullCodeExample(topic.id)}</code>
                      </pre>
                    </ScrollArea>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function getTopicOverview(topicId: string): string {
  const overviews: Record<string, string> = {
    'pytorch-intro': 'PyTorch is an open-source machine learning framework developed by Facebook\'s AI Research lab. It provides a flexible and intuitive interface for building and training neural networks, with strong support for GPU acceleration and dynamic computational graphs.',
    'tensor-fundamentals': 'Tensors are the fundamental data structure in PyTorch. They are multi-dimensional arrays similar to NumPy arrays but with additional capabilities like GPU acceleration and automatic differentiation. Understanding tensors is crucial for working with any deep learning framework.',
    'tensor-broadcasting': 'Broadcasting allows PyTorch to work with arrays of different shapes during arithmetic operations. This powerful feature enables you to write concise and efficient code without explicitly replicating data. Mastering broadcasting and indexing is key to writing performant PyTorch code.',
    'autograd-basics': 'PyTorch\'s autograd system automatically computes gradients by building a computational graph of operations. This enables efficient backpropagation and makes it easy to train neural networks. Understanding autograd is fundamental to working with PyTorch effectively.',
    'nn-module': 'The nn.Module class is the base class for all neural network modules in PyTorch. It provides a clean and modular way to build complex architectures by composing simpler building blocks. Learning to effectively use nn.Module is essential for building maintainable deep learning code.',
    'cnn-architectures': 'Convolutional Neural Networks (CNNs) are specialized architectures designed for processing grid-like data such as images. They use convolution operations to automatically learn spatial hierarchies of features, making them incredibly effective for computer vision tasks.',
    'rnn-lstm': 'Recurrent Neural Networks (RNNs) and Long Short-Term Memory (LSTM) networks are designed to handle sequential data. They maintain internal state and can process sequences of variable length, making them ideal for tasks like language modeling and time series prediction.',
    'transformers': 'Transformers revolutionized deep learning by introducing the attention mechanism as an alternative to recurrence. They process entire sequences in parallel, making them both more efficient and more effective than RNNs for many tasks, especially in natural language processing.',
    'loss-functions': 'Loss functions quantify how well a model\'s predictions match the target values. Choosing the right loss function is crucial for training effective models. Different tasks require different loss functions, and understanding their properties helps you make informed choices.',
    'optimizers': 'Optimizers are algorithms that adjust model parameters to minimize the loss function. They implement various strategies for navigating the loss landscape efficiently. Understanding different optimizers and their hyperparameters is key to training models effectively.',
    'training-loop': 'The training loop is the core process of training neural networks. It involves forward passes, loss computation, backpropagation, and parameter updates. Implementing robust training loops with proper validation, checkpointing, and monitoring is essential for successful model development.',
    'custom-autograd': 'Custom autograd functions allow you to define operations with custom forward and backward passes. This is useful when you need to implement operations not provided by PyTorch, optimize performance, or control gradient flow in specific ways.',
    'distributed-training': 'Distributed training allows you to train models across multiple GPUs or machines, dramatically reducing training time for large models. Understanding data parallelism, model parallelism, and distributed communication patterns is crucial for scaling deep learning.',
    'model-optimization': 'Model optimization techniques like quantization and pruning reduce model size and improve inference speed. Deploying models to production often requires converting them to formats like ONNX. These techniques are essential for bringing models from research to production.',
    'cv-fundamentals': 'Computer vision fundamentals cover image preprocessing, data augmentation, and building efficient CV pipelines. These techniques are essential for preparing image data and improving model generalization in visual tasks.',
    'object-detection': 'Object detection identifies and localizes multiple objects in images. Modern architectures like YOLO, R-CNN, and Faster R-CNN achieve real-time performance by cleverly balancing speed and accuracy through innovative region proposal and classification strategies.',
    'image-segmentation': 'Image segmentation partitions images into meaningful regions at the pixel level. Architectures like U-Net and Mask R-CNN excel at semantic segmentation (classifying each pixel) and instance segmentation (separating individual object instances).',
    'pose-estimation': 'Pose estimation detects and tracks human body keypoints in images and videos. This technology powers applications from AR filters to sports analytics, using specialized architectures that learn to predict joint locations with high precision.',
    'gan-basics': 'Generative Adversarial Networks consist of two neural networks - a generator and discriminator - that compete in a minimax game. The generator creates fake samples while the discriminator learns to distinguish real from fake, resulting in increasingly realistic generated content.',
    'dcgan': 'Deep Convolutional GANs introduced architectural guidelines that stabilize GAN training using convolutional layers. DCGANs demonstrated that GANs can learn hierarchical representations and enabled high-quality image generation across various domains.',
    'stylegan': 'StyleGAN represents the cutting edge of image generation, introducing style-based generation and progressive growing. It enables unprecedented control over generated images through latent space manipulation and produces photorealistic results.',
    'wgan': 'Wasserstein GANs use the Earth Mover distance instead of Jensen-Shannon divergence, providing more stable training and meaningful loss metrics. WGAN-GP adds gradient penalty for further improved training dynamics.',
    'diffusion-models': 'Diffusion models generate data by learning to reverse a gradual noising process. They achieve state-of-the-art generation quality and have become foundational to modern AI art and image generation systems.',
    'rl-basics': 'Reinforcement Learning trains agents to make sequential decisions by maximizing cumulative rewards. Key concepts include Markov Decision Processes, value functions, policies, and the exploration-exploitation tradeoff.',
    'dqn': 'Deep Q-Networks combine Q-learning with deep neural networks, using experience replay and target networks to stabilize training. DQN revolutionized RL by enabling agents to learn directly from high-dimensional sensory input.',
    'policy-gradient': 'Policy gradient methods directly optimize the policy by following the gradient of expected rewards. Algorithms like REINFORCE and actor-critic methods form the foundation of modern RL approaches.',
    'ppo-trpo': 'Proximal Policy Optimization and Trust Region Policy Optimization constrain policy updates to improve training stability. These algorithms achieve strong performance across diverse tasks while remaining relatively simple to implement.',
    'model-based-rl': 'Model-based RL learns a model of the environment dynamics, enabling planning and sample-efficient learning. By simulating trajectories in learned models, agents can explore more efficiently than model-free methods.',
    'word-embeddings': 'Word embeddings represent words as dense vectors that capture semantic relationships. Techniques like Word2Vec and GloVe learn embeddings where similar words have similar vectors, enabling powerful language understanding.',
    'seq2seq': 'Sequence-to-sequence models map input sequences to output sequences of potentially different lengths. With attention mechanisms, they excel at tasks like machine translation, summarization, and conversational AI.',
    'bert-transformers': 'BERT and modern transformer models use bidirectional self-attention and pre-training on massive datasets. Fine-tuning these models on downstream tasks achieves state-of-the-art results across NLP with minimal task-specific architecture.',
  }
  return overviews[topicId] || 'Comprehensive guide to this PyTorch topic.'
}

function getKeyConcepts(topicId: string) {
  const concepts: Record<string, Array<{ title: string; description: string }>> = {
    'pytorch-intro': [
      { title: 'Dynamic Computational Graphs', description: 'PyTorch builds graphs on-the-fly as code executes, making debugging intuitive and enabling control-flow-dependent architectures that static graphs cannot express naturally.' },
      { title: 'Pythonic API', description: 'PyTorch feels like native Python. You can use standard debuggers, printouts and data structures, which dramatically shortens the iteration loop compared to graph-compile frameworks.' },
      { title: 'The Ecosystem', description: 'torchvision, torchaudio, torchtext, TorchServe, PyTorch Lightning, and Hugging Face Transformers provide production-ready building blocks on top of core PyTorch.' },
      { title: 'GPU Acceleration with CUDA', description: 'PyTorch transparently dispatches tensor ops to CUDA kernels. A single .to("cuda") call moves your computation to the GPU for orders-of-magnitude speedups.' },
      { title: 'Installation & Setup', description: 'Install via pip or conda matching your CUDA version. Verify with torch.cuda.is_available() and torch.__version__ before starting any project.' },
    ],
    'tensor-fundamentals': [
      { title: 'Tensor Creation', description: 'Learn multiple ways to create tensors including torch.tensor(), torch.zeros(), torch.ones(), torch.rand(), and torch.randn(). Understand when to use each method.' },
      { title: 'Tensor Properties', description: 'Every tensor has a shape (size), dtype (data type), and device (CPU or GPU). Understanding these properties is crucial for working with tensors effectively.' },
      { title: 'Tensor Operations', description: 'PyTorch supports a wide variety of mathematical operations on tensors including element-wise operations, matrix multiplication, reductions, and more.' },
      { title: 'In-place Operations', description: 'Operations with an underscore suffix (e.g., add_()) modify tensors in-place. Use these carefully as they can interfere with autograd.' },
      { title: 'GPU Acceleration', description: 'Move tensors to GPU using .to(device) or .cuda() for massive performance improvements in compute-intensive operations.' },
    ],
    'tensor-broadcasting': [
      { title: 'Broadcasting Rules', description: 'Shapes are aligned from the trailing dimension. Two dimensions are compatible if they are equal or one of them is 1. Missing dimensions are treated as 1.' },
      { title: 'Implicit Expansion', description: 'Broadcasting expands tensors without copying memory, enabling concise code like adding a (N,) bias to a (B, N) activation without loops.' },
      { title: 'Advanced Indexing', description: 'Integer, slice, boolean, and tensor indexing let you read or write arbitrary subsets. Boolean masks (x[x > 0]) are especially powerful for conditional selection.' },
      { title: 'Gather & Scatter', description: 'torch.gather and torch.scatter perform indexed reads/writes along a given dimension and are essential for efficient attention, embedding lookup, and loss computation.' },
      { title: 'Memory Layout & Contiguity', description: 'Operations like transpose() and permute() return non-contiguous views. Call .contiguous() before .view() to avoid RuntimeErrors.' },
    ],
    'autograd-basics': [
      { title: 'Computational Graphs', description: 'PyTorch builds a dynamic computational graph as you perform operations. Each operation creates a node in the graph, enabling automatic differentiation.' },
      { title: 'requires_grad', description: 'Set requires_grad=True on tensors to track all operations on them. This enables gradient computation during backpropagation.' },
      { title: 'Backward Pass', description: 'Call .backward() on a scalar tensor to compute gradients. Gradients accumulate in the .grad attribute of tensors.' },
      { title: 'Gradient Accumulation', description: 'Gradients accumulate by default. Call .zero_grad() on optimizers or tensors to clear gradients before each backward pass.' },
      { title: 'no_grad Context', description: 'Use torch.no_grad() context manager during inference to disable gradient tracking and save memory.' },
    ],
    'nn-module': [
      { title: 'Module Basics', description: 'Subclass nn.Module to create custom neural network components. Define layers in __init__ and computation in forward().' },
      { title: 'Layer Types', description: 'PyTorch provides many built-in layers: nn.Linear for fully connected layers, nn.Conv2d for convolutions, nn.LSTM for recurrent layers, and many more.' },
      { title: 'Activation Functions', description: 'Common activation functions include nn.ReLU, nn.Sigmoid, nn.Tanh, and nn.GELU. Choose based on your network architecture and task.' },
      { title: 'Parameter Management', description: 'nn.Module automatically tracks all parameters in its submodules. Access them via .parameters() or .named_parameters().' },
      { title: 'Module Composition', description: 'Build complex architectures by composing simpler modules. Use nn.Sequential for simple sequential stacking or create custom compositions.' },
    ],
    'cnn-architectures': [
      { title: 'Convolution Operation', description: 'Conv2d slides a small learnable kernel over the input, sharing weights spatially to detect local patterns with far fewer parameters than a dense layer.' },
      { title: 'Pooling Layers', description: 'MaxPool and AvgPool downsample feature maps, providing translation invariance and reducing compute in deeper layers.' },
      { title: 'Batch Normalization', description: 'BatchNorm normalizes activations per-channel across the batch, stabilizing training and allowing higher learning rates.' },
      { title: 'Receptive Field', description: 'Stacking convolutions grows the effective receptive field. Understanding it is key to designing networks that can "see" the relevant context.' },
      { title: 'Classic Architectures', description: 'LeNet, AlexNet, VGG, ResNet, and EfficientNet represent milestones. ResNet\'s skip connections, in particular, made very deep networks trainable.' },
    ],
    'rnn-lstm': [
      { title: 'Recurrence & Hidden State', description: 'RNNs maintain a hidden vector that is updated at each timestep, letting the model condition predictions on arbitrary past context.' },
      { title: 'Vanishing Gradients', description: 'Plain RNNs suffer from vanishing/exploding gradients over long sequences, which motivated gated architectures like LSTM and GRU.' },
      { title: 'LSTM Gates', description: 'Input, forget, and output gates control what information enters, persists in, and leaves the cell state — the core mechanism behind long-term memory.' },
      { title: 'GRU Simplification', description: 'GRUs merge the forget and input gates into an update gate with fewer parameters, often matching LSTM performance.' },
      { title: 'Sequence Packing', description: 'pack_padded_sequence skips padding tokens so the RNN only computes on real data, dramatically speeding up variable-length batches.' },
    ],
    'transformers': [
      { title: 'Self-Attention', description: 'Each token computes Query, Key, and Value projections and attends to every other token via softmax(QK^T / sqrt(d)) V — enabling parallel long-range modeling.' },
      { title: 'Multi-Head Attention', description: 'Running attention in parallel across multiple heads lets the model jointly attend to different representation subspaces.' },
      { title: 'Positional Encoding', description: 'Since attention is permutation-invariant, positional encodings (sinusoidal or learned) inject order information into token embeddings.' },
      { title: 'Encoder / Decoder Blocks', description: 'A transformer block is self-attention + feed-forward network with residual connections and LayerNorm. Stacking them yields models like BERT and GPT.' },
      { title: 'Scaling Laws', description: 'Transformer performance scales predictably with parameters, data and compute — the foundation of today\'s large language models.' },
    ],
    'loss-functions': [
      { title: 'MSE & L1 for Regression', description: 'MSELoss penalizes squared error and is sensitive to outliers; L1Loss (MAE) is more robust. SmoothL1Loss / HuberLoss interpolate between the two.' },
      { title: 'Cross-Entropy for Classification', description: 'nn.CrossEntropyLoss combines LogSoftmax and NLLLoss, expects raw logits and integer class targets — never pre-apply softmax.' },
      { title: 'BCE for Binary / Multi-Label', description: 'BCEWithLogitsLoss is numerically stable and supports pos_weight for class imbalance, making it the standard for multi-label problems.' },
      { title: 'Custom Losses', description: 'Any differentiable function of model outputs and targets can be a loss. Implement as a function or subclass nn.Module for stateful losses.' },
      { title: 'Reduction Modes', description: '"mean", "sum", and "none" control how per-sample losses are aggregated. Use "none" when you need per-example weighting.' },
    ],
    'optimizers': [
      { title: 'SGD & Momentum', description: 'Plain SGD is simple and well-understood; adding momentum smooths updates and accelerates convergence along consistent directions.' },
      { title: 'Adam & AdamW', description: 'Adam adapts learning rates per parameter using running estimates of first and second moments. AdamW decouples weight decay from the gradient update, improving generalization.' },
      { title: 'Learning Rate Schedulers', description: 'StepLR, CosineAnnealingLR, and OneCycleLR adjust the learning rate during training. A good schedule often matters more than the optimizer choice.' },
      { title: 'Weight Decay & Regularization', description: 'Weight decay (L2 regularization) shrinks parameters towards zero, reducing overfitting. AdamW applies it correctly outside the moment estimates.' },
      { title: 'Gradient Clipping', description: 'clip_grad_norm_ caps the total gradient norm, stabilizing training for RNNs and transformers where gradients can explode.' },
    ],
    'training-loop': [
      { title: 'Forward-Backward-Step', description: 'Every training step: zero gradients, forward pass, compute loss, loss.backward(), optimizer.step(). Any deviation is a red flag.' },
      { title: 'Train vs Eval Modes', description: 'model.train() enables Dropout and BatchNorm updates; model.eval() disables them. Always switch modes correctly around validation.' },
      { title: 'Validation & Early Stopping', description: 'Evaluate on a held-out set each epoch, track the best metric, and stop training when it stops improving to avoid wasted compute and overfitting.' },
      { title: 'Checkpointing', description: 'Save model.state_dict(), optimizer.state_dict(), epoch and best-metric to resume training and to recover from crashes.' },
      { title: 'Mixed Precision', description: 'torch.cuda.amp autocast + GradScaler give near-FP16 speed with FP32 accuracy — often a free ~2x speedup on modern GPUs.' },
    ],
    'custom-autograd': [
      { title: 'torch.autograd.Function', description: 'Subclass Function and implement static forward/backward methods to define your own differentiable op with a custom backward rule.' },
      { title: 'Context Object (ctx)', description: 'Use ctx.save_for_backward to stash tensors needed in backward. Non-tensor data can be stored on ctx attributes directly.' },
      { title: 'gradcheck', description: 'torch.autograd.gradcheck numerically verifies your analytical backward against finite differences — the standard safety net when writing custom ops.' },
      { title: 'Gradient Hooks', description: 'register_hook on a tensor or module lets you inspect or modify gradients mid-backward — useful for debugging and techniques like gradient reversal.' },
      { title: 'When to Customize', description: 'Use custom Functions for non-standard math, to fuse ops for speed, or to implement tricks like straight-through estimators and gradient reversal layers.' },
    ],
    'distributed-training': [
      { title: 'DataParallel vs DistributedDataParallel', description: 'DP is single-process/multi-GPU and slow; DDP runs one process per GPU with NCCL all-reduce and is the recommended choice for any serious training job.' },
      { title: 'Process Groups', description: 'torch.distributed.init_process_group sets up communication. Each process has a unique rank; rank 0 usually handles logging and checkpointing.' },
      { title: 'DistributedSampler', description: 'Ensures each process sees a disjoint subset of the dataset per epoch. Call sampler.set_epoch(epoch) to shuffle deterministically across ranks.' },
      { title: 'Gradient Synchronization', description: 'DDP averages gradients across ranks in the backward pass via all-reduce. no_sync() context skips it for gradient accumulation steps.' },
      { title: 'FSDP & Model Parallelism', description: 'FullyShardedDataParallel shards parameters, gradients and optimizer state across GPUs, enabling training of models larger than a single device.' },
    ],
    'model-optimization': [
      { title: 'Quantization', description: 'Convert weights/activations from FP32 to INT8. Dynamic, static, and quantization-aware training trade off accuracy and deployment effort.' },
      { title: 'Pruning', description: 'torch.nn.utils.prune zeros out unimportant weights by magnitude or structured criteria, shrinking models with minimal accuracy loss.' },
      { title: 'TorchScript & torch.compile', description: 'Trace or script models into a graph IR for deployment. torch.compile (PyTorch 2.x) further fuses ops for speedups with minimal code changes.' },
      { title: 'ONNX Export', description: 'Export to ONNX for cross-framework inference on runtimes like ONNX Runtime, TensorRT and CoreML.' },
      { title: 'Knowledge Distillation', description: 'Train a small "student" model to mimic a large "teacher" — often recovers most of the teacher\'s accuracy at a fraction of the cost.' },
    ],
    'cv-fundamentals': [
      { title: 'Datasets & DataLoaders', description: 'torchvision.datasets + torch.utils.data.DataLoader provide batched, shuffled, multi-worker iteration that keeps the GPU fed.' },
      { title: 'Transforms', description: 'torchvision.transforms (v2) compose preprocessing and augmentation. Normalize with ImageNet stats when using pretrained backbones.' },
      { title: 'Data Augmentation', description: 'Random crops, flips, color jitter, RandAugment, and MixUp/CutMix expand the effective dataset size and improve generalization.' },
      { title: 'Pretrained Backbones', description: 'torchvision.models offers ResNet, EfficientNet, ViT etc. with ImageNet weights — fine-tune rather than train from scratch whenever possible.' },
      { title: 'Transfer Learning', description: 'Freeze lower layers and train only the classifier head on small datasets; unfreeze gradually for best results.' },
    ],
    'object-detection': [
      { title: 'Two-Stage vs One-Stage', description: 'R-CNN family (two-stage) first proposes regions then classifies them; YOLO/SSD (one-stage) predict boxes and classes in a single pass for real-time speed.' },
      { title: 'Anchor Boxes', description: 'Predefined boxes at multiple scales and aspect ratios serve as priors that the network refines — a key ingredient in Faster R-CNN, RetinaNet and SSD.' },
      { title: 'IoU & Non-Max Suppression', description: 'Intersection-over-Union measures box overlap. NMS removes duplicate detections of the same object by keeping the highest-scoring box above a threshold.' },
      { title: 'Loss Components', description: 'Detection losses combine box regression (Smooth L1 / GIoU) and classification (cross-entropy or focal loss for class imbalance).' },
      { title: 'mAP Evaluation', description: 'Mean Average Precision across IoU thresholds is the standard metric — COCO uses mAP@[.5:.95] averaged over 10 thresholds.' },
    ],
    'image-segmentation': [
      { title: 'Semantic vs Instance Segmentation', description: 'Semantic labels each pixel with a class; instance additionally distinguishes separate objects of the same class.' },
      { title: 'Encoder-Decoder / U-Net', description: 'Downsampling encoder captures context, upsampling decoder recovers resolution, and skip connections fuse fine spatial detail.' },
      { title: 'Mask R-CNN', description: 'Extends Faster R-CNN with a parallel mask branch that predicts a binary mask per Region-of-Interest — the go-to for instance segmentation.' },
      { title: 'Dice & IoU Losses', description: 'Pixel cross-entropy alone is biased toward large classes; combining it with Dice or IoU loss greatly improves segmentation of small objects.' },
      { title: 'Panoptic Segmentation', description: 'Unifies semantic (stuff) and instance (things) segmentation into a single per-pixel prediction of (class, instance_id).' },
    ],
    'pose-estimation': [
      { title: 'Keypoints & Skeletons', description: 'A pose is represented as 2D or 3D coordinates for body joints, connected by a predefined skeleton (e.g., COCO\'s 17 keypoints).' },
      { title: 'Heatmap Regression', description: 'Predict a per-keypoint Gaussian heatmap and take its argmax — more robust than directly regressing coordinates.' },
      { title: 'Top-Down vs Bottom-Up', description: 'Top-down first detects people then estimates each person\'s pose (e.g., HRNet); bottom-up detects all keypoints then groups them (e.g., OpenPose).' },
      { title: 'Temporal Consistency', description: 'For video, smooth predictions across frames (Kalman filter, one-euro filter) to remove jitter and improve tracking.' },
      { title: 'OKS Evaluation', description: 'Object Keypoint Similarity plays the role IoU does in detection: it measures how close predicted keypoints are to ground-truth, normalized by scale.' },
    ],
    'gan-basics': [
      { title: 'Generator vs Discriminator', description: 'G maps random noise z to fake samples; D classifies samples as real or fake. They are trained adversarially in a two-player minimax game.' },
      { title: 'Minimax Loss', description: 'The classical objective is min_G max_D E[log D(x)] + E[log(1 - D(G(z)))] — in practice we use the non-saturating generator loss for better gradients.' },
      { title: 'Training Instability', description: 'GANs can suffer from mode collapse, vanishing gradients and oscillation. Label smoothing, noise injection and balanced updates help.' },
      { title: 'Latent Space', description: 'The noise vector z parametrizes the space of generated samples. Interpolating in z-space produces semantically smooth transitions in output.' },
      { title: 'Evaluation: FID & IS', description: 'Fréchet Inception Distance and Inception Score quantify sample quality and diversity by comparing feature statistics to real data.' },
    ],
    'dcgan': [
      { title: 'All-Convolutional Architecture', description: 'Replace pooling with strided convolutions (D) and fractionally-strided convolutions (G), letting the network learn its own spatial downsampling/upsampling.' },
      { title: 'BatchNorm Everywhere', description: 'BatchNorm in both G and D (except G output and D input) stabilizes training and helps gradient flow in deep GANs.' },
      { title: 'ReLU / LeakyReLU', description: 'ReLU in G (Tanh at the output), LeakyReLU in D. This asymmetry empirically gives healthier gradient signals in the discriminator.' },
      { title: 'Adam with β1 = 0.5', description: 'Lowering Adam\'s β1 momentum from 0.9 to 0.5 is a small but crucial tweak that markedly improves DCGAN stability.' },
      { title: 'Latent Arithmetic', description: 'DCGANs first showed that z-space supports semantic arithmetic (e.g., "man with glasses" − "man" + "woman" ≈ "woman with glasses").' },
    ],
    'stylegan': [
      { title: 'Mapping Network', description: 'An 8-layer MLP maps z → w, disentangling the latent space so that different factors of variation occupy different directions.' },
      { title: 'Adaptive Instance Normalization', description: 'AdaIN injects the style vector w into each layer, controlling the statistics of feature maps — this is what gives StyleGAN its name.' },
      { title: 'Progressive / Multi-Scale Growing', description: 'StyleGAN(1) grows the generator from low to high resolution during training. StyleGAN2/3 replace growing with skip connections for cleaner results.' },
      { title: 'Noise Injection', description: 'Per-pixel noise added at every layer provides stochastic variation (hair, freckles) without affecting high-level structure.' },
      { title: 'Style Mixing & Truncation', description: 'Combining w vectors from different samples across layers enables fine-grained style control; truncation trades diversity for fidelity.' },
    ],
    'wgan': [
      { title: 'Earth-Mover Distance', description: 'WGAN replaces JS-divergence with the Wasserstein-1 distance, which is continuous and differentiable almost everywhere — even when real/fake supports don\'t overlap.' },
      { title: 'Critic, not Discriminator', description: 'The discriminator becomes a "critic" that outputs an unbounded score. Remove the final sigmoid and the log in the loss.' },
      { title: 'Weight Clipping (WGAN)', description: 'Original WGAN enforces 1-Lipschitz by clipping critic weights to [-c, c]. Simple but can lead to capacity underuse.' },
      { title: 'Gradient Penalty (WGAN-GP)', description: 'Penalizing the critic\'s gradient norm to be 1 on interpolated samples replaces clipping and yields far more stable, higher-quality training.' },
      { title: 'Meaningful Loss Curve', description: 'Unlike vanilla GAN loss, the Wasserstein critic loss correlates with sample quality — a genuinely useful training signal to monitor.' },
    ],
    'diffusion-models': [
      { title: 'Forward Noising Process', description: 'A fixed Markov chain gradually adds Gaussian noise to data over T steps until it is pure noise — this defines the target distribution for the reverse process.' },
      { title: 'Reverse Denoising Network', description: 'A U-Net is trained to predict the noise added at each timestep. Iteratively denoising pure noise yields a sample from the data distribution.' },
      { title: 'Simplified ε-Prediction Loss', description: 'DDPM\'s core insight: the ELBO reduces to a simple MSE between predicted and true noise at a random timestep — stable and easy to train.' },
      { title: 'Classifier-Free Guidance', description: 'Jointly train conditional and unconditional models, then combine their predictions at sampling time to trade diversity for prompt fidelity.' },
      { title: 'DDIM & Fast Sampling', description: 'DDIM gives a non-Markovian deterministic sampler that needs 10–50 steps instead of 1000, making diffusion practical for real-time use.' },
    ],
    'rl-basics': [
      { title: 'Markov Decision Processes', description: 'An MDP is a tuple (S, A, P, R, γ) of states, actions, transition dynamics, rewards and discount factor — the mathematical foundation of RL.' },
      { title: 'Policies & Value Functions', description: 'A policy π(a|s) picks actions; V^π(s) and Q^π(s,a) measure expected return from a state (and action) under π.' },
      { title: 'Bellman Equations', description: 'Recursive relations that express V and Q in terms of immediate reward plus discounted future value — the backbone of dynamic programming and TD learning.' },
      { title: 'Exploration vs Exploitation', description: 'ε-greedy, softmax policies, and entropy bonuses force the agent to try suboptimal actions so it can discover better long-term strategies.' },
      { title: 'On-Policy vs Off-Policy', description: 'On-policy methods (SARSA, PPO) learn from the current policy\'s experience; off-policy methods (Q-learning, DQN) can learn from any trajectory — often via a replay buffer.' },
    ],
    'dqn': [
      { title: 'Q-Network', description: 'A neural network approximates Q(s, a). For discrete actions it outputs one value per action, allowing fast greedy selection.' },
      { title: 'Experience Replay', description: 'Store (s, a, r, s\') transitions in a buffer and train on random minibatches — breaks correlations between consecutive samples and reuses data efficiently.' },
      { title: 'Target Network', description: 'A periodically-updated copy of the Q-network provides stable TD targets, preventing the instability of bootstrapping from a moving target.' },
      { title: 'Double DQN', description: 'Use the online network to pick the next-state action and the target network to evaluate it, reducing the overestimation bias of vanilla DQN.' },
      { title: 'Dueling & Prioritized Replay', description: 'Dueling architectures separate state-value and advantage streams; prioritized replay samples high-TD-error transitions more often. Both measurably improve performance.' },
    ],
    'policy-gradient': [
      { title: 'REINFORCE', description: 'The basic policy gradient: ∇J(θ) = E[∇log π(a|s) · G_t]. Directly optimizes expected return but suffers from high variance.' },
      { title: 'Baselines & Advantage', description: 'Subtracting a baseline V(s) from the return yields the advantage A(s,a). It reduces variance without adding bias — the foundation of actor-critic methods.' },
      { title: 'Actor-Critic', description: 'An actor (policy) and a critic (value function) are trained jointly: the critic evaluates actions, the actor improves using the critic\'s feedback.' },
      { title: 'A2C / A3C', description: 'Advantage Actor-Critic variants use multiple parallel environments (synchronous in A2C, asynchronous in A3C) to decorrelate samples and accelerate training.' },
      { title: 'Entropy Regularization', description: 'Adding an entropy bonus to the policy loss prevents premature collapse to a deterministic policy and encourages exploration.' },
    ],
    'ppo-trpo': [
      { title: 'Trust Region Motivation', description: 'Large policy updates can be catastrophic. TRPO and PPO constrain each update so the new policy stays close to the old one.' },
      { title: 'TRPO', description: 'Enforces a hard KL-divergence constraint and solves a constrained optimization per step using conjugate gradient + line search. Theoretically solid, practically complex.' },
      { title: 'PPO Clipped Objective', description: 'PPO replaces TRPO\'s hard constraint with a clipped surrogate: min(r·A, clip(r, 1-ε, 1+ε)·A), giving similar stability with plain SGD.' },
      { title: 'Generalized Advantage Estimation', description: 'GAE(λ) interpolates between high-bias TD(0) and high-variance Monte-Carlo advantage estimates — almost always used with PPO.' },
      { title: 'Multiple Epochs per Rollout', description: 'PPO reuses each batch of collected experience for several epochs of minibatch SGD, dramatically improving sample efficiency over REINFORCE.' },
    ],
    'model-based-rl': [
      { title: 'Learned Dynamics Model', description: 'Instead of (or in addition to) a value/policy, learn f(s, a) → s\' and r. A good model lets the agent plan or simulate rollouts.' },
      { title: 'Planning with a Model', description: 'Classical planners (MPC, CEM, MCTS) search over action sequences under the learned model to pick the next action — as in MuZero and PETS.' },
      { title: 'Dyna-Style Algorithms', description: 'Dyna interleaves real experience with simulated rollouts from the learned model, boosting sample efficiency of model-free learners.' },
      { title: 'World Models', description: 'Encode observations to a compact latent, learn dynamics in latent space, and train the policy inside the "dream". Powers Dreamer and friends.' },
      { title: 'Uncertainty & Model Error', description: 'Ensembles of dynamics models capture epistemic uncertainty, preventing the policy from exploiting regions where the model is wrong.' },
    ],
    'word-embeddings': [
      { title: 'Distributed Representations', description: 'Represent each word as a dense low-dimensional vector. Semantically similar words end up close in this space — a dramatic improvement over sparse one-hot encodings.' },
      { title: 'Word2Vec: CBOW & Skip-Gram', description: 'CBOW predicts a word from its context; Skip-Gram predicts context from a word. Both are trained with negative sampling or hierarchical softmax.' },
      { title: 'GloVe', description: 'Factorizes the global word-word co-occurrence matrix, blending count-based and predictive approaches into a single objective.' },
      { title: 'nn.Embedding Layer', description: 'A learnable lookup table mapping token IDs to vectors. Can be initialized from pretrained vectors and fine-tuned (or frozen) during training.' },
      { title: 'Contextual Embeddings', description: 'ELMo, BERT and GPT produce vectors that depend on context, resolving ambiguity (e.g., "bank" in "river bank" vs "investment bank").' },
    ],
    'seq2seq': [
      { title: 'Encoder-Decoder Architecture', description: 'An encoder compresses the input sequence into a representation; a decoder generates the output sequence one token at a time conditioned on it.' },
      { title: 'Teacher Forcing', description: 'During training, feed the decoder the ground-truth previous token instead of its own prediction. Speeds up learning but can cause exposure bias at inference.' },
      { title: 'Attention Mechanism', description: 'Instead of relying on a single context vector, the decoder attends to all encoder hidden states — the breakthrough that made seq2seq work at length.' },
      { title: 'Beam Search', description: 'At inference, keep the top-k partial hypotheses at each step and expand them. Produces noticeably better translations than greedy decoding.' },
      { title: 'Applications', description: 'Machine translation, summarization, speech-to-text, code generation and dialogue systems all fit the seq2seq mold.' },
    ],
    'bert-transformers': [
      { title: 'Masked Language Modeling', description: 'BERT randomly masks ~15% of tokens and trains the model to predict them using both left and right context — enabling deeply bidirectional representations.' },
      { title: 'Pretraining / Fine-Tuning', description: 'Pretrain once on huge unlabeled corpora, then fine-tune on small task-specific datasets. This paradigm now dominates NLP.' },
      { title: 'Tokenization (BPE / WordPiece)', description: 'Subword tokenizers balance vocabulary size and out-of-vocabulary robustness, representing any string as a sequence of known pieces.' },
      { title: 'Hugging Face Transformers', description: 'The transformers library gives a unified API (AutoModel, AutoTokenizer, Trainer) to thousands of pretrained checkpoints — the de facto standard.' },
      { title: 'Parameter-Efficient Fine-Tuning', description: 'LoRA, adapters and prompt tuning update only a small number of extra parameters, making huge models fine-tunable on commodity hardware.' },
    ],
  }
  
  return concepts[topicId] || [
    { title: 'Core Concept 1', description: 'Fundamental understanding of this topic is essential for advanced PyTorch development.' },
    { title: 'Core Concept 2', description: 'Master the key techniques and best practices for this area.' },
    { title: 'Core Concept 3', description: 'Learn how to apply these concepts to real-world problems effectively.' },
  ]
}

function getCodeExample(topicId: string): string {
  const examples: Record<string, string> = {
    'pytorch-intro': `import torch

# Verify your installation
print(torch.__version__)
print("CUDA available:", torch.cuda.is_available())

# Pick a device once and reuse it
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Create a tensor and move it to the chosen device
x = torch.randn(3, 3, device=device)
print(x)
print("Device:", x.device, "| Dtype:", x.dtype)`,

    'tensor-fundamentals': `import torch

# Creating tensors
x = torch.tensor([1, 2, 3, 4, 5])
zeros = torch.zeros(3, 3)
random = torch.randn(2, 4)

# Tensor operations
a = torch.tensor([[1, 2], [3, 4]])
b = torch.tensor([[5, 6], [7, 8]])

sum_result = a + b
product = torch.mm(a, b)  # Matrix multiplication
element_wise = a * b

# Moving to GPU
if torch.cuda.is_available():
    a_gpu = a.cuda()
    # or a_gpu = a.to('cuda')`,

    'tensor-broadcasting': `import torch

# Broadcasting: (3, 1) + (1, 4) -> (3, 4)
a = torch.tensor([[1.], [2.], [3.]])   # shape (3, 1)
b = torch.tensor([[10., 20., 30., 40.]])  # shape (1, 4)
print((a + b).shape)  # torch.Size([3, 4])

# Add a per-feature bias to every row in a batch
batch = torch.randn(32, 128)
bias = torch.randn(128)
out = batch + bias  # bias is broadcast over the batch dimension

# Boolean masking
x = torch.randn(5)
positive = x[x > 0]

# gather / scatter
logits = torch.randn(4, 10)
labels = torch.tensor([3, 7, 1, 9])
chosen = logits.gather(1, labels.unsqueeze(1)).squeeze(1)`,

    'autograd-basics': `import torch

# Create tensors with gradient tracking
x = torch.tensor([2.0], requires_grad=True)
y = torch.tensor([3.0], requires_grad=True)

# Forward pass
z = x**2 + y**3

# Compute gradients
z.backward()

print(f"dz/dx = {x.grad}")  # 2x = 4.0
print(f"dz/dy = {y.grad}")  # 3y^2 = 27.0

# Gradient accumulation
x.grad.zero_()  # Clear gradients
z2 = x**3
z2.backward()
print(f"dz2/dx = {x.grad}")  # 3x^2 = 12.0`,

    'nn-module': `import torch
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x

# Instantiate and use
model = SimpleNet(784, 128, 10)
input_data = torch.randn(32, 784)
output = model(input_data)`,

    'cnn-architectures': `import torch
import torch.nn as nn

class SmallCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(64, num_classes),
        )

    def forward(self, x):
        return self.classifier(self.features(x))

model = SmallCNN()
out = model(torch.randn(8, 3, 32, 32))
print(out.shape)  # torch.Size([8, 10])`,

    'rnn-lstm': `import torch
import torch.nn as nn

class LSTMClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim,
                            num_layers=2, batch_first=True,
                            bidirectional=True, dropout=0.3)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)

    def forward(self, x):
        e = self.embed(x)
        out, (h, c) = self.lstm(e)
        # Concatenate the last forward and backward hidden states
        h_cat = torch.cat([h[-2], h[-1]], dim=-1)
        return self.fc(h_cat)

model = LSTMClassifier(vocab_size=5000, embed_dim=128,
                       hidden_dim=256, num_classes=3)
logits = model(torch.randint(0, 5000, (16, 40)))`,

    'transformers': `import torch
import torch.nn as nn

# A single encoder block using the built-in PyTorch implementation
encoder_layer = nn.TransformerEncoderLayer(
    d_model=512, nhead=8, dim_feedforward=2048,
    dropout=0.1, batch_first=True, norm_first=True,
)
encoder = nn.TransformerEncoder(encoder_layer, num_layers=6)

# (batch, seq, d_model)
x = torch.randn(32, 100, 512)
# Optional padding mask (True = position is PAD and should be ignored)
pad_mask = torch.zeros(32, 100, dtype=torch.bool)

out = encoder(x, src_key_padding_mask=pad_mask)
print(out.shape)  # torch.Size([32, 100, 512])`,

    'loss-functions': `import torch
import torch.nn as nn

# Regression
pred_r, target_r = torch.randn(16, 1), torch.randn(16, 1)
mse = nn.MSELoss()(pred_r, target_r)

# Multi-class classification (logits, integer targets)
logits = torch.randn(16, 10)
targets = torch.randint(0, 10, (16,))
ce = nn.CrossEntropyLoss()(logits, targets)

# Multi-label / binary classification
probs_logits = torch.randn(16, 5)
multi_targets = torch.randint(0, 2, (16, 5)).float()
bce = nn.BCEWithLogitsLoss()(probs_logits, multi_targets)

print(mse.item(), ce.item(), bce.item())`,

    'optimizers': `import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

model = nn.Linear(128, 10)

# Separate weight-decay for weights vs biases/norms
decay, no_decay = [], []
for name, p in model.named_parameters():
    if p.ndim == 1 or name.endswith(".bias"):
        no_decay.append(p)
    else:
        decay.append(p)

optimizer = AdamW(
    [{"params": decay, "weight_decay": 1e-2},
     {"params": no_decay, "weight_decay": 0.0}],
    lr=3e-4, betas=(0.9, 0.999),
)
scheduler = CosineAnnealingLR(optimizer, T_max=100)

for epoch in range(100):
    # ... training steps ...
    scheduler.step()`,

    'training-loop': `import torch
from torch.utils.data import DataLoader

def train_one_epoch(model, loader, loss_fn, optimizer, device):
    model.train()
    total = 0.0
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad()
        loss = loss_fn(model(x), y)
        loss.backward()
        optimizer.step()
        total += loss.item() * x.size(0)
    return total / len(loader.dataset)

@torch.no_grad()
def evaluate(model, loader, loss_fn, device):
    model.eval()
    total = 0.0
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        total += loss_fn(model(x), y).item() * x.size(0)
    return total / len(loader.dataset)`,

    'custom-autograd': `import torch
from torch.autograd import Function

class MyReLU(Function):
    @staticmethod
    def forward(ctx, x):
        ctx.save_for_backward(x)
        return x.clamp(min=0)

    @staticmethod
    def backward(ctx, grad_out):
        (x,) = ctx.saved_tensors
        grad_in = grad_out.clone()
        grad_in[x < 0] = 0
        return grad_in

# Use via .apply
x = torch.randn(4, requires_grad=True)
y = MyReLU.apply(x).sum()
y.backward()

# Verify correctness numerically
torch.autograd.gradcheck(MyReLU.apply,
                         (torch.randn(4, dtype=torch.double,
                                      requires_grad=True),))`,

    'distributed-training': `# Run with: torchrun --nproc_per_node=4 train.py
import os, torch
import torch.distributed as dist
import torch.nn as nn
from torch.nn.parallel import DistributedDataParallel as DDP

def setup():
    dist.init_process_group("nccl")
    torch.cuda.set_device(int(os.environ["LOCAL_RANK"]))

def main():
    setup()
    rank = dist.get_rank()
    device = torch.device("cuda", int(os.environ["LOCAL_RANK"]))

    model = nn.Linear(128, 10).to(device)
    model = DDP(model, device_ids=[device.index])

    opt = torch.optim.AdamW(model.parameters(), lr=3e-4)
    for step in range(100):
        x = torch.randn(32, 128, device=device)
        y = torch.randint(0, 10, (32,), device=device)
        opt.zero_grad()
        loss = nn.functional.cross_entropy(model(x), y)
        loss.backward()
        opt.step()
        if rank == 0 and step % 10 == 0:
            print(step, loss.item())

    dist.destroy_process_group()

if __name__ == "__main__":
    main()`,

    'model-optimization': `import torch
import torch.nn as nn

model = nn.Sequential(nn.Linear(128, 64), nn.ReLU(), nn.Linear(64, 10))
model.eval()

# 1. Dynamic quantization (CPU inference)
quantized = torch.ao.quantization.quantize_dynamic(
    model, {nn.Linear}, dtype=torch.qint8
)

# 2. TorchScript export
example = torch.randn(1, 128)
scripted = torch.jit.trace(model, example)
scripted.save("model.pt")

# 3. ONNX export
torch.onnx.export(
    model, example, "model.onnx",
    input_names=["x"], output_names=["y"],
    dynamic_axes={"x": {0: "batch"}, "y": {0: "batch"}},
    opset_version=17,
)`,

    'cv-fundamentals': `import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

train_tf = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(0.2, 0.2, 0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

train_ds = datasets.ImageFolder("data/train", transform=train_tf)
train_loader = DataLoader(train_ds, batch_size=64, shuffle=True,
                          num_workers=4, pin_memory=True)

from torchvision.models import resnet18, ResNet18_Weights
model = resnet18(weights=ResNet18_Weights.DEFAULT)
model.fc = torch.nn.Linear(model.fc.in_features, len(train_ds.classes))`,

    'object-detection': `import torch
from torchvision.models.detection import (
    fasterrcnn_resnet50_fpn_v2, FasterRCNN_ResNet50_FPN_V2_Weights,
)

weights = FasterRCNN_ResNet50_FPN_V2_Weights.DEFAULT
model = fasterrcnn_resnet50_fpn_v2(weights=weights)
model.eval()

# Inference on a single image
img = torch.rand(3, 480, 640)
with torch.no_grad():
    predictions = model([img])

boxes  = predictions[0]["boxes"]   # (N, 4)
scores = predictions[0]["scores"]  # (N,)
labels = predictions[0]["labels"]  # (N,)

# Keep confident detections
keep = scores > 0.5
print(boxes[keep], labels[keep])`,

    'image-segmentation': `import torch
import torch.nn as nn
import torch.nn.functional as F

def conv_block(in_c, out_c):
    return nn.Sequential(
        nn.Conv2d(in_c, out_c, 3, padding=1), nn.ReLU(inplace=True),
        nn.Conv2d(out_c, out_c, 3, padding=1), nn.ReLU(inplace=True),
    )

class UNetTiny(nn.Module):
    def __init__(self, n_classes):
        super().__init__()
        self.d1 = conv_block(3, 32)
        self.d2 = conv_block(32, 64)
        self.bottleneck = conv_block(64, 128)
        self.up2 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.u2 = conv_block(128, 64)
        self.up1 = nn.ConvTranspose2d(64, 32, 2, stride=2)
        self.u1 = conv_block(64, 32)
        self.out = nn.Conv2d(32, n_classes, 1)

    def forward(self, x):
        s1 = self.d1(x)
        s2 = self.d2(F.max_pool2d(s1, 2))
        b  = self.bottleneck(F.max_pool2d(s2, 2))
        x  = self.u2(torch.cat([self.up2(b),  s2], 1))
        x  = self.u1(torch.cat([self.up1(x), s1], 1))
        return self.out(x)`,

    'pose-estimation': `import torch
from torchvision.models.detection import (
    keypointrcnn_resnet50_fpn, KeypointRCNN_ResNet50_FPN_Weights,
)

weights = KeypointRCNN_ResNet50_FPN_Weights.DEFAULT
model = keypointrcnn_resnet50_fpn(weights=weights)
model.eval()

img = torch.rand(3, 480, 640)
with torch.no_grad():
    out = model([img])[0]

# (num_people, 17, 3) - x, y, visibility for each COCO keypoint
keypoints = out["keypoints"]
scores    = out["scores"]
print("People detected:", (scores > 0.8).sum().item())
print("Keypoints shape:", keypoints.shape)`,

    'gan-basics': `import torch
import torch.nn as nn

class Generator(nn.Module):
    def __init__(self, z_dim=100, img_dim=28*28):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(z_dim, 256), nn.LeakyReLU(0.2),
            nn.Linear(256, 512),   nn.LeakyReLU(0.2),
            nn.Linear(512, img_dim), nn.Tanh(),
        )
    def forward(self, z): return self.net(z)

class Discriminator(nn.Module):
    def __init__(self, img_dim=28*28):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(img_dim, 512), nn.LeakyReLU(0.2),
            nn.Linear(512, 256),     nn.LeakyReLU(0.2),
            nn.Linear(256, 1),
        )
    def forward(self, x): return self.net(x)

G, D = Generator(), Discriminator()
z = torch.randn(16, 100)
fake = G(z)
score = D(fake)`,

    'dcgan': `import torch.nn as nn

class DCGenerator(nn.Module):
    def __init__(self, z_dim=100, ngf=64, nc=3):
        super().__init__()
        self.main = nn.Sequential(
            nn.ConvTranspose2d(z_dim, ngf*8, 4, 1, 0, bias=False),
            nn.BatchNorm2d(ngf*8), nn.ReLU(True),
            nn.ConvTranspose2d(ngf*8, ngf*4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf*4), nn.ReLU(True),
            nn.ConvTranspose2d(ngf*4, ngf*2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf*2), nn.ReLU(True),
            nn.ConvTranspose2d(ngf*2, ngf, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf),  nn.ReLU(True),
            nn.ConvTranspose2d(ngf, nc, 4, 2, 1, bias=False),
            nn.Tanh(),
        )
    def forward(self, z):
        return self.main(z)  # z: (B, z_dim, 1, 1) -> (B, 3, 64, 64)`,

    'stylegan': `# Minimal sketch of the StyleGAN mapping + AdaIN idea
import torch
import torch.nn as nn

class MappingNetwork(nn.Module):
    def __init__(self, z_dim=512, w_dim=512, n_layers=8):
        super().__init__()
        layers = []
        for _ in range(n_layers):
            layers += [nn.Linear(z_dim, w_dim), nn.LeakyReLU(0.2)]
            z_dim = w_dim
        self.net = nn.Sequential(*layers)
    def forward(self, z):
        return self.net(z / (z.pow(2).mean(1, keepdim=True) + 1e-8).sqrt())

class AdaIN(nn.Module):
    def __init__(self, channels, w_dim):
        super().__init__()
        self.style = nn.Linear(w_dim, channels * 2)
    def forward(self, x, w):
        s = self.style(w).unsqueeze(-1).unsqueeze(-1)
        ys, yb = s.chunk(2, dim=1)
        x = (x - x.mean([2, 3], keepdim=True)) / (x.std([2, 3], keepdim=True) + 1e-8)
        return ys * x + yb`,

    'wgan': `import torch

def wgan_gp_step(D, G, real, z, opt_D, lambda_gp=10):
    B = real.size(0)
    fake = G(z).detach()

    # Interpolate for gradient penalty
    alpha = torch.rand(B, 1, 1, 1, device=real.device)
    interp = (alpha * real + (1 - alpha) * fake).requires_grad_(True)
    d_interp = D(interp)
    grads = torch.autograd.grad(
        outputs=d_interp, inputs=interp,
        grad_outputs=torch.ones_like(d_interp),
        create_graph=True, retain_graph=True,
    )[0]
    gp = ((grads.view(B, -1).norm(2, dim=1) - 1) ** 2).mean()

    loss_D = D(fake).mean() - D(real).mean() + lambda_gp * gp
    opt_D.zero_grad(); loss_D.backward(); opt_D.step()
    return loss_D.item()`,

    'diffusion-models': `import torch
import torch.nn.functional as F

T = 1000
betas = torch.linspace(1e-4, 0.02, T)
alphas = 1.0 - betas
alpha_bars = torch.cumprod(alphas, dim=0)

def q_sample(x0, t, noise):
    """Forward: add noise at step t."""
    sqrt_ab = alpha_bars[t].sqrt().view(-1, 1, 1, 1)
    sqrt_1mab = (1 - alpha_bars[t]).sqrt().view(-1, 1, 1, 1)
    return sqrt_ab * x0 + sqrt_1mab * noise

def training_step(model, x0):
    t = torch.randint(0, T, (x0.size(0),), device=x0.device)
    noise = torch.randn_like(x0)
    xt = q_sample(x0, t, noise)
    pred_noise = model(xt, t)
    return F.mse_loss(pred_noise, noise)`,

    'rl-basics': `import gymnasium as gym
import numpy as np

env = gym.make("CartPole-v1")
obs, info = env.reset(seed=0)

# Random-policy rollout
total_reward = 0.0
for _ in range(500):
    action = env.action_space.sample()
    obs, reward, terminated, truncated, info = env.step(action)
    total_reward += reward
    if terminated or truncated:
        obs, info = env.reset()
        break

print("Episode return:", total_reward)
env.close()`,

    'dqn': `import torch, torch.nn as nn, torch.nn.functional as F
from collections import deque
import random

class QNet(nn.Module):
    def __init__(self, obs_dim, n_actions):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(obs_dim, 128), nn.ReLU(),
            nn.Linear(128, 128),     nn.ReLU(),
            nn.Linear(128, n_actions),
        )
    def forward(self, x): return self.net(x)

def dqn_update(q, q_target, batch, gamma=0.99):
    s, a, r, s_next, done = batch
    q_val = q(s).gather(1, a.unsqueeze(1)).squeeze(1)
    with torch.no_grad():
        q_next = q_target(s_next).max(1).values
        target = r + gamma * q_next * (1 - done.float())
    return F.smooth_l1_loss(q_val, target)`,

    'policy-gradient': `import torch
import torch.nn as nn
import torch.nn.functional as F

class PolicyNet(nn.Module):
    def __init__(self, obs_dim, n_actions):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(obs_dim, 128), nn.Tanh(),
            nn.Linear(128, n_actions),
        )
    def forward(self, obs):
        return self.net(obs)  # logits

def reinforce_loss(policy, obs, actions, returns):
    logits = policy(obs)
    log_probs = F.log_softmax(logits, dim=-1)
    selected = log_probs.gather(1, actions.unsqueeze(1)).squeeze(1)
    # Normalize returns for variance reduction
    returns = (returns - returns.mean()) / (returns.std() + 1e-8)
    return -(selected * returns).mean()`,

    'ppo-trpo': `import torch

def ppo_clip_loss(new_logp, old_logp, advantages, clip=0.2):
    ratio = torch.exp(new_logp - old_logp)
    unclipped = ratio * advantages
    clipped   = torch.clamp(ratio, 1 - clip, 1 + clip) * advantages
    return -torch.min(unclipped, clipped).mean()

def gae(rewards, values, dones, gamma=0.99, lam=0.95):
    adv = torch.zeros_like(rewards)
    last = 0.0
    for t in reversed(range(len(rewards))):
        nonterminal = 1.0 - dones[t]
        delta = rewards[t] + gamma * values[t+1] * nonterminal - values[t]
        last = delta + gamma * lam * nonterminal * last
        adv[t] = last
    return adv`,

    'model-based-rl': `import torch
import torch.nn as nn

class DynamicsModel(nn.Module):
    """Predicts next state given (state, action)."""
    def __init__(self, s_dim, a_dim, hidden=256):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(s_dim + a_dim, hidden), nn.ReLU(),
            nn.Linear(hidden, hidden), nn.ReLU(),
            nn.Linear(hidden, s_dim),
        )
    def forward(self, s, a):
        return s + self.net(torch.cat([s, a], dim=-1))  # residual

def cem_plan(dynamics, reward_fn, s0, horizon=10, n_iter=5,
             pop=256, elite=32, a_dim=4):
    mu  = torch.zeros(horizon, a_dim)
    std = torch.ones(horizon, a_dim)
    for _ in range(n_iter):
        samples = mu + std * torch.randn(pop, horizon, a_dim)
        s = s0.expand(pop, -1)
        total = torch.zeros(pop)
        for t in range(horizon):
            s = dynamics(s, samples[:, t])
            total += reward_fn(s, samples[:, t])
        top = samples[total.topk(elite).indices]
        mu, std = top.mean(0), top.std(0) + 1e-6
    return mu[0]  # first action of best plan`,

    'word-embeddings': `import torch
import torch.nn as nn

vocab_size, embed_dim = 10_000, 128
embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)

# Tokens -> dense vectors
tokens = torch.tensor([[5, 42, 7, 0, 0]])  # 0 is padding
vectors = embedding(tokens)  # (1, 5, 128)

# Cosine similarity between two word vectors
v_king  = embedding(torch.tensor(5))
v_queen = embedding(torch.tensor(42))
cos = torch.nn.functional.cosine_similarity(
    v_king.unsqueeze(0), v_queen.unsqueeze(0)
)
print("similarity:", cos.item())`,

    'seq2seq': `import torch
import torch.nn as nn

class Seq2Seq(nn.Module):
    def __init__(self, src_vocab, tgt_vocab, d_model=256):
        super().__init__()
        self.src_embed = nn.Embedding(src_vocab, d_model)
        self.tgt_embed = nn.Embedding(tgt_vocab, d_model)
        self.transformer = nn.Transformer(
            d_model=d_model, nhead=8,
            num_encoder_layers=3, num_decoder_layers=3,
            batch_first=True,
        )
        self.out = nn.Linear(d_model, tgt_vocab)

    def forward(self, src, tgt):
        src_e = self.src_embed(src)
        tgt_e = self.tgt_embed(tgt)
        tgt_mask = nn.Transformer.generate_square_subsequent_mask(tgt.size(1))
        h = self.transformer(src_e, tgt_e, tgt_mask=tgt_mask.to(src.device))
        return self.out(h)`,

    'bert-transformers': `# pip install transformers
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

name = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(name)
model = AutoModelForSequenceClassification.from_pretrained(
    name, num_labels=2,
)

texts = ["I loved this movie", "Worst film ever"]
enc = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")

with torch.no_grad():
    logits = model(**enc).logits
preds = logits.argmax(dim=-1)
print(preds.tolist())`,
  }
  
  return examples[topicId] || `# PyTorch code example for ${topicId}
import torch
import torch.nn as nn

# Implementation details here...`
}

function getBestPractices(topicId: string): string[] {
  const practices: Record<string, string[]> = {
    'pytorch-intro': [
      'Match your PyTorch build to your installed CUDA version, or use CPU wheels if you don\'t have a GPU',
      'Verify your setup with torch.cuda.is_available() and a small tensor op before starting a real project',
      'Pin versions in requirements.txt (torch==x.y.z) so environments are reproducible',
      'Use virtual environments (venv / conda) to keep PyTorch projects isolated from system Python',
      'Prefer the latest stable PyTorch release — new versions often bring large performance improvements',
    ],
    'tensor-fundamentals': [
      'Always specify dtype explicitly when precision matters (e.g., torch.float32 vs torch.float64)',
      'Use torch.no_grad() context during inference to save memory and improve performance',
      'Prefer vectorized operations over Python loops for better performance',
      'Use .detach() to create tensors that don\'t track gradients when needed',
      'Move data to GPU only when the computation will benefit from it (large tensors/operations)',
    ],
    'tensor-broadcasting': [
      'Print tensor .shape liberally when debugging — most bugs are shape mismatches',
      'Prefer broadcasting over repeat/expand + explicit copies — it\'s faster and uses less memory',
      'Use unsqueeze(dim) to explicitly add a size-1 axis rather than relying on implicit rules',
      'Call .contiguous() after transpose/permute before .view()',
      'Use advanced indexing (boolean masks, index tensors) instead of Python for-loops',
    ],
    'autograd-basics': [
      'Always call optimizer.zero_grad() before backward() to prevent gradient accumulation',
      'Use torch.no_grad() or model.eval() during evaluation to disable gradient tracking',
      'Be careful with in-place operations as they can cause errors with autograd',
      'Use .backward(retain_graph=True) only when necessary as it uses more memory',
      'Detach tensors when you want to break the computational graph',
    ],
    'nn-module': [
      'Always call super().__init__() in your module\'s __init__ method',
      'Define all learnable parameters and submodules in __init__, not in forward()',
      'Use model.train() and model.eval() to switch between training and evaluation modes',
      'Leverage nn.Sequential for simple linear layer stacks',
      'Use meaningful names for layers to make debugging easier',
    ],
    'cnn-architectures': [
      'Use padding="same" (or compute it manually) to keep spatial size when you want to go deeper without shrinking feature maps',
      'Start from a pretrained torchvision backbone rather than training from scratch on small datasets',
      'Put BatchNorm between Conv and activation, never after the final output',
      'Kaiming (He) initialization is the default for conv layers with ReLU',
      'Monitor GPU memory — large images × deep networks fill VRAM fast; reduce batch size or use checkpointing',
    ],
    'rnn-lstm': [
      'Prefer LSTM or GRU over vanilla RNN for anything longer than ~20 timesteps',
      'Use pack_padded_sequence for variable-length batches to skip padding tokens',
      'Clip gradient norms (~1.0 – 5.0) to prevent exploding gradients',
      'Set batch_first=True to keep tensor shapes consistent with the rest of your pipeline',
      'For most new sequence tasks, consider transformers — they usually outperform RNNs',
    ],
    'transformers': [
      'Use nn.TransformerEncoderLayer / nn.MultiheadAttention instead of rewriting attention yourself',
      'Apply LayerNorm before (pre-LN) rather than after (post-LN) sublayers for more stable deep-model training',
      'Scale dot products by 1/sqrt(d_k) — forgetting this kills training',
      'Use causal masks for autoregressive decoders; padding masks for variable-length inputs',
      'For long sequences consider FlashAttention or chunked attention to cut memory from O(N²) to ~O(N)',
    ],
    'loss-functions': [
      'Pass raw logits (not softmax/sigmoid outputs) to CrossEntropyLoss and BCEWithLogitsLoss',
      'Use class weights or focal loss for imbalanced classification problems',
      'Match the reduction (mean/sum/none) to what your training loop expects',
      'Validate your loss on a trivial example — a correct loss should be ~0 on perfect predictions',
      'When you write a custom loss, subclass nn.Module so it can hold state and move with .to(device)',
    ],
    'optimizers': [
      'AdamW with cosine LR and warmup is a strong default for transformers and most modern nets',
      'Use separate param groups when you want different LRs or weight decay for different layers (e.g., head vs backbone)',
      'Apply weight decay only to weights, not to BatchNorm/LayerNorm params or biases',
      'Warm up the learning rate for large batch sizes or large models to avoid early divergence',
      'Clip gradient norms in RNNs/transformers (torch.nn.utils.clip_grad_norm_) — cheap insurance against explosions',
    ],
    'training-loop': [
      'Always pair model.train()/model.eval() with torch.no_grad() in the validation block',
      'Save both model.state_dict() AND optimizer.state_dict() (plus epoch/metric) to fully resume training',
      'Log train and val metrics every epoch — prefer TensorBoard or Weights & Biases over print()',
      'Use mixed precision (torch.cuda.amp) for a near-free ~2x speedup on modern GPUs',
      'Set seeds (torch, numpy, random) and deterministic flags when you need reproducible runs',
    ],
    'custom-autograd': [
      'Prefer composing existing ops before writing a custom Function — autograd is almost always correct',
      'Verify every custom backward with torch.autograd.gradcheck on double-precision inputs',
      'Save only what you need with ctx.save_for_backward to minimize memory use',
      'Register your Function via .apply(), not by instantiating it directly',
      'Return None for inputs that don\'t need a gradient in your backward method',
    ],
    'distributed-training': [
      'Use DistributedDataParallel, not DataParallel — DP is slow and kept only for backward compatibility',
      'Call sampler.set_epoch(epoch) on your DistributedSampler every epoch',
      'Only rank 0 should log, save checkpoints, and write to disk',
      'Scale the learning rate with the effective batch size, and warm it up',
      'Use gradient accumulation with no_sync() to emulate larger batches without extra memory',
    ],
    'model-optimization': [
      'Profile before optimizing — torch.profiler reveals the real bottlenecks',
      'Try torch.compile() first; it often gives 20–50% speedups for minimal code change',
      'For mobile/edge, combine quantization with pruning — they compose well',
      'Always measure accuracy after every optimization step; never assume it\'s lossless',
      'Test the exported (TorchScript / ONNX) model end-to-end before shipping, not just the PyTorch one',
    ],
    'cv-fundamentals': [
      'Use num_workers > 0 and pin_memory=True on your DataLoader to overlap I/O with GPU compute',
      'Normalize images with the mean/std of the dataset your pretrained backbone was trained on',
      'Apply augmentations only to the training set, never to validation / test',
      'Prefer torchvision.transforms.v2 — it supports bounding boxes, masks and videos alongside images',
      'Start from a pretrained model; training CV models from scratch rarely pays off',
    ],
    'object-detection': [
      'Use torchvision.models.detection (Faster R-CNN, RetinaNet, FCOS) before writing your own from scratch',
      'Be careful with anchor configurations — wrong aspect ratios / scales destroy recall',
      'Apply NMS per class, not globally, when objects of different classes can overlap',
      'Use focal loss or hard-example mining to handle the massive background-vs-foreground imbalance',
      'Evaluate with COCO-style mAP, not plain accuracy, and report both AP50 and AP@[.5:.95]',
    ],
    'image-segmentation': [
      'Combine pixel cross-entropy with Dice loss — it\'s significantly more robust than either alone',
      'Pad/resize to a multiple of 32 so encoder-decoder skip connections line up cleanly',
      'Track per-class IoU, not just mean IoU, to catch classes the model is ignoring',
      'For medical imaging, use Dice / Tversky loss — raw pixel accuracy is misleading on tiny lesions',
      'Apply the same augmentation transform to the image AND its mask (use transforms.v2 which handles this)',
    ],
    'pose-estimation': [
      'Use heatmap regression rather than direct coordinate regression — it trains far more stably',
      'Augment with random rotation / scale, but remember to transform keypoints accordingly',
      'Use soft-argmax if you need sub-pixel precision differentiable end-to-end',
      'Filter predictions by confidence and skeleton plausibility to cut false positives',
      'For video, apply a temporal smoothing filter (one-euro is a good default) to remove jitter',
    ],
    'gan-basics': [
      'Use separate optimizers for G and D — never share',
      'Keep G and D balanced; if one dominates, training diverges',
      'Track G and D losses on the same plot to catch instabilities early',
      'Sample a fixed latent vector and generate from it every epoch to visually monitor progress',
      'Prefer WGAN-GP or spectral normalization over vanilla GAN for new projects',
    ],
    'dcgan': [
      'Use Adam with β1=0.5, β2=0.999, lr=2e-4 — the DCGAN paper\'s values still work well',
      'Apply Tanh to the generator output and scale real images to [-1, 1] accordingly',
      'Initialize weights with mean=0, std=0.02 normal — this small detail matters',
      'Use LeakyReLU(0.2) in D, ReLU in G; both with BatchNorm everywhere except G output and D input',
      'Kernel size 4, stride 2, padding 1 is a safe building block for both up- and down-sampling',
    ],
    'stylegan': [
      'Start from the official NVIDIA StyleGAN2/3 implementation — it has many subtle details',
      'Use mixed precision and large batch sizes; StyleGAN training is compute-hungry',
      'Sample with truncation (ψ ≈ 0.7) for high-quality results, no truncation for diversity',
      'Use path-length regularization for StyleGAN2, not progressive growing',
      'For conditional generation, inject class/text embeddings through the mapping network',
    ],
    'wgan': [
      'Prefer WGAN-GP (gradient penalty) over the original weight-clipping WGAN',
      'Do NOT use BatchNorm in the critic with WGAN-GP — it breaks the per-sample gradient penalty; use LayerNorm or InstanceNorm',
      'Update the critic 5× per generator update (the paper\'s default)',
      'Use Adam with β1=0.0, β2=0.9 for WGAN-GP (different from DCGAN)',
      'The critic loss is a meaningful training-progress signal — watch it trend down',
    ],
    'diffusion-models': [
      'Start from an existing diffusers-library pipeline before training from scratch',
      'Use cosine or sigmoid noise schedules — they usually beat the original linear DDPM schedule',
      'Implement classifier-free guidance by dropping the condition ~10% of the time during training',
      'Use EMA of the denoising network\'s weights for sampling — it substantially improves quality',
      'Use DDIM or DPM-Solver at inference to cut sampling steps from 1000 to 20–50',
    ],
    'rl-basics': [
      'Always set a random seed per run and report the average over multiple seeds — RL is very high variance',
      'Normalize / clip observations and rewards; raw environment signals can be wildly scaled',
      'Start with discrete-action environments (CartPole, LunarLander) before tackling continuous control',
      'Log episode return, episode length, and losses — use TensorBoard or W&B, not just print',
      'Keep the environment and the learner modular (Gymnasium API) so you can swap algorithms easily',
    ],
    'dqn': [
      'Use a target network and update it every ~1000–10000 steps (hard copy) or via soft updates (τ ≈ 0.005)',
      'Use Huber loss instead of MSE on the TD error — it is robust to outlier transitions',
      'Replay buffer should be large (≥1e5) for toy tasks, 1e6 for Atari',
      'Decay ε from ~1.0 to ~0.05 over the first ~10% of training',
      'Combine Double DQN + Dueling + Prioritized Replay (Rainbow subset) for a strong default',
    ],
    'policy-gradient': [
      'Always subtract a value-function baseline — raw REINFORCE is too noisy to train',
      'Normalize advantages within each batch; it stabilizes actor-critic methods',
      'Add an entropy bonus (~0.01) to the policy loss to prevent premature convergence',
      'Collect rollouts from multiple environments in parallel (SyncVectorEnv) to decorrelate samples',
      'Clip value-function updates the same way PPO clips the policy to avoid catastrophic updates',
    ],
    'ppo-trpo': [
      'PPO is almost always the right starting point — TRPO is great in theory but painful to implement and debug',
      'Typical PPO hyperparameters: clip=0.2, 10 epochs, minibatch 64, γ=0.99, λ=0.95',
      'Use GAE(λ) rather than raw discounted returns for the advantage estimate',
      'Normalize advantages per minibatch and clip the value-function loss as well as the policy',
      'Use orthogonal initialization and tanh in MLP policies for robotics/continuous control tasks',
    ],
    'model-based-rl': [
      'Use an ensemble of dynamics models to capture uncertainty — single models are easily exploited',
      'Start with short rollout horizons (5–10 steps) and grow them only if the model is accurate',
      'Combine planning (MPC/CEM) with a learned value function for long-horizon tasks',
      'Learn dynamics in a compact latent space (world-model style) for high-dimensional observations like images',
      'Always compare to a strong model-free baseline (SAC/PPO) — model-based methods don\'t always win',
    ],
    'word-embeddings': [
      'Use a pretrained embedding (GloVe, fastText) or a contextual model (BERT) instead of learning from scratch on small datasets',
      'Tie input and output embedding matrices in language models — saves params and usually improves perplexity',
      'Freeze embeddings when fine-tuning on very small datasets, unfreeze when you have enough data',
      'Use sub-word tokenization (BPE / SentencePiece) to handle rare and out-of-vocabulary words gracefully',
      'Watch the embedding-matrix size — it often dominates parameter count and memory',
    ],
    'seq2seq': [
      'Always add attention; plain encoder-decoder RNNs break down past ~20 tokens',
      'Use teacher forcing during training and beam search (beam 4–8) at inference',
      'Handle <PAD>, <SOS>, <EOS> and <UNK> tokens consistently across training and inference',
      'For modern seq2seq problems, prefer a transformer architecture (e.g., T5, BART) over RNN-based ones',
      'Evaluate with task-appropriate metrics (BLEU, ROUGE, chrF) not just validation loss',
    ],
    'bert-transformers': [
      'Use Hugging Face AutoModel / AutoTokenizer — matching tokenizer to model is critical',
      'Fine-tune with small learning rates (~2e-5) and short schedules (2–4 epochs) to avoid catastrophic forgetting',
      'Use warmup (~10% of steps) and linear decay for stable fine-tuning',
      'For memory-constrained setups use gradient checkpointing, mixed precision, or LoRA/PEFT',
      'Always tokenize with padding + attention masks, never feed raw unpadded sequences of different lengths',
    ],
  }
  
  return practices[topicId] || [
    'Follow PyTorch conventions and style guidelines',
    'Write modular, reusable code',
    'Test your code with small examples first',
    'Use version control and document your code',
    'Profile your code to identify bottlenecks',
  ]
}

function getFullCodeExample(topicId: string): string {
  const fullExamples: Record<string, string> = {
    'tensor-fundamentals': `"""
Complete Guide to PyTorch Tensors
"""
import torch
import numpy as np

# ===== TENSOR CREATION =====

# From Python lists
tensor_from_list = torch.tensor([1, 2, 3, 4])
matrix_from_list = torch.tensor([[1, 2], [3, 4]])

# Specialized constructors
zeros = torch.zeros(3, 3)
ones = torch.ones(2, 4)
random_uniform = torch.rand(3, 3)  # Uniform [0, 1)
random_normal = torch.randn(3, 3)  # Normal N(0, 1)
arange = torch.arange(0, 10, 2)  # [0, 2, 4, 6, 8]
linspace = torch.linspace(0, 1, 5)  # [0, 0.25, 0.5, 0.75, 1]

# From NumPy arrays
np_array = np.array([1, 2, 3])
tensor_from_numpy = torch.from_numpy(np_array)

# Like another tensor
x = torch.rand(3, 3)
zeros_like = torch.zeros_like(x)
ones_like = torch.ones_like(x)

# ===== TENSOR PROPERTIES =====

tensor = torch.randn(3, 4, 5)
print(f"Shape: {tensor.shape}")  # torch.Size([3, 4, 5])
print(f"Dtype: {tensor.dtype}")  # torch.float32
print(f"Device: {tensor.device}")  # cpu
print(f"Requires grad: {tensor.requires_grad}")  # False
print(f"Number of elements: {tensor.numel()}")  # 60

# ===== BASIC OPERATIONS =====

a = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
b = torch.tensor([[5.0, 6.0], [7.0, 8.0]])

# Element-wise operations
addition = a + b
subtraction = a - b
multiplication = a * b
division = a / b
power = a ** 2

# Matrix operations
matrix_mult = torch.mm(a, b)  # or a @ b
transpose = a.t()
inverse = torch.inverse(a)

# Reduction operations
sum_all = a.sum()
sum_dim0 = a.sum(dim=0)  # Sum along dimension 0
mean = a.mean()
max_val = a.max()
argmax = a.argmax()  # Index of maximum value

# ===== RESHAPING =====

x = torch.arange(12)
reshaped = x.view(3, 4)  # Reshape to 3x4
reshaped2 = x.reshape(3, 4)  # Alternative
unsqueezed = x.unsqueeze(0)  # Add dimension: (12,) -> (1, 12)
squeezed = unsqueezed.squeeze()  # Remove dimension: (1, 12) -> (12,)
permuted = reshaped.permute(1, 0)  # Transpose dimensions

# ===== INDEXING AND SLICING =====

tensor = torch.arange(20).reshape(4, 5)
element = tensor[0, 0]  # Single element
row = tensor[0]  # First row
column = tensor[:, 0]  # First column
subset = tensor[1:3, 2:4]  # Slicing
mask = tensor > 10
filtered = tensor[mask]  # Boolean indexing

# ===== GPU OPERATIONS =====

if torch.cuda.is_available():
    # Move to GPU
    gpu_tensor = tensor.cuda()
    # or
    gpu_tensor = tensor.to('cuda')
    
    # Create directly on GPU
    gpu_tensor2 = torch.randn(3, 3, device='cuda')
    
    # Move back to CPU
    cpu_tensor = gpu_tensor.cpu()
    
    # Mixed operations require same device
    result = gpu_tensor + gpu_tensor2  # Both on GPU

# ===== IN-PLACE OPERATIONS =====

x = torch.tensor([1, 2, 3])
x.add_(5)  # In-place addition
x.mul_(2)  # In-place multiplication
x.zero_()  # Fill with zeros

# ===== AUTOMATIC DIFFERENTIATION =====

x = torch.tensor([2.0], requires_grad=True)
y = x ** 2 + 3 * x + 1

# Compute gradients
y.backward()
print(f"dy/dx = {x.grad}")  # 2x + 3 = 7.0

# ===== COMMON PATTERNS =====

# Batched matrix multiplication
batch = torch.randn(10, 3, 4)  # 10 matrices of shape 3x4
batch2 = torch.randn(10, 4, 5)  # 10 matrices of shape 4x5
result = torch.bmm(batch, batch2)  # 10 matrices of shape 3x5

# Concatenation and stacking
a = torch.randn(3, 4)
b = torch.randn(3, 4)
concatenated = torch.cat([a, b], dim=0)  # Shape: (6, 4)
stacked = torch.stack([a, b], dim=0)  # Shape: (2, 3, 4)

# Splitting
tensor = torch.arange(12).reshape(4, 3)
chunks = torch.chunk(tensor, 2, dim=0)  # Split into 2 chunks
split_sizes = torch.split(tensor, [1, 3], dim=0)  # Custom split sizes

print("Tensor operations complete!")`,
    
    'nn-module': `"""
Complete Guide to nn.Module
"""
import torch
import torch.nn as nn
import torch.nn.functional as F

# ===== BASIC MODULE =====

class SimpleNet(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, output_size)
        self.dropout = nn.Dropout(0.5)
    
    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x

# ===== USING nn.Sequential =====

sequential_model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(256, 128),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(128, 10)
)

# ===== CONVOLUTIONAL NETWORK =====

class ConvNet(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        # Convolutional layers
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        
        # Batch normalization
        self.bn1 = nn.BatchNorm2d(32)
        self.bn2 = nn.BatchNorm2d(64)
        self.bn3 = nn.BatchNorm2d(128)
        
        # Pooling
        self.pool = nn.MaxPool2d(2, 2)
        
        # Fully connected layers
        self.fc1 = nn.Linear(128 * 4 * 4, 512)
        self.fc2 = nn.Linear(512, num_classes)
        
        # Dropout
        self.dropout = nn.Dropout(0.5)
    
    def forward(self, x):
        # Block 1
        x = self.conv1(x)
        x = self.bn1(x)
        x = F.relu(x)
        x = self.pool(x)
        
        # Block 2
        x = self.conv2(x)
        x = self.bn2(x)
        x = F.relu(x)
        x = self.pool(x)
        
        # Block 3
        x = self.conv3(x)
        x = self.bn3(x)
        x = F.relu(x)
        x = self.pool(x)
        
        # Flatten
        x = x.view(x.size(0), -1)
        
        # Fully connected
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        
        return x

# ===== CUSTOM INITIALIZATION =====

def init_weights(module):
    if isinstance(module, nn.Linear):
        nn.init.xavier_uniform_(module.weight)
        if module.bias is not None:
            nn.init.zeros_(module.bias)
    elif isinstance(module, nn.Conv2d):
        nn.init.kaiming_normal_(module.weight, mode='fan_out', nonlinearity='relu')

model = ConvNet()
model.apply(init_weights)

# ===== ACCESSING PARAMETERS =====

# All parameters
for name, param in model.named_parameters():
    print(f"{name}: {param.shape}")

# Specific layer parameters
conv1_weights = model.conv1.weight
conv1_bias = model.conv1.bias

# Count parameters
total_params = sum(p.numel() for p in model.parameters())
trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

# ===== FREEZING LAYERS =====

# Freeze all parameters
for param in model.parameters():
    param.requires_grad = False

# Unfreeze specific layers
for param in model.fc2.parameters():
    param.requires_grad = True

# ===== TRAINING AND EVALUATION MODES =====

model.train()  # Enable dropout and batch norm training
output = model(train_data)

model.eval()  # Disable dropout and batch norm training
with torch.no_grad():
    output = model(test_data)

# ===== SAVING AND LOADING =====

# Save entire model
torch.save(model, 'model.pth')
loaded_model = torch.load('model.pth')

# Save only state dict (recommended)
torch.save(model.state_dict(), 'model_weights.pth')
model.load_state_dict(torch.load('model_weights.pth'))

# Save with optimizer state
checkpoint = {
    'model_state_dict': model.state_dict(),
    'optimizer_state_dict': optimizer.state_dict(),
    'epoch': epoch,
    'loss': loss,
}
torch.save(checkpoint, 'checkpoint.pth')

print("nn.Module examples complete!")`
  }
  
  return fullExamples[topicId] || getCodeExample(topicId)
}
