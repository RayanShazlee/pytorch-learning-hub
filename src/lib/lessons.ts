export type LessonStatus = 'locked' | 'available' | 'in-progress' | 'completed'

export interface Lesson {
  id: string
  title: string
  description: string
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  category: 'fundamentals' | 'tensors' | 'neural-networks' | 'training'
}

export const lessons: Lesson[] = [
  {
    id: 'what-is-ai',
    title: 'What is AI?',
    description: 'Discover what artificial intelligence means and how computers can learn!',
    icon: 'brain',
    difficulty: 'beginner',
    duration: '5 min',
    category: 'fundamentals',
  },
  {
    id: 'what-is-pytorch',
    title: 'Meet PyTorch',
    description: 'Learn about the magical toolkit that helps us build smart programs.',
    icon: 'lightning-charge',
    difficulty: 'beginner',
    duration: '5 min',
    category: 'fundamentals',
  },
  {
    id: 'what-is-tensor',
    title: 'What is a Tensor?',
    description: 'Play with magical number boxes that store information!',
    icon: 'cube',
    difficulty: 'beginner',
    duration: '8 min',
    category: 'tensors',
  },
  {
    id: 'tensor-shapes',
    title: 'Tensor Shapes',
    description: 'Explore 1D, 2D, and 3D tensors through fun visualizations.',
    icon: 'stack',
    difficulty: 'beginner',
    duration: '10 min',
    category: 'tensors',
  },
  {
    id: 'tensor-operations',
    title: 'Tensor Magic',
    description: 'See how tensors can add, multiply, and transform!',
    icon: 'magic-wand',
    difficulty: 'intermediate',
    duration: '12 min',
    category: 'tensors',
  },
  {
    id: 'what-is-neural-network',
    title: 'Neural Networks',
    description: 'Watch how layers of neurons work together like a team!',
    icon: 'network',
    difficulty: 'intermediate',
    duration: '15 min',
    category: 'neural-networks',
  },
  {
    id: 'layers-explained',
    title: 'Understanding Layers',
    description: 'Discover how information flows through different layers.',
    icon: 'rows',
    difficulty: 'intermediate',
    duration: '12 min',
    category: 'neural-networks',
  },
  {
    id: 'activation-functions',
    title: 'Activation Functions',
    description: 'Learn how neurons decide what to pass forward!',
    icon: 'waveform',
    difficulty: 'intermediate',
    duration: '10 min',
    category: 'neural-networks',
  },
  {
    id: 'training-intro',
    title: 'Training Your First Model',
    description: 'Watch your AI learn from examples, step by step!',
    icon: 'graduation-cap',
    difficulty: 'intermediate',
    duration: '15 min',
    category: 'training',
  },
  {
    id: 'loss-and-optimization',
    title: 'Loss & Optimization',
    description: 'See how models get better by learning from mistakes.',
    icon: 'chart-line-down',
    difficulty: 'advanced',
    duration: '12 min',
    category: 'training',
  },
  {
    id: 'backpropagation',
    title: 'Backpropagation',
    description: 'Understand how learning travels backward through the network!',
    icon: 'arrows-counter-clockwise',
    difficulty: 'advanced',
    duration: '15 min',
    category: 'training',
  },
  {
    id: 'build-your-own',
    title: 'Build Your Own!',
    description: 'Put everything together and create your first neural network!',
    icon: 'trophy',
    difficulty: 'advanced',
    duration: '20 min',
    category: 'training',
  },
]

export const categories = [
  { id: 'fundamentals', label: 'Fundamentals', color: 'primary' },
  { id: 'tensors', label: 'Tensors', color: 'secondary' },
  { id: 'neural-networks', label: 'Neural Networks', color: 'coral' },
  { id: 'training', label: 'Training', color: 'accent' },
] as const
