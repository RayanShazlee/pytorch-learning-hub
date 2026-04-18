export interface DocTopic {
  id: string
  title: string
  description: string
  icon: string
  category: 'basics' | 'tensors' | 'autograd' | 'nn' | 'optimization' | 'advanced'
  estimatedTime: string
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export const docTopics: DocTopic[] = [
  {
    id: 'pytorch-intro',
    title: 'Introduction to PyTorch',
    description: 'Core concepts, installation, and ecosystem overview',
    icon: 'rocket',
    category: 'basics',
    estimatedTime: '20 min',
    complexity: 'beginner',
  },
  {
    id: 'tensor-fundamentals',
    title: 'Tensor Fundamentals',
    description: 'Creating, manipulating, and understanding tensor operations',
    icon: 'cube',
    category: 'tensors',
    estimatedTime: '30 min',
    complexity: 'beginner',
  },
  {
    id: 'tensor-broadcasting',
    title: 'Broadcasting & Indexing',
    description: 'Advanced tensor manipulation, broadcasting rules, and indexing techniques',
    icon: 'arrows-out',
    category: 'tensors',
    estimatedTime: '25 min',
    complexity: 'intermediate',
  },
  {
    id: 'autograd-basics',
    title: 'Automatic Differentiation',
    description: 'Understanding autograd, computational graphs, and gradient computation',
    icon: 'git-branch',
    category: 'autograd',
    estimatedTime: '35 min',
    complexity: 'intermediate',
  },
  {
    id: 'nn-module',
    title: 'Neural Network Modules',
    description: 'Building blocks: nn.Module, layers, activation functions, and architectures',
    icon: 'network',
    category: 'nn',
    estimatedTime: '40 min',
    complexity: 'intermediate',
  },
  {
    id: 'cnn-architectures',
    title: 'Convolutional Neural Networks',
    description: 'Conv layers, pooling, batch normalization, and CNN architectures',
    icon: 'grid-four',
    category: 'nn',
    estimatedTime: '45 min',
    complexity: 'intermediate',
  },
  {
    id: 'rnn-lstm',
    title: 'Recurrent Networks & LSTMs',
    description: 'Sequential data processing, RNNs, LSTMs, and GRUs',
    icon: 'arrows-clockwise',
    category: 'nn',
    estimatedTime: '50 min',
    complexity: 'advanced',
  },
  {
    id: 'transformers',
    title: 'Attention & Transformers',
    description: 'Self-attention mechanisms, multi-head attention, and transformer architecture',
    icon: 'star',
    category: 'nn',
    estimatedTime: '60 min',
    complexity: 'advanced',
  },
  {
    id: 'loss-functions',
    title: 'Loss Functions',
    description: 'MSE, Cross-Entropy, Custom losses, and choosing the right loss',
    icon: 'target',
    category: 'optimization',
    estimatedTime: '30 min',
    complexity: 'intermediate',
  },
  {
    id: 'optimizers',
    title: 'Optimization Algorithms',
    description: 'SGD, Adam, AdamW, learning rate schedules, and optimizer selection',
    icon: 'chart-line-up',
    category: 'optimization',
    estimatedTime: '35 min',
    complexity: 'intermediate',
  },
  {
    id: 'training-loop',
    title: 'Training Loop Architecture',
    description: 'Best practices for training, validation, checkpointing, and monitoring',
    icon: 'repeat',
    category: 'optimization',
    estimatedTime: '40 min',
    complexity: 'intermediate',
  },
  {
    id: 'custom-autograd',
    title: 'Custom Autograd Functions',
    description: 'Implementing custom backward passes and gradient manipulation',
    icon: 'function',
    category: 'advanced',
    estimatedTime: '45 min',
    complexity: 'advanced',
  },
  {
    id: 'distributed-training',
    title: 'Distributed Training',
    description: 'Data parallelism, model parallelism, and multi-GPU training',
    icon: 'devices',
    category: 'advanced',
    estimatedTime: '55 min',
    complexity: 'expert',
  },
  {
    id: 'model-optimization',
    title: 'Model Optimization & Deployment',
    description: 'Quantization, pruning, ONNX export, and production deployment',
    icon: 'lightning',
    category: 'advanced',
    estimatedTime: '50 min',
    complexity: 'expert',
  },
]

export const docCategories = [
  { id: 'basics', label: 'Basics', color: 'primary' },
  { id: 'tensors', label: 'Tensors', color: 'secondary' },
  { id: 'autograd', label: 'Autograd', color: 'coral' },
  { id: 'nn', label: 'Neural Networks', color: 'violet' },
  { id: 'optimization', label: 'Optimization', color: 'cyan' },
  { id: 'advanced', label: 'Advanced', color: 'orange' },
] as const
