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
      case 'tensor-fundamentals':
        return <TensorVisualizer title="Tensor Operations" description="Experiment with tensor dimensions and operations" />
      case 'tensor-broadcasting':
        return <TensorVisualizer title="Broadcasting Rules" description="See how tensors of different shapes combine" />
      case 'nn-module':
      case 'cnn-architectures':
      case 'rnn-lstm':
      case 'transformers':
        return <NeuralNetworkVisualizer />
      case 'training-loop':
      case 'optimizers':
        return <TrainingSimulator />
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
    'tensor-fundamentals': [
      { title: 'Tensor Creation', description: 'Learn multiple ways to create tensors including torch.tensor(), torch.zeros(), torch.ones(), torch.rand(), and torch.randn(). Understand when to use each method.' },
      { title: 'Tensor Properties', description: 'Every tensor has a shape (size), dtype (data type), and device (CPU or GPU). Understanding these properties is crucial for working with tensors effectively.' },
      { title: 'Tensor Operations', description: 'PyTorch supports a wide variety of mathematical operations on tensors including element-wise operations, matrix multiplication, reductions, and more.' },
      { title: 'In-place Operations', description: 'Operations with an underscore suffix (e.g., add_()) modify tensors in-place. Use these carefully as they can interfere with autograd.' },
      { title: 'GPU Acceleration', description: 'Move tensors to GPU using .to(device) or .cuda() for massive performance improvements in compute-intensive operations.' },
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
  }
  
  return concepts[topicId] || [
    { title: 'Core Concept 1', description: 'Fundamental understanding of this topic is essential for advanced PyTorch development.' },
    { title: 'Core Concept 2', description: 'Master the key techniques and best practices for this area.' },
    { title: 'Core Concept 3', description: 'Learn how to apply these concepts to real-world problems effectively.' },
  ]
}

function getCodeExample(topicId: string): string {
  const examples: Record<string, string> = {
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
  }
  
  return examples[topicId] || `# PyTorch code example for ${topicId}
import torch
import torch.nn as nn

# Implementation details here...`
}

function getBestPractices(topicId: string): string[] {
  const practices: Record<string, string[]> = {
    'tensor-fundamentals': [
      'Always specify dtype explicitly when precision matters (e.g., torch.float32 vs torch.float64)',
      'Use torch.no_grad() context during inference to save memory and improve performance',
      'Prefer vectorized operations over Python loops for better performance',
      'Use .detach() to create tensors that don\'t track gradients when needed',
      'Move data to GPU only when the computation will benefit from it (large tensors/operations)',
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
  
  return fullExamples[topicId] || `# Full implementation coming soon for ${topicId}\nimport torch\nimport torch.nn as nn\n\n# Comprehensive code example...`
}
