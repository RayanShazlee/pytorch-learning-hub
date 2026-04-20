import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CheckCircle, Code, Play, BookOpen, Lightbulb, Target, Sparkle } from '@phosphor-icons/react'
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
import { BackpropVisualizer } from '@/components/visuals/BackpropVisualizer'
import { OptimizerComparisonVisual } from '@/components/visuals/OptimizerComparisonVisual'
import { CNNFeatureMapVisual } from '@/components/visuals/CNNFeatureMapVisual'
import { AttentionHeatmapVisual } from '@/components/visuals/AttentionHeatmapVisual'
import { EmbeddingSpaceVisual } from '@/components/visuals/EmbeddingSpaceVisual'
import { MatMulStepVisual } from '@/components/visuals/MatMulStepVisual'
import { ConvolutionStepVisual } from '@/components/visuals/ConvolutionStepVisual'
import { GradientDescentStepVisual } from '@/components/visuals/GradientDescentStepVisual'
import { AttentionStepVisual } from '@/components/visuals/AttentionStepVisual'
import { SoftmaxStepVisual } from '@/components/visuals/SoftmaxStepVisual'
import { RNNStepVisual } from '@/components/visuals/RNNStepVisual'
import { DiffusionStepVisual } from '@/components/visuals/DiffusionStepVisual'
import {
  CompileVisual,
  HooksVisual,
  GradCheckpointVisual,
  AMPVisual,
  DDPVisual,
  FSDPVisual,
  ProfilerVisual,
  ReparamVisual,
  VmapVisual,
  InitVisual,
  QuantizationVisual,
  PruneVisual,
  CustomAutogradVisual,
} from '@/components/visuals/AdvancedConceptVisuals'
import { VisualExplainer } from '@/components/visuals/VisualExplainer'
import { PythonPlayground } from '@/components/PythonPlayground'
import { HoverableCode } from '@/components/HoverableCode'
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
    // Small helpers so each visual is paired with its rich "field guide".
    const MatMul = () => <VisualExplainer visualKey="matmul"><MatMulStepVisual /></VisualExplainer>
    const Conv = () => <VisualExplainer visualKey="convolution"><ConvolutionStepVisual /></VisualExplainer>
    const GradDescent = () => <VisualExplainer visualKey="gradientDescent"><GradientDescentStepVisual /></VisualExplainer>
    const Attn = () => <VisualExplainer visualKey="attention"><AttentionStepVisual /></VisualExplainer>
    const AttnHeat = () => <VisualExplainer visualKey="attentionHeatmap"><AttentionHeatmapVisual /></VisualExplainer>
    const Soft = () => <VisualExplainer visualKey="softmax"><SoftmaxStepVisual /></VisualExplainer>
    const Rnn = () => <VisualExplainer visualKey="rnn"><RNNStepVisual /></VisualExplainer>
    const Diff = () => <VisualExplainer visualKey="diffusion"><DiffusionStepVisual /></VisualExplainer>
    const Cnn = () => <VisualExplainer visualKey="cnnFeatureMap"><CNNFeatureMapVisual /></VisualExplainer>
    const Emb = () => <VisualExplainer visualKey="embeddingSpace"><EmbeddingSpaceVisual /></VisualExplainer>
    const Act = () => <VisualExplainer visualKey="activationFunction"><ActivationFunctionVisual /></VisualExplainer>
    const Back = () => <VisualExplainer visualKey="backprop"><BackpropVisualizer /></VisualExplainer>
    const Opt = () => <VisualExplainer visualKey="optimizer"><OptimizerComparisonVisual /></VisualExplainer>
    const Layers = () => <VisualExplainer visualKey="layersFlow"><LayersFlowVisual /></VisualExplainer>
    const Tensor = (title: string, description: string) => (
      <VisualExplainer visualKey="tensor"><TensorVisualizer title={title} description={description} /></VisualExplainer>
    )
    const TensorOp = () => <VisualExplainer visualKey="tensor"><TensorOperationVisual /></VisualExplainer>
    const Train = () => <VisualExplainer visualKey="trainingLoop"><TrainingSimulator /></VisualExplainer>
    const Net = () => <VisualExplainer visualKey="layersFlow"><NeuralNetworkVisualizer /></VisualExplainer>
    const Gan = () => <VisualExplainer visualKey="gan"><GANVisualizer /></VisualExplainer>
    const Rl = () => <VisualExplainer visualKey="rl"><RLVisualizer /></VisualExplainer>
    const Cv = () => <VisualExplainer visualKey="classification"><CVVisualizer /></VisualExplainer>
    const Brain = () => <VisualExplainer visualKey="decorative"><AIBrainVisual /></VisualExplainer>
    const Logo = () => <VisualExplainer visualKey="decorative"><PyTorchLogoVisual /></VisualExplainer>

    switch (topic.id) {
      case 'pytorch-intro':
        return (
          <div className="space-y-6">
            <Logo />
            <MatMul />
            <Brain />
          </div>
        )
      case 'tensor-fundamentals':
        return (
          <div className="space-y-6">
            {Tensor('Tensor Operations', 'Experiment with tensor dimensions and operations')}
            <MatMul />
            <TensorOp />
          </div>
        )
      case 'tensor-broadcasting':
        return (
          <div className="space-y-6">
            {Tensor('Broadcasting Rules', 'See how tensors of different shapes combine')}
            <MatMul />
            <TensorOp />
          </div>
        )
      case 'autograd-basics':
      case 'custom-autograd':
        return (
          <div className="space-y-6">
            <GradDescent />
            <Back />
            <Layers />
          </div>
        )
      case 'nn-module':
        return (
          <div className="space-y-6">
            <Net />
            <MatMul />
            <Act />
            <Soft />
          </div>
        )
      case 'cnn-architectures':
        return (
          <div className="space-y-6">
            <Conv />
            <Cnn />
            <Net />
          </div>
        )
      case 'rnn-lstm':
        return (
          <div className="space-y-6">
            <Rnn />
            <Net />
            <Layers />
          </div>
        )
      case 'transformers':
        return (
          <div className="space-y-6">
            <Attn />
            <AttnHeat />
            <MatMul />
            <Soft />
            <Net />
          </div>
        )
      case 'loss-functions':
        return (
          <div className="space-y-6">
            <Soft />
            <GradDescent />
            <Train />
            <Back />
          </div>
        )
      case 'training-loop':
        return (
          <div className="space-y-6">
            <Train />
            <GradDescent />
            <Back />
          </div>
        )
      case 'optimizers':
        return (
          <div className="space-y-6">
            <Opt />
            <GradDescent />
            <Train />
          </div>
        )
      case 'distributed-training':
        return (
          <div className="space-y-6">
            <Layers />
            <Net />
            <Train />
          </div>
        )
      case 'model-optimization':
        return (
          <div className="space-y-6">
            <Layers />
            <MatMul />
            <Net />
          </div>
        )
      case 'gan-basics':
      case 'dcgan':
      case 'stylegan':
      case 'wgan':
        return (
          <div className="space-y-6">
            <Gan />
            <Conv />
            <GradDescent />
          </div>
        )
      case 'diffusion-models':
        return (
          <div className="space-y-6">
            <Diff />
            <Gan />
            <GradDescent />
          </div>
        )
      case 'rl-basics':
        return (
          <div className="space-y-6">
            <Rl />
            <Soft />
            <GradDescent />
          </div>
        )
      case 'dqn':
        return (
          <div className="space-y-6">
            <Rl />
            <Net />
            <GradDescent />
          </div>
        )
      case 'policy-gradient':
      case 'ppo-trpo':
        return (
          <div className="space-y-6">
            <Rl />
            <Soft />
            <GradDescent />
          </div>
        )
      case 'model-based-rl':
        return (
          <div className="space-y-6">
            <Rl />
            <Layers />
            <Net />
          </div>
        )
      case 'cv-fundamentals':
        return (
          <div className="space-y-6">
            <Conv />
            <Cnn />
            <Cv />
          </div>
        )
      case 'object-detection':
      case 'image-segmentation':
      case 'pose-estimation':
        return (
          <div className="space-y-6">
            <Cv />
            <Conv />
            <Cnn />
          </div>
        )
      case 'word-embeddings':
        return (
          <div className="space-y-6">
            <Emb />
            <Soft />
            <Net />
          </div>
        )
      case 'seq2seq':
        return (
          <div className="space-y-6">
            <Rnn />
            <Attn />
            <AttnHeat />
            <Layers />
          </div>
        )
      case 'bert-transformers':
        return (
          <div className="space-y-6">
            <Attn />
            <AttnHeat />
            <Soft />
            <Emb />
          </div>
        )
      // ─── Phase 2 advanced concepts ───
      case 'torch-compile':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="compile"><CompileVisual /></VisualExplainer>
            <Layers />
          </div>
        )
      case 'hooks':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="hooks"><HooksVisual /></VisualExplainer>
            <Back />
          </div>
        )
      case 'gradient-checkpointing':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="gradientCheckpointing"><GradCheckpointVisual /></VisualExplainer>
            <Back />
            <Layers />
          </div>
        )
      case 'mixed-precision':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="amp"><AMPVisual /></VisualExplainer>
            <GradDescent />
          </div>
        )
      case 'ddp':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="ddp"><DDPVisual /></VisualExplainer>
            <Layers />
          </div>
        )
      case 'fsdp':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="fsdp"><FSDPVisual /></VisualExplainer>
            <VisualExplainer visualKey="ddp"><DDPVisual /></VisualExplainer>
          </div>
        )
      case 'profiler':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="profiler"><ProfilerVisual /></VisualExplainer>
            <Train />
          </div>
        )
      case 'distributions-reparam':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="reparam"><ReparamVisual /></VisualExplainer>
            <Back />
          </div>
        )
      case 'vmap-func':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="vmap"><VmapVisual /></VisualExplainer>
            <MatMul />
          </div>
        )
      case 'weight-init':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="weightInit"><InitVisual /></VisualExplainer>
            <Act />
          </div>
        )
      case 'quantization':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="quantization"><QuantizationVisual /></VisualExplainer>
            <Layers />
          </div>
        )
      case 'pruning':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="pruning"><PruneVisual /></VisualExplainer>
            <Layers />
          </div>
        )
      case 'custom-autograd':
        return (
          <div className="space-y-6">
            <VisualExplainer visualKey="customAutograd"><CustomAutogradVisual /></VisualExplainer>
            <Back />
            <GradDescent />
          </div>
        )
      default:
        // Graceful fallback: every topic gets SOMETHING useful to stare at.
        return (
          <div className="space-y-6">
            <Brain />
            <Layers />
            <MatMul />
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
          <Card className="p-4 bg-gradient-to-br from-card to-muted/20 border-2">
            <p className="text-xs text-muted-foreground mb-3">
              Hover any coloured symbol below for an inline explanation — then jump to the
              <strong className="mx-1">Code</strong> tab to actually run it.
            </p>
            <HoverableCode
              code={getCodeExample(topic.id)}
              title="example.py"
              annotations={getCodeAnnotations(topic.id)}
            />
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
                    <InteractiveGuide topicId={topic.id} />
                    {renderVisualization()}
                  </Card>
                </TabsContent>

                <TabsContent value="code" className="mt-0">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="p-4 bg-gradient-to-br from-card to-muted/20">
                      <div className="flex items-baseline justify-between mb-3">
                        <h3 className="text-lg font-bold">Complete Implementation</h3>
                        <span className="text-[11px] text-muted-foreground">hover symbols for explanations</span>
                      </div>
                      <HoverableCode
                        code={getFullCodeExample(topic.id)}
                        title="full_implementation.py"
                        className="max-h-[640px]"
                        annotations={getCodeAnnotations(topic.id)}
                      />
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-card to-muted/20">
                      <div className="flex items-baseline justify-between mb-3">
                        <h3 className="text-lg font-bold">Try it yourself</h3>
                        <span className="text-[11px] text-muted-foreground">runs in your browser via Pyodide</span>
                      </div>
                      <PythonPlayground initialCode={getRunnableExample(topic.id)} />
                    </Card>
                  </div>
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
    'torch-compile': 'torch.compile is PyTorch 2.x\'s JIT compiler. It traces your model with TorchDynamo, lowers the graph through AOTAutograd, and generates fused GPU kernels via TorchInductor — typically a 20–50% speedup with a one-line change.',
    'hooks': 'Hooks let you attach callbacks to any nn.Module or Tensor — observing or modifying activations and gradients without editing the model. They power feature extraction, gradient debugging, Grad-CAM, and on-the-fly instrumentation.',
    'gradient-checkpointing': 'Gradient checkpointing trades compute for memory: instead of saving every intermediate activation for backward, it re-runs forward on selected segments. A ~30% slowdown buys you square-root memory savings — essential for fitting large models.',
    'mixed-precision': 'Automatic Mixed Precision (AMP) runs forward in fp16/bf16 while keeping master weights in fp32. autocast picks the safe dtype per op and GradScaler prevents underflow — typically 2× faster training with no accuracy loss on modern GPUs.',
    'ddp': 'DistributedDataParallel runs one process per GPU, each with a full model copy. After each backward, ring all-reduce averages gradients across all workers, so every replica steps with the same gradient and stays in sync.',
    'fsdp': 'Fully Sharded Data Parallel shards parameters, gradients, and optimizer state across ranks instead of replicating them. Each layer is gathered just-in-time for forward/backward, then resharded — letting you train models far larger than fit on a single GPU.',
    'profiler': 'torch.profiler captures CPU and CUDA timing, kernel launches, memory usage, and operator stacks. Combined with the TensorBoard plugin or chrome://tracing, it pinpoints which ops, kernels, or data-loader stalls dominate your step time.',
    'distributions-reparam': 'The reparameterization trick rewrites a random sample as a deterministic function of the parameters and a noise variable (e.g. z = μ + σ·ε). This makes sampling differentiable, which is the engine behind VAEs and many policy-gradient variance-reduction tricks.',
    'vmap-func': 'torch.func (formerly functorch) brings JAX-style transforms to PyTorch: vmap auto-batches a function written for one sample, and grad/jacrev/jacfwd compute gradients and Jacobians functionally — without manual loops or stateful modules.',
    'weight-init': 'Weight initialization sets the starting point for optimization. Schemes like Kaiming (He) and Xavier (Glorot) keep activation and gradient variance roughly constant across layers, preventing the vanishing/exploding signals that doom poorly-initialized deep networks.',
    'quantization': 'Quantization replaces fp32 weights and activations with int8 (or lower) representations. Done well — via post-training quantization or quantization-aware training — it shrinks models 4× and accelerates inference 2–4× with negligible accuracy loss.',
    'pruning': 'Pruning zeros out a fraction of the weights — magnitude-based, structured, or learned — then optionally fine-tunes. Combined with sparse kernels or quantization it can dramatically reduce model size and inference cost.',
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
    'torch-compile': [
      { title: 'TorchDynamo', description: 'A Python-level frame evaluation that traces your model into an FX graph by hooking CPython bytecode — handles real Python control flow, falling back gracefully on unsupported constructs.' },
      { title: 'AOTAutograd', description: 'Captures both the forward and the backward graph ahead-of-time, so the backend can fuse and optimize them together rather than interpreting autograd at runtime.' },
      { title: 'TorchInductor Backend', description: 'The default backend lowers FX graphs to fused Triton kernels on GPU and C++/OpenMP on CPU, achieving large speedups on attention, conv, and pointwise-heavy workloads.' },
      { title: 'Modes & Recompilation', description: 'mode="reduce-overhead" uses CUDA Graphs; mode="max-autotune" tunes kernels exhaustively. Each new input shape or dtype triggers a recompile — keep shapes stable to avoid cache misses.' },
      { title: 'Graph Breaks', description: 'Unsupported ops (data-dependent control flow, .item() in the hot path, third-party C extensions) cause graph breaks that fragment fusion. torch._dynamo.explain() shows where they happen.' },
    ],
    'hooks': [
      { title: 'Forward Hooks', description: 'register_forward_hook(fn) fires after a module produces its output; register_forward_pre_hook(fn) fires just before. Both can read or replace the activation.' },
      { title: 'Backward Hooks', description: 'register_full_backward_hook(fn) fires during backward with grad_input/grad_output, letting you log, clip, or modify gradients per layer without touching the loss.' },
      { title: 'Tensor Hooks', description: 'tensor.register_hook(fn) attaches to a single tensor in the autograd graph — perfect for inspecting an intermediate activation\'s gradient.' },
      { title: 'Removing Hooks', description: 'Every register_* call returns a handle with .remove(); forget to call it and your hook leaks across runs, accumulating memory and warping outputs.' },
      { title: 'Use Cases', description: 'Feature extraction, Grad-CAM, gradient norm logging, activation statistics, debugging vanishing/exploding signals, and on-the-fly profiling — all without subclassing the model.' },
    ],
    'gradient-checkpointing': [
      { title: 'Memory ↔ Compute Trade', description: 'Forward normally saves every activation for backward. Checkpointing discards them and recomputes a forward pass on each segment during backward — ~30% extra compute, square-root memory.' },
      { title: 'torch.utils.checkpoint.checkpoint', description: 'Wrap any sub-function (or sequential block via checkpoint_sequential) and PyTorch handles the recompute automatically inside autograd.' },
      { title: 'Where to Apply', description: 'Best on big homogeneous blocks: transformer layers, deep ResNet stages, U-Net encoders. Skip cheap ops — recomputing them isn\'t worth the bookkeeping.' },
      { title: 'use_reentrant Flag', description: 'Set use_reentrant=False (the modern, recommended path) to play nicely with autograd features like inputs that don\'t require gradients.' },
      { title: 'Combine With AMP & FSDP', description: 'Checkpointing stacks cleanly with mixed precision and FSDP — together they unlock 10B+ parameter training on a handful of GPUs.' },
    ],
    'mixed-precision': [
      { title: 'autocast Context', description: 'with torch.autocast("cuda", dtype=torch.float16): wraps your forward; PyTorch picks fp16 for matmul/conv and keeps fp32 for reductions and softmax.' },
      { title: 'GradScaler', description: 'fp16 gradients can underflow to zero. GradScaler multiplies the loss before backward and unscales before optimizer.step(), then dynamically adjusts the scale.' },
      { title: 'fp16 vs bf16', description: 'bf16 has the same exponent range as fp32, so it doesn\'t need a GradScaler — preferred on Ampere+ GPUs and TPUs. fp16 has more precision but narrower range.' },
      { title: 'Master Weights in fp32', description: 'The optimizer always keeps fp32 master weights; only the forward/backward run in low precision. This preserves long-term training stability.' },
      { title: 'When It Helps Most', description: 'Big matmul/conv-heavy nets on Tensor Cores see ~2× speedup. Tiny nets or ones bottlenecked on data loading won\'t benefit much.' },
    ],
    'ddp': [
      { title: 'One Process per GPU', description: 'torch.multiprocessing.spawn or torchrun launches N processes, each pinned to its own device with its own model replica — no GIL contention.' },
      { title: 'Ring All-Reduce', description: 'After backward, gradients are bucketed and averaged across ranks via NCCL\'s ring all-reduce — bandwidth-optimal and overlapped with the rest of backward.' },
      { title: 'DistributedSampler', description: 'Splits the dataset across ranks so every GPU sees a different shard each epoch. Call sampler.set_epoch(epoch) to reshuffle deterministically.' },
      { title: 'Gradient Bucketing', description: 'DDP groups parameters into ~25MB buckets and fires the all-reduce as soon as a bucket\'s grads are ready, hiding communication behind backward compute.' },
      { title: 'no_sync() & Accumulation', description: 'Use the no_sync() context manager between micro-batches to skip the all-reduce until you\'re ready for the real optimizer step — cheap gradient accumulation.' },
    ],
    'fsdp': [
      { title: 'Sharding Parameters', description: 'Each rank only stores 1/N of the parameters, gradients, and optimizer state — memory drops from O(P) to O(P/N), unlocking models that don\'t fit on one GPU.' },
      { title: 'All-Gather on Demand', description: 'Just before a layer\'s forward (and backward), FSDP all-gathers the full parameters, runs the op, then immediately reshards — peak memory is one layer, not the whole model.' },
      { title: 'reduce-scatter for Grads', description: 'Instead of all-reducing then sharding, FSDP fuses both into a single reduce-scatter — gradients land already-sharded, halving comm volume vs naive DDP+ZeRO.' },
      { title: 'Auto-Wrap Policies', description: 'size_based_auto_wrap_policy or transformer_auto_wrap_policy decides which submodules to shard. Per-layer wrapping is the sweet spot for transformers.' },
      { title: 'Mixed Precision & Offload', description: 'FSDP composes with AMP, gradient checkpointing, and CPU offload — the combination is what powers modern 70B+ training on commodity clusters.' },
    ],
    'profiler': [
      { title: 'with profile(...)', description: 'Wrap a few training steps in torch.profiler.profile; specify activities=[CPU, CUDA] and a schedule to skip warmup and capture only the steady state.' },
      { title: 'Schedule', description: 'wait/warmup/active/repeat lets you skip the first N noisy steps then record M clean ones — essential for accurate measurements.' },
      { title: 'TensorBoard Trace Viewer', description: 'tensorboard_trace_handler writes a trace.json the TensorBoard plugin renders as an interactive flame graph, surfacing kernel-level detail.' },
      { title: 'Memory Profiling', description: 'profile_memory=True records every allocation; record_shapes=True groups ops by input shape to identify shape-dependent slowness.' },
      { title: 'Common Findings', description: 'Most slow training falls into a few buckets: GPU starved by the data loader, tiny kernels not fused, .item()/.cpu() syncs in the hot path, or unnecessary host-device copies.' },
    ],
    'distributions-reparam': [
      { title: 'Why Sampling Breaks Gradients', description: 'A raw sample z ~ N(μ, σ) is a non-differentiable function of μ and σ — autograd cannot push gradients through the random number generator.' },
      { title: 'The Trick', description: 'Rewrite z = μ + σ · ε where ε ~ N(0, 1) is sampled independently. Now z is a differentiable function of μ and σ, and ∂z/∂μ, ∂z/∂σ exist.' },
      { title: 'rsample vs sample', description: 'torch.distributions exposes rsample() for distributions that support reparameterization (Normal, MultivariateNormal, ...) and sample() for the rest.' },
      { title: 'VAE Application', description: 'In a variational autoencoder the encoder outputs μ, log σ²; rsample() draws a latent z that the decoder reconstructs from — gradients flow end-to-end.' },
      { title: 'When It Doesn\'t Apply', description: 'Discrete distributions (Categorical, Bernoulli) aren\'t reparameterizable — use Gumbel-Softmax for a continuous relaxation, or score-function (REINFORCE) gradients.' },
    ],
    'vmap-func': [
      { title: 'Functional Style', description: 'torch.func.functional_call(model, params, args) lets you treat a stateful nn.Module as a pure function of its parameters — no hidden state, no in-place updates.' },
      { title: 'vmap', description: 'vmap(fn)(batched_input) runs fn as if it were written for one sample and automatically vectorizes across the leading batch dim — no manual broadcasting.' },
      { title: 'grad / jacrev / jacfwd', description: 'Composable transforms that compute gradients, reverse-mode Jacobians, and forward-mode Jacobians of any pure function — composable with each other and with vmap.' },
      { title: 'Per-Sample Gradients', description: 'vmap(grad(loss_fn))(params, x, y) gives one gradient tensor per sample — historically painful in PyTorch, now a one-liner. Powers DP-SGD and influence functions.' },
      { title: 'Limits', description: 'Functions with Python-level control flow that depends on tensor data, in-place ops, or random sampling outside the supported set won\'t vmap cleanly.' },
    ],
    'weight-init': [
      { title: 'Why Initialization Matters', description: 'A bad init makes every layer\'s output explode or collapse to zero — gradients follow suit and training never starts. A good init keeps signal variance ≈ 1 across depth.' },
      { title: 'Xavier / Glorot', description: 'Variance = 2/(fan_in + fan_out). Designed for symmetric activations like tanh and sigmoid; preserves variance in both forward and backward.' },
      { title: 'Kaiming / He', description: 'Variance = 2/fan_in. Designed for ReLU-family activations which kill ~half the signal — the 2× compensates. The default for almost all modern conv/MLP nets.' },
      { title: 'Orthogonal & Identity', description: 'Orthogonal initialization preserves norms exactly through linear layers — popular in RNNs and policy networks. Identity (or near-identity) is used in residual blocks for stable training of very deep nets.' },
      { title: 'Special Cases', description: 'BatchNorm γ to 1, β to 0; biases to 0; LayerNorm γ to 1; embeddings to N(0, 0.02). The last residual block in a transformer is often zero-initialized so the model starts as the identity.' },
    ],
    'quantization': [
      { title: 'Dynamic Quantization', description: 'torch.quantization.quantize_dynamic converts weights to int8 ahead of time and quantizes activations on the fly. Zero-config; great for LSTMs and Linear-heavy models.' },
      { title: 'Static (Post-Training) Quantization', description: 'Calibrate with a few hundred representative inputs to learn activation scales, then convert the whole model. Best accuracy without retraining.' },
      { title: 'Quantization-Aware Training (QAT)', description: 'Insert fake-quant nodes during training so the model learns weights that are robust to int8 rounding — recovers most of the accuracy lost by aggressive quantization.' },
      { title: 'Per-Tensor vs Per-Channel', description: 'Per-channel scales (one per output channel of a conv/linear) are noticeably more accurate than a single per-tensor scale and cost almost nothing extra at inference.' },
      { title: 'Backends & Targets', description: 'fbgemm for x86 servers, qnnpack for mobile/ARM, ExecuTorch / TensorRT / ONNX Runtime for production. Always benchmark on the real target device, not just the dev box.' },
    ],
    'pruning': [
      { title: 'Magnitude Pruning', description: 'Zero out the smallest |w| weights. The simplest baseline and surprisingly competitive — especially with iterative pruning + fine-tuning.' },
      { title: 'Unstructured vs Structured', description: 'Unstructured prunes individual weights (great compression, needs sparse kernels). Structured prunes whole channels/heads (lower compression, but actually faster on dense hardware).' },
      { title: 'torch.nn.utils.prune', description: 'PyTorch ships pruning APIs (l1_unstructured, ln_structured, global_unstructured) that attach a mask buffer; the underlying weight is preserved for further fine-tuning.' },
      { title: 'Iterative Pruning + Fine-Tune', description: 'Prune a small fraction, fine-tune to recover, repeat. Reaches much higher sparsity than one-shot pruning at the same accuracy.' },
      { title: 'Lottery Ticket Hypothesis', description: 'Inside large nets there exist sparse sub-networks ("winning tickets") that, when trained from the original init, match the dense model. Foundational for understanding why pruning works.' },
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

    'torch-compile': `import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(1024, 4096), nn.GELU(),
    nn.Linear(4096, 4096), nn.GELU(),
    nn.Linear(4096, 1024),
).cuda()

# One line — graph capture + fused Triton kernels
compiled = torch.compile(model, mode="reduce-overhead")

x = torch.randn(64, 1024, device="cuda")
for _ in range(3):           # first call compiles, later calls are fast
    y = compiled(x)
print(y.shape)

# Inspect why a graph break happened
# import torch._dynamo as dynamo
# explanation = dynamo.explain(model)(x)
# print(explanation)` ,

    'hooks': `import torch
import torch.nn as nn

model = nn.Sequential(nn.Linear(8, 16), nn.ReLU(), nn.Linear(16, 4))

activations = {}
def save_act(name):
    def hook(module, inputs, output):
        activations[name] = output.detach()
    return hook

h1 = model[0].register_forward_hook(save_act("linear1"))
h2 = model[2].register_forward_hook(save_act("linear2"))

x = torch.randn(2, 8)
out = model(x)
print({k: v.shape for k, v in activations.items()})

# IMPORTANT: remove hooks when done — otherwise they leak and warp future runs
h1.remove(); h2.remove()` ,

    'gradient-checkpointing': `import torch
import torch.nn as nn
from torch.utils.checkpoint import checkpoint_sequential

class DeepBlock(nn.Module):
    def __init__(self, d=1024):
        super().__init__()
        self.layers = nn.Sequential(*[
            nn.Sequential(nn.Linear(d, d), nn.GELU()) for _ in range(24)
        ])
    def forward(self, x):
        # Recompute activations for backward in 4 chunks
        return checkpoint_sequential(self.layers, segments=4, input=x,
                                      use_reentrant=False)

model = DeepBlock().cuda()
x = torch.randn(8, 1024, device="cuda", requires_grad=True)
loss = model(x).sum()
loss.backward()
print("backward done with checkpointed memory")` ,

    'mixed-precision': `import torch
import torch.nn as nn

model = nn.Linear(1024, 1024).cuda()
opt   = torch.optim.AdamW(model.parameters(), lr=1e-3)
scaler = torch.cuda.amp.GradScaler()      # fp16 needs a scaler; bf16 does not

for step in range(5):
    x = torch.randn(64, 1024, device="cuda")
    y = torch.randn(64, 1024, device="cuda")

    opt.zero_grad(set_to_none=True)
    with torch.autocast("cuda", dtype=torch.float16):
        pred = model(x)
        loss = ((pred - y) ** 2).mean()

    scaler.scale(loss).backward()         # scaled grads
    scaler.unscale_(opt)                  # unscale before clip
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    scaler.step(opt)
    scaler.update()
    print(step, float(loss))` ,

    'ddp': `# Run with: torchrun --nproc_per_node=4 train_ddp.py
import os, torch, torch.nn as nn
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

def main():
    dist.init_process_group("nccl")
    rank = dist.get_rank()
    torch.cuda.set_device(rank)

    model = nn.Linear(1024, 1024).cuda(rank)
    model = DDP(model, device_ids=[rank])
    opt = torch.optim.AdamW(model.parameters(), lr=1e-3)

    for step in range(10):
        x = torch.randn(32, 1024, device=rank)
        y = torch.randn(32, 1024, device=rank)
        opt.zero_grad(set_to_none=True)
        loss = ((model(x) - y) ** 2).mean()
        loss.backward()      # ring all-reduce happens here automatically
        opt.step()
        if rank == 0:
            print(step, float(loss))

    dist.destroy_process_group()

if __name__ == "__main__":
    main()` ,

    'fsdp': `# Run with: torchrun --nproc_per_node=4 train_fsdp.py
import torch, torch.nn as nn
import torch.distributed as dist
from torch.distributed.fsdp import FullyShardedDataParallel as FSDP
from torch.distributed.fsdp.wrap import size_based_auto_wrap_policy
import functools

def main():
    dist.init_process_group("nccl")
    rank = dist.get_rank()
    torch.cuda.set_device(rank)

    model = nn.Sequential(*[
        nn.Sequential(nn.Linear(2048, 2048), nn.GELU()) for _ in range(24)
    ]).cuda(rank)

    wrap_policy = functools.partial(size_based_auto_wrap_policy,
                                    min_num_params=1_000_000)
    model = FSDP(model, auto_wrap_policy=wrap_policy)

    opt = torch.optim.AdamW(model.parameters(), lr=1e-4)
    for step in range(5):
        x = torch.randn(8, 2048, device=rank)
        opt.zero_grad(set_to_none=True)
        loss = model(x).sum()
        loss.backward()      # reduce-scatter, not all-reduce
        opt.step()
        if rank == 0:
            print(step, float(loss))

    dist.destroy_process_group()

if __name__ == "__main__":
    main()` ,

    'profiler': `import torch
import torch.nn as nn
from torch.profiler import profile, ProfilerActivity, schedule, tensorboard_trace_handler

model = nn.Linear(1024, 1024).cuda()
opt = torch.optim.SGD(model.parameters(), lr=1e-3)

with profile(
    activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],
    schedule=schedule(wait=1, warmup=1, active=3, repeat=1),
    on_trace_ready=tensorboard_trace_handler("./tb_logs"),
    record_shapes=True,
    profile_memory=True,
    with_stack=True,
) as prof:
    for step in range(6):
        x = torch.randn(64, 1024, device="cuda")
        opt.zero_grad(set_to_none=True)
        loss = model(x).sum()
        loss.backward()
        opt.step()
        prof.step()

print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=10))
# Then: tensorboard --logdir ./tb_logs` ,

    'distributions-reparam': `import torch
import torch.nn as nn
from torch.distributions import Normal

class VAEEncoder(nn.Module):
    def __init__(self, in_dim=784, z_dim=32):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(in_dim, 256), nn.ReLU())
        self.mu     = nn.Linear(256, z_dim)
        self.logvar = nn.Linear(256, z_dim)

    def forward(self, x):
        h = self.net(x)
        mu, logvar = self.mu(h), self.logvar(h)
        std = (0.5 * logvar).exp()

        # reparameterization trick — gradient flows through mu and std
        q = Normal(mu, std)
        z = q.rsample()                       # NOT q.sample()

        kl = 0.5 * (mu.pow(2) + std.pow(2) - 1 - 2 * std.log()).sum(-1)
        return z, kl

enc = VAEEncoder()
z, kl = enc(torch.randn(4, 784))
print(z.shape, kl.shape)` ,

    'vmap-func': `import torch
from torch.func import vmap, grad, functional_call
import torch.nn as nn

model = nn.Sequential(nn.Linear(10, 32), nn.ReLU(), nn.Linear(32, 1))
params = dict(model.named_parameters())

def loss_fn(params, x, y):
    pred = functional_call(model, params, (x.unsqueeze(0),)).squeeze()
    return (pred - y) ** 2

x = torch.randn(64, 10)
y = torch.randn(64)

# Per-sample gradients in one line
per_sample_grad = vmap(grad(loss_fn), in_dims=(None, 0, 0))(params, x, y)
for name, g in per_sample_grad.items():
    print(name, g.shape)      # leading dim is the batch` ,

    'weight-init': `import torch
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 256)
        self.fc2 = nn.Linear(256, 256)
        self.fc3 = nn.Linear(256, 10)
        self.apply(self._init_weights)

    @staticmethod
    def _init_weights(m):
        if isinstance(m, nn.Linear):
            nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
            nn.init.zeros_(m.bias)
        elif isinstance(m, (nn.BatchNorm1d, nn.LayerNorm)):
            nn.init.ones_(m.weight)
            nn.init.zeros_(m.bias)

model = MLP()
x = torch.randn(8, 784)
h = torch.relu(model.fc1(x))
print("layer-1 activation std:", h.std().item())   # should be ~1, not 0.01 or 100` ,

    'quantization': `import torch
import torch.nn as nn
import torch.ao.quantization as tq

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.quant   = tq.QuantStub()
        self.fc1     = nn.Linear(784, 256)
        self.relu    = nn.ReLU()
        self.fc2     = nn.Linear(256, 10)
        self.dequant = tq.DeQuantStub()
    def forward(self, x):
        x = self.quant(x); x = self.relu(self.fc1(x))
        return self.dequant(self.fc2(x))

model = MLP().eval()
model.qconfig = tq.get_default_qconfig("fbgemm")
tq.prepare(model, inplace=True)

# Calibrate with a few representative batches
for _ in range(20):
    model(torch.randn(8, 784))

int8_model = tq.convert(model, inplace=False)
print(int8_model)
print("size MB:", sum(p.numel() for p in int8_model.parameters()) * 1e-6)` ,

    'pruning': `import torch
import torch.nn as nn
import torch.nn.utils.prune as prune

model = nn.Sequential(nn.Linear(784, 256), nn.ReLU(), nn.Linear(256, 10))

# Prune 40% of weights globally by magnitude
params_to_prune = [(model[0], "weight"), (model[2], "weight")]
prune.global_unstructured(
    params_to_prune,
    pruning_method=prune.L1Unstructured,
    amount=0.4,
)

for name, module in [("fc1", model[0]), ("fc2", model[2])]:
    sparsity = float(torch.sum(module.weight == 0)) / module.weight.numel()
    print(f"{name} sparsity: {sparsity:.0%}")

# Make the pruning permanent (drops the mask, bakes zeros into the weight)
for module, name in params_to_prune:
    prune.remove(module, name)` ,
  }
  
  return examples[topicId] || `# PyTorch code example for ${topicId}
import torch
import torch.nn as nn

# Implementation details here...`
}

/**
 * Short, browser-runnable snippets for the Pyodide playground.
 * These avoid .backward() side-effects and use only the subset of PyTorch
 * that the in-browser numpy-backed shim implements. They are designed to
 * PRINT something observable within a few seconds. Topics not listed here
 * fall back to getCodeExample() — most of those also work because the shim
 * makes .backward() / optimizer.step() into silent no-ops.
 */
function getRunnableExample(topicId: string): string {
  const runnable: Record<string, string> = {
    'pytorch-intro': `# Hello, PyTorch (in your browser!)
import torch

print("torch version:", torch.__version__)
print("cuda available:", torch.cuda.is_available())

x = torch.randn(3, 3)
print("random 3x3 tensor:")
print(x)
print("shape:", x.shape, "| dtype:", x.dtype)`,

    'tensor-fundamentals': `import torch

# Five ways to make a tensor
a = torch.tensor([[1., 2.], [3., 4.]])
b = torch.zeros(2, 3)
c = torch.ones(2, 3)
d = torch.randn(2, 3)       # N(0,1)
e = torch.arange(0, 10)     # 0..9

print("a + a =", (a + a).tolist())
print("a @ a =", (a @ a).tolist())     # matrix multiply
print("a.sum():", a.sum().item())
print("d.shape:", d.shape)`,

    'tensor-broadcasting': `import torch

# (3,1) + (1,4)  ->  (3,4) via broadcasting
a = torch.tensor([[1.], [2.], [3.]])
b = torch.tensor([[10., 20., 30., 40.]])
print("a shape:", a.shape, "| b shape:", b.shape)
print("a + b shape:", (a + b).shape)
print("a + b =")
print(a + b)

# Per-feature bias applied across a batch
batch = torch.randn(4, 5)
bias  = torch.randn(5)
print("(batch + bias).shape =", (batch + bias).shape)`,

    'autograd-basics': `import torch

# Track gradients
x = torch.tensor([2.0], requires_grad=True)
y = torch.tensor([3.0], requires_grad=True)

# z = x*y + y^2     →   dz/dx = y = 3,   dz/dy = x + 2y = 8
z = x * y + y**2
print("z =", z.item())

z.backward()   # real reverse-mode autograd (in-browser)
print("dz/dx (should be 3):", x.grad.tolist())
print("dz/dy (should be 8):", y.grad.tolist())`,

    'computation-graph': `import torch

# Every op builds a node in the computation graph
x = torch.tensor([1., 2., 3.], requires_grad=True)
y = (x ** 2).sum()
print("x:", x.tolist())
print("y = sum(x^2) =", y.item())
print("grad_fn:", y.requires_grad)   # tracked`,

    'nn-module': `import torch
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(4, 8)
        self.fc2 = nn.Linear(8, 3)
    def forward(self, x):
        h = torch.relu(self.fc1(x))
        return self.fc2(h)

model = MLP()
x = torch.randn(2, 4)            # batch of 2, features 4
out = model(x)
print("input:", x.shape)
print("output:", out.shape)
print("params:", sum(p.numel() for p in model.parameters()))`,

    'activation-functions': `import torch
import torch.nn.functional as F

x = torch.linspace(-3, 3, 7)
print("x       :", [round(v,2) for v in x.tolist()])
print("relu    :", [round(v,2) for v in F.relu(x).tolist()])
print("sigmoid :", [round(v,2) for v in F.sigmoid(x).tolist()])
print("tanh    :", [round(v,2) for v in F.tanh(x).tolist()])
print("gelu    :", [round(v,2) for v in F.gelu(x).tolist()])`,

    'loss-functions': `import torch
import torch.nn as nn
import torch.nn.functional as F

# 1) regression loss
pred = torch.tensor([2.5, 0.0, 2.0, 8.0])
true = torch.tensor([3.0, -0.5, 2.0, 7.0])
print("MSE =", F.mse_loss(pred, true).item())

# 2) classification loss (raw logits + integer labels)
logits = torch.randn(4, 3)       # batch 4, 3 classes
targets = torch.tensor([0, 2, 1, 0])
print("CrossEntropy =", F.cross_entropy(logits, targets).item())`,

    'optimizers': `import torch
import torch.nn as nn
import torch.optim as optim

torch.manual_seed(0)
model = nn.Sequential(nn.Linear(10, 5), nn.ReLU(), nn.Linear(5, 1))
opt = optim.Adam(model.parameters(), lr=5e-2)
loss_fn = nn.MSELoss()

x = torch.randn(32, 10)
y = torch.randn(32, 1)

for step in range(20):
    opt.zero_grad()
    loss = loss_fn(model(x), y)
    loss.backward()
    opt.step()
    if step % 4 == 0:
        print(f"step {step:>2}: loss = {loss.item():.4f}")
print(f"final:   loss = {loss.item():.4f}   ← Adam actually updated the weights")`,

    'training-loop': `import torch, torch.nn as nn, torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader

torch.manual_seed(0)
# tiny synthetic dataset: label = is sum(x) positive?
X = torch.randn(256, 4)
y = (X.sum(dim=1) > 0).long()
ds = TensorDataset(X, y)
dl = DataLoader(ds, batch_size=32, shuffle=True)

model = nn.Sequential(nn.Linear(4, 16), nn.ReLU(), nn.Linear(16, 2))
opt   = optim.Adam(model.parameters(), lr=5e-2)
loss_fn = nn.CrossEntropyLoss()

for epoch in range(5):
    total = 0.0
    for xb, yb in dl:
        opt.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()
        opt.step()
        total += loss.item()
    # eval accuracy on the full set
    with torch.no_grad():
        pred = model(X)
        acc = (pred.argmax(dim=1) == y).float().mean().item()
    print(f"epoch {epoch}: avg loss = {total/len(dl):.4f}   train-acc = {acc*100:.1f}%")`,

    'datasets-dataloaders': `import torch
from torch.utils.data import TensorDataset, DataLoader

X = torch.arange(20).view(10, 2).float()
y = torch.arange(10).float()
ds = TensorDataset(X, y)
dl = DataLoader(ds, batch_size=3, shuffle=False)

print(f"{len(ds)} samples, {len(dl)} batches of up to 3")
for i, (xb, yb) in enumerate(dl):
    print(f" batch {i}: x.shape={list(xb.shape)}, y={yb.tolist()}")`,

    'cnn-fundamentals': `import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Conv2d(1, 8, kernel_size=3, padding=1),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Conv2d(8, 16, kernel_size=3, padding=1),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Flatten(),
    nn.Linear(16 * 7 * 7, 10),
)

x = torch.randn(2, 1, 28, 28)   # batch of 2 "MNIST" images
out = model(x)
print("input :", x.shape)
print("logits:", out.shape)`,

    'rnn-lstm': `import torch
import torch.nn as nn

# Minimal sequence model: embed -> linear per timestep
vocab, d = 20, 16
embed = nn.Embedding(vocab, d)
head  = nn.Linear(d, vocab)

tokens = torch.randint(0, vocab, (2, 8))   # batch 2, seq 8
h = embed(tokens)
logits = head(h)
print("tokens :", tokens.shape)
print("embeds :", h.shape)
print("logits :", logits.shape)`,

    'transformers': `import torch
import torch.nn as nn
import torch.nn.functional as F

# A single self-attention head, written from scratch
B, T, d = 2, 5, 16
x = torch.randn(B, T, d)

Wq, Wk, Wv = nn.Linear(d,d), nn.Linear(d,d), nn.Linear(d,d)
q, k, v = Wq(x), Wk(x), Wv(x)

scores = (q @ k.transpose(1,2)) / (d**0.5)
attn   = F.softmax(scores, dim=-1)
out    = attn @ v
print("attn shape   :", attn.shape)
print("out shape    :", out.shape)
print("row 0 weights:", [round(v,3) for v in attn[0,0].tolist()])`,
  }
  return runnable[topicId] || `# ${topicId} — your turn!
# The in-browser runtime is a numpy-backed torch shim. It supports
# tensors, nn.Linear, activations, MSE / CrossEntropy, SGD and Adam with
# real reverse-mode autograd. Conv2d / Embedding / BatchNorm are
# forward-only shims. Click "Open in Colab" for the genuine runtime.

import torch
import torch.nn as nn

# try a small model — this is guaranteed to run and converge:
torch.manual_seed(0)
x = torch.randn(16, 8)
y = torch.randn(16, 1)

model = nn.Sequential(nn.Linear(8, 4), nn.ReLU(), nn.Linear(4, 1))
opt   = torch.optim.Adam(model.parameters(), lr=5e-2)
loss_fn = nn.MSELoss()

for step in range(10):
    opt.zero_grad()
    loss = loss_fn(model(x), y)
    loss.backward()
    opt.step()
    print(f"step {step}: loss = {loss.item():.4f}")
`
}

/**
 * Per-line plain-English commentary for the snippets returned by getCodeExample().
 * Keys are 1-based line numbers matching the source string. Topics without an
 * entry simply get no line annotations (the "Explain each line" button is hidden).
 */
function getCodeAnnotations(topicId: string): Record<number, string> | undefined {
  const a: Record<string, Record<number, string>> = {
    'pytorch-intro': {
      1: 'Import the PyTorch package — this is always your starting point.',
      3: 'Comment: a quick sanity check that PyTorch installed correctly.',
      4: 'Print the installed version (e.g. "2.3.0").',
      5: 'Ask PyTorch whether a CUDA-capable GPU is visible right now.',
      7: 'Comment: decide ONCE where tensors live, then reuse that device everywhere.',
      8: 'Build a torch.device — "cuda" if a GPU exists, otherwise "cpu". Portable code uses this idiom.',
      10: 'Comment: now actually create some data on the chosen device.',
      11: 'Draw a 3×3 random tensor from N(0,1) and place it on the device directly (no .to() needed).',
      12: 'Show the tensor values.',
      13: "Inspect metadata: .device tells you where it lives, .dtype its numeric type (float32 by default).",
    },
    'tensor-fundamentals': {
      1: 'Import PyTorch.',
      3: 'Comment: three common ways to build tensors.',
      4: 'From a Python list → 1-D int64 tensor of length 5.',
      5: '3×3 tensor filled with 0.0 (float32).',
      6: '2×4 tensor of samples from a standard normal distribution.',
      8: 'Comment: math on tensors is element-wise and broadcast-aware by default.',
      9: 'A 2×2 matrix literal.',
      10: 'Another 2×2 matrix literal.',
      12: 'Element-wise addition — same shape in, same shape out.',
      13: 'Matrix multiplication: (2×2) @ (2×2) = (2×2). Same as a @ b.',
      14: 'Element-wise (Hadamard) product — not the same as matrix multiply!',
      16: 'Comment: and finally, GPU placement.',
      17: 'Only try to move if a GPU is available (otherwise .cuda() raises).',
      18: 'Copy `a` onto the default CUDA device. Returns a NEW tensor; the CPU copy still exists.',
      19: 'Equivalent, more explicit: .to("cuda") also accepts a torch.device or a dtype.',
    },
    'tensor-broadcasting': {
      1: 'Import PyTorch.',
      3: 'Comment: broadcasting lets shapes line up automatically.',
      4: 'Column vector, shape (3,1).',
      5: 'Row vector, shape (1,4).',
      6: 'Adding them stretches both to the compatible shape (3,4) without copying data.',
      8: 'Comment: the everyday use — apply a per-feature bias to a batch.',
      9: 'Batch of 32 rows, 128 features each.',
      10: 'One bias per feature — shape (128,).',
      11: 'PyTorch treats `bias` as if it were (1,128) and broadcasts it across all 32 rows.',
      13: 'Comment: boolean indexing keeps only the values that match a condition.',
      14: 'A 1-D tensor of 5 random floats.',
      15: 'Pick the entries where x>0 is True → variable-length result.',
      17: 'Comment: gather/scatter — fancy indexing for picking class-specific values.',
      18: 'Fake classifier output: 4 examples × 10 classes.',
      19: 'One label per example.',
      20: 'For each row i, pick logits[i, labels[i]] — the logit of the true class.',
    },
    'autograd-basics': {
      1: 'Import PyTorch.',
      3: 'Comment: requires_grad=True turns on gradient tracking for a tensor.',
      4: 'Leaf tensor x=2, with a gradient slot waiting to be filled.',
      5: 'Leaf tensor y=3, also tracked.',
      7: 'Comment: build an expression — each op records itself in the autograd graph.',
      8: 'z = x² + y³ → uses the tracked x and y, so z.grad_fn is set.',
      10: 'Comment: now run reverse-mode autodiff.',
      11: '.backward() walks the graph backwards and fills x.grad and y.grad.',
      13: 'dz/dx = 2x = 4.0.',
      14: 'dz/dy = 3y² = 27.0.',
      16: 'Comment: gradients ACCUMULATE — you must zero them before the next backward.',
      17: 'In-place reset x.grad → 0.',
      18: 'Build a new expression z2 = x³.',
      19: 'Backward again — fills x.grad with 3x² = 12.',
      20: 'Print to verify.',
    },
    'nn-module': {
      1: 'Import PyTorch.',
      2: 'Alias the neural-network submodule as `nn` — the standard convention.',
      4: 'Define a model class by subclassing nn.Module. Every layer you want trainable lives here.',
      5: '__init__ receives the hyperparameters you want to configure.',
      6: 'Always call super().__init__() — it wires up parameter tracking.',
      7: 'First learnable layer: fully-connected (input_size → hidden_size).',
      8: 'Activation module — could also use torch.relu in forward().',
      9: 'Output layer (hidden_size → output_size). Produces raw logits.',
      11: 'forward() defines HOW data flows. PyTorch calls it automatically when you do model(x).',
      12: 'Layer 1: affine transform.',
      13: 'Non-linearity so the network can learn non-linear patterns.',
      14: 'Layer 2: final projection to output_size.',
      15: 'Return the logits.',
      17: 'Comment: instantiate and run a forward pass.',
      18: 'Typical MNIST-sized model: 784 pixels → 128 hidden → 10 classes.',
      19: 'A batch of 32 flattened images (32 × 784).',
      20: 'Calling the module is equivalent to model.forward(input_data) + hooks + eval/train flags.',
    },
    'loss-functions': {
      1: 'Import PyTorch.',
      2: 'Import the nn submodule for built-in loss classes.',
      4: 'Comment: regression.',
      5: 'Fake predictions and targets, both shaped (16,1).',
      6: 'Mean-squared error — average of (pred − target)².',
      8: 'Comment: multi-class classification — feed RAW logits, not softmax.',
      9: 'Logits for 16 examples × 10 classes.',
      10: 'One integer label per example in [0,10).',
      11: 'CrossEntropyLoss applies log-softmax + NLL internally — numerically stable.',
      13: 'Comment: multi-label / binary — each column is an independent yes/no.',
      14: 'Raw logits shaped (16,5).',
      15: 'Binary targets (0/1), cast to float for BCE.',
      16: 'BCEWithLogitsLoss fuses sigmoid + BCE for stability.',
      18: 'Print all three loss values as plain Python floats.',
    },
    'optimizers': {
      1: 'Import PyTorch.',
      2: 'Import the nn submodule.',
      3: 'AdamW = Adam with decoupled weight decay — the modern default.',
      4: 'LR scheduler that slowly anneals the learning rate along a cosine curve.',
      6: 'A toy linear model for illustration.',
      8: 'Comment: apply weight decay ONLY to true weight matrices, not biases/norms.',
      9: 'Two parameter groups we will build up.',
      10: 'Walk every named parameter in the model.',
      11: '1-D tensors are biases or norm scales — exclude them from decay.',
      12: 'Put them in the no-decay bucket.',
      13: 'Otherwise it is a weight matrix/tensor — decay it.',
      14: 'Put it in the decay bucket.',
      16: 'Build the optimizer with TWO groups — each gets its own weight_decay.',
      17: 'Decay group: 1e-2.',
      18: 'No-decay group: 0.0.',
      19: 'Shared learning rate and Adam betas for both groups.',
      21: 'Wrap the optimizer with the scheduler. T_max = number of epochs over which to anneal.',
      23: 'Training loop skeleton.',
      24: 'Comment: real forward/backward/step would go here each iteration.',
      25: 'Advance the scheduler once per epoch (some schedulers step per iteration — read the docs).',
    },
    'training-loop': {
      1: 'Import PyTorch.',
      2: 'DataLoader iterates mini-batches from a Dataset.',
      4: 'One epoch of training as a reusable function.',
      5: 'Put the model in training mode (enables Dropout / BatchNorm updates).',
      6: 'Running total of weighted losses over the whole epoch.',
      7: 'Iterate batches: x=inputs, y=labels.',
      8: 'Move data to the same device as the model.',
      9: 'Clear old gradients — they accumulate by default.',
      10: 'Forward pass + loss in one line.',
      11: 'Reverse-mode autodiff fills .grad on every parameter.',
      12: 'Apply one gradient-descent step with the configured optimizer.',
      13: 'Weight the batch loss by its actual size so the epoch average is correct.',
      14: 'Return average per-example loss over the epoch.',
      16: 'Decorator: disable autograd everywhere inside evaluate() — faster, uses less memory.',
      17: 'Same idea, but for evaluation only.',
      18: 'Switch to eval mode (disables Dropout, freezes BN running stats).',
      19: 'Running total of losses.',
      20: 'Iterate the eval loader.',
      21: 'Move to device.',
      22: 'Add this batch\'s contribution — no .backward() needed.',
      23: 'Return mean per-example eval loss.',
    },
    'cnn-architectures': {
      1: 'Import PyTorch.',
      2: 'Import the nn submodule.',
      4: 'Define a small CNN suitable for CIFAR-10-sized images.',
      5: '__init__ receives the number of output classes.',
      6: 'Call super — required for every nn.Module.',
      7: 'Feature extractor — a stack of Conv + Norm + ReLU + Pool blocks.',
      8: 'First conv: 3 input channels (RGB) → 32 feature maps, 3×3 kernel, padding=1 keeps spatial size.',
      9: 'BatchNorm + ReLU applied in place for memory efficiency.',
      10: 'Halve the spatial dimensions (32×32 → 16×16).',
      11: 'Second conv block: 32 → 64 channels.',
      12: 'Norm + non-linearity.',
      13: 'Downsample again (16×16 → 8×8).',
      15: 'Classifier head that maps features → class scores.',
      16: 'Global average pool → 1×1 spatial regardless of input size.',
      17: 'Flatten (N,64,1,1) → (N,64).',
      18: 'Final linear layer → (N, num_classes) logits.',
      21: 'Forward pass: features then classifier, as expected.',
      24: 'Instantiate the default 10-class model.',
      25: 'Run a fake batch of 8 RGB 32×32 images through it.',
      26: 'Expect the output shape (8, 10).',
    },
    'transformers': {
      1: 'Import PyTorch.',
      2: 'Import the nn submodule.',
      4: 'Comment: PyTorch ships a ready-made Transformer encoder block.',
      5: 'Build ONE encoder layer with the common hyperparameters.',
      6: 'd_model = embedding size, nhead = 8 attention heads, FFN inner dim = 2048.',
      7: 'dropout 0.1, batch_first=True → tensors shaped (batch, seq, d_model); norm_first is the "pre-norm" variant used in modern LLMs.',
      9: 'Stack 6 identical encoder layers — same idea as BERT-base depth/2.',
      11: 'Comment: build a toy batch.',
      12: 'Batch=32, sequence length=100, embedding dim=512.',
      13: 'Comment: a padding mask marks positions that should be IGNORED by attention.',
      14: 'Here everything is "real" tokens (all False).',
      16: 'Forward: mask is passed through src_key_padding_mask.',
      17: 'Output shape unchanged — (32, 100, 512).',
    },
  }
  return a[topicId]
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
    'torch-compile': [
      'Compile the whole model once at the top — don\'t compile inside the training loop',
      'Use mode="reduce-overhead" for small/medium models, mode="max-autotune" for the final perf squeeze',
      'Keep input shapes stable — every new shape triggers a recompile and pollutes the cache',
      'Run torch._dynamo.explain() on a tricky model to find graph breaks before they hurt you',
      'Avoid .item(), .cpu(), or data-dependent control flow in the hot path; they force graph breaks',
    ],
    'hooks': [
      'Always keep the handle returned by register_*_hook and call .remove() — leaked hooks are a top source of phantom bugs',
      'Use forward hooks for activations, full_backward hooks for gradients — don\'t mix them up',
      'Detach tensors stored from a hook (output.detach()) or you\'ll keep the entire graph alive',
      'Avoid mutating activations in a forward hook unless you really mean to — return a new tensor instead',
      'For per-layer instrumentation, prefer hooks over modifying the model — keeps the model definition clean',
    ],
    'gradient-checkpointing': [
      'Use use_reentrant=False on new code; the reentrant variant has subtle bugs with non-tensor inputs',
      'Apply to big homogeneous blocks (transformer layers, U-Net stages) — not to cheap pointwise ops',
      'Combine with mixed precision and FSDP for the full memory-saving stack',
      'Verify correctness with a small dense run first; checkpointed and non-checkpointed losses must match exactly',
      'Don\'t checkpoint layers that contain randomness (dropout) without seeding properly — recompute will diverge',
    ],
    'mixed-precision': [
      'Prefer bf16 on Ampere/Hopper GPUs and TPUs — no GradScaler needed and the wider range avoids most NaNs',
      'Always pair fp16 autocast with GradScaler; without scaling, gradients underflow to zero',
      'Call scaler.unscale_(optimizer) before gradient clipping, then scaler.step(optimizer)',
      'Wrap only the forward (and loss) in autocast — leave optimizer.step() and the loss-backward dispatch outside',
      'Watch loss for NaNs in the first ~100 steps; if they appear, lower the initial scale or switch to bf16',
    ],
    'ddp': [
      'Always use torchrun (or torch.distributed.launch) — never spawn processes manually for production',
      'Wrap the model in DDP after moving it to the correct device, never before',
      'Use DistributedSampler and call sampler.set_epoch(epoch) every epoch for proper shuffling',
      'Restrict logging, checkpointing, and validation to rank 0 — every rank doing it wastes I/O and clobbers files',
      'Use no_sync() between micro-batches when accumulating gradients to skip redundant all-reduces',
    ],
    'fsdp': [
      'Use a transformer or size-based auto-wrap policy — manual wrapping is fragile',
      'Combine FSDP with mixed precision (fp16/bf16) and gradient checkpointing for max memory savings',
      'Save with FSDP\'s state_dict APIs (full_state_dict or sharded) — naive .state_dict() gives you only the local shard',
      'Pin one process per GPU with torchrun and set torch.cuda.set_device(rank) early',
      'Profile communication: if reduce-scatter dominates, try a coarser auto-wrap or backward_prefetch=BACKWARD_PRE',
    ],
    'profiler': [
      'Always use a schedule with wait/warmup steps — the first few iterations are noisy and skew everything',
      'Use the TensorBoard profiler plugin for the trace viewer — it makes regressions obvious',
      'Sort by cuda_time_total to find slow GPU ops, by cpu_time_total to find Python-side overhead',
      'Enable profile_memory=True only when investigating OOMs — it slows runs noticeably',
      'Profile in your real environment with the real batch size; toy runs hide the most important bottlenecks',
    ],
    'distributions-reparam': [
      'Use rsample() (not sample()) when you need gradients to flow through the random draw',
      'Parameterize log σ instead of σ — keeps σ positive and stabilizes training',
      'For discrete distributions, reach for Gumbel-Softmax (or the straight-through estimator) instead of the trick',
      'Always include the KL term in your VAE loss — without it the encoder collapses to a delta',
      'When debugging, set σ to a small constant and check that the model still trains; isolates encoder vs decoder bugs',
    ],
    'vmap-func': [
      'Use torch.func.functional_call to expose any nn.Module as a pure function of its parameters',
      'in_dims tells vmap which axis to vectorize over per argument — None means "share", an int means "map"',
      'Compose freely: vmap(grad(...)), grad(vmap(...)), jacrev(...) — but read the docs on randomness',
      'For per-sample gradients, the vmap(grad(...)) one-liner replaces hundreds of lines of manual hook code',
      'Avoid in-place ops and stateful modules inside the function you transform — they break the abstraction',
    ],
    'weight-init': [
      'Use kaiming_normal_ (mode="fan_in", nonlinearity="relu") as the default for ReLU-family conv/linear layers',
      'Use xavier_uniform_ for tanh / sigmoid layers (rare in modern nets but still appears)',
      'Initialize biases to zero, BatchNorm/LayerNorm γ to one and β to zero',
      'For very deep residual nets, zero-init the last conv/linear in each block so the network starts as the identity',
      'Always sanity-check: forward a random batch and confirm activation std stays roughly constant across depth',
    ],
    'quantization': [
      'Start with dynamic quantization on Linear/LSTM-heavy models — it\'s a one-liner with surprising payoff',
      'For convnets, post-training static quantization with per-channel weights is the right default',
      'When PTQ drops accuracy too far, switch to QAT and fine-tune for a few epochs to recover',
      'Pick the right backend: fbgemm (x86), qnnpack (mobile/ARM), TensorRT/ONNX Runtime (deployment)',
      'Always benchmark accuracy AND latency on the actual deployment device, never on the dev box',
    ],
    'pruning': [
      'Iterative pruning + fine-tuning beats one-shot pruning — prune a little, recover, repeat',
      'For real speedups on dense GPUs use structured pruning (channels/heads); unstructured needs sparse kernels',
      'Call prune.remove(module, name) once you\'re done so the mask is baked into the weight permanently',
      'Combine pruning with quantization for compounded compression — they stack cleanly',
      'Track per-layer sparsity, not just global — uneven sparsity often hides underperforming layers',
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

print("nn.Module examples complete!")`,

    'pytorch-intro': `# Your first end-to-end PyTorch script
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import TensorDataset, DataLoader

# 1. Check installation and pick a device
print("PyTorch version:", torch.__version__)
print("CUDA available:", torch.cuda.is_available())
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 2. Fabricate a tiny dataset: y = 3x + noise
X = torch.linspace(-5, 5, 200).unsqueeze(1)
y = 3 * X + 0.5 * torch.randn_like(X)
loader = DataLoader(TensorDataset(X, y), batch_size=32, shuffle=True)

# 3. Define the simplest possible model
class Line(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(1, 1)
    def forward(self, x):
        return self.fc(x)

model = Line().to(device)
opt = torch.optim.SGD(model.parameters(), lr=1e-2)

# 4. Train
for epoch in range(50):
    for xb, yb in loader:
        xb, yb = xb.to(device), yb.to(device)
        opt.zero_grad()
        loss = F.mse_loss(model(xb), yb)
        loss.backward()
        opt.step()

# 5. Inspect what was learned
w = model.fc.weight.item()
b = model.fc.bias.item()
print(f"Learned y = {w:.2f}x + {b:.2f}   (true: 3.00x + 0.00)")`,

    'tensor-broadcasting': `import torch

# ============ Broadcasting fundamentals ============
a = torch.ones(3, 1, 4)       # (3, 1, 4)
b = torch.arange(5).view(1, 5, 1).float()  # (1, 5, 1)
c = a + b                     # broadcasts to (3, 5, 4)
print("broadcast:", c.shape)

# ============ Adding bias to a batch ============
batch = torch.randn(32, 128)  # (B, D)
bias  = torch.randn(128)      # (D,)
out = batch + bias            # bias is broadcast along batch

# ============ Advanced indexing ============
x = torch.arange(24).view(2, 3, 4)
print(x[0, 1, 2])                # scalar
print(x[:, 0])                   # first row of every sheet
print(x[x > 10])                 # boolean mask -> 1-D tensor

# ============ Gather: pick labeled logits ============
logits = torch.randn(4, 10)      # (batch=4, classes=10)
labels = torch.tensor([3, 7, 1, 9])
chosen = logits.gather(1, labels.unsqueeze(1)).squeeze(1)
print("chosen logits:", chosen)

# ============ Scatter: build one-hot ============
one_hot = torch.zeros(4, 10).scatter_(1, labels.unsqueeze(1), 1.0)
print("one-hot:\\n", one_hot)

# ============ View vs reshape vs contiguous ============
t = torch.arange(12).view(3, 4)
tt = t.transpose(0, 1)           # non-contiguous
# tt.view(-1)                    # RuntimeError
flat = tt.contiguous().view(-1)  # OK
print("flat:", flat)

# ============ Memory-free expand ============
row = torch.tensor([1, 2, 3])
expanded = row.unsqueeze(0).expand(4, 3)  # no copy
print(expanded.shape, expanded.stride())`,

    'autograd-basics': `import torch

# ======================================================
# 1. Basic scalar gradient
# ======================================================
x = torch.tensor(2.0, requires_grad=True)
y = torch.tensor(3.0, requires_grad=True)
z = x**2 + y**3
z.backward()
print(f"dz/dx = {x.grad.item()}  (expected 4.0)")
print(f"dz/dy = {y.grad.item()}  (expected 27.0)")

# ======================================================
# 2. Gradient accumulation and zeroing
# ======================================================
x.grad.zero_()
for _ in range(3):
    (x**2).backward()          # grads accumulate!
print("accumulated dx:", x.grad.item())  # 3 * (2x) = 12.0

# ======================================================
# 3. Jacobian via backward with grad_outputs
# ======================================================
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
y = x * x
y.backward(torch.ones_like(y))  # Jacobian-vector product with 1s
print("grad:", x.grad)          # 2x = [2, 4, 6]

# ======================================================
# 4. Detach to stop gradient flow
# ======================================================
a = torch.tensor(2.0, requires_grad=True)
b = a * 3
c = b.detach()                  # no gradient flows past here
d = c * 4
d.backward()
print("a.grad after detach:", a.grad)  # None

# ======================================================
# 5. torch.no_grad for inference
# ======================================================
w = torch.randn(10, 10, requires_grad=True)
x = torch.randn(10)
with torch.no_grad():
    y = w @ x                   # forward only, no graph built
print("no_grad output requires_grad:", y.requires_grad)

# ======================================================
# 6. Higher-order gradients
# ======================================================
x = torch.tensor(2.0, requires_grad=True)
y = x**3
dy_dx  = torch.autograd.grad(y, x, create_graph=True)[0]   # 3x^2
d2y_dx2 = torch.autograd.grad(dy_dx, x)[0]                 # 6x
print(f"d2y/dx2 at x=2: {d2y_dx2.item()}  (expected 12.0)")`,

    'cnn-architectures': `import torch
import torch.nn as nn
import torch.nn.functional as F

# ============ Classic conv block ============
class ConvBlock(nn.Module):
    def __init__(self, in_c, out_c):
        super().__init__()
        self.conv = nn.Conv2d(in_c, out_c, 3, padding=1, bias=False)
        self.bn   = nn.BatchNorm2d(out_c)
    def forward(self, x):
        return F.relu(self.bn(self.conv(x)), inplace=True)

# ============ Residual block (ResNet-style) ============
class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.block = nn.Sequential(
            ConvBlock(channels, channels),
            nn.Conv2d(channels, channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(channels),
        )
    def forward(self, x):
        return F.relu(x + self.block(x), inplace=True)

# ============ Full small-ResNet for CIFAR ============
class MiniResNet(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.stem = ConvBlock(3, 64)
        self.stage1 = nn.Sequential(ResidualBlock(64), ResidualBlock(64))
        self.down1  = nn.Sequential(ConvBlock(64, 128), nn.MaxPool2d(2))
        self.stage2 = nn.Sequential(ResidualBlock(128), ResidualBlock(128))
        self.down2  = nn.Sequential(ConvBlock(128, 256), nn.MaxPool2d(2))
        self.stage3 = nn.Sequential(ResidualBlock(256), ResidualBlock(256))
        self.head = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(256, num_classes),
        )
    def forward(self, x):
        x = self.stem(x)
        x = self.stage1(x)
        x = self.stage2(self.down1(x))
        x = self.stage3(self.down2(x))
        return self.head(x)

model = MiniResNet()
out = model(torch.randn(4, 3, 32, 32))
print("output:", out.shape)
print("params:", sum(p.numel() for p in model.parameters()))`,

    'rnn-lstm': `import torch
import torch.nn as nn
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

class BiLSTMTagger(nn.Module):
    """BiLSTM + linear head for sequence tagging (e.g. POS / NER)."""
    def __init__(self, vocab_size, n_tags, embed_dim=128, hidden_dim=256):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(
            embed_dim, hidden_dim, num_layers=2,
            batch_first=True, bidirectional=True, dropout=0.3,
        )
        self.out = nn.Linear(hidden_dim * 2, n_tags)

    def forward(self, tokens, lengths):
        emb = self.embed(tokens)
        packed = pack_padded_sequence(
            emb, lengths.cpu(), batch_first=True, enforce_sorted=False,
        )
        out, _ = self.lstm(packed)
        out, _ = pad_packed_sequence(out, batch_first=True)
        return self.out(out)  # (B, T, n_tags)

# ---- Training loop sketch ----
def train_step(model, tokens, lengths, labels, opt, criterion):
    opt.zero_grad()
    logits = model(tokens, lengths)
    loss = criterion(
        logits.view(-1, logits.size(-1)),
        labels.view(-1),
    )
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    opt.step()
    return loss.item()

# ---- Tiny smoke-test ----
model = BiLSTMTagger(vocab_size=5000, n_tags=9)
tokens = torch.randint(1, 5000, (8, 30))
lengths = torch.randint(10, 31, (8,))
labels = torch.randint(0, 9, (8, 30))
opt = torch.optim.Adam(model.parameters(), lr=3e-4)
loss_fn = nn.CrossEntropyLoss(ignore_index=-100)
print("loss:", train_step(model, tokens, lengths, labels, opt, loss_fn))`,

    'transformers': `import math, torch
import torch.nn as nn

# ============ Sinusoidal positional encoding ============
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        pos = torch.arange(max_len).unsqueeze(1).float()
        div = torch.exp(torch.arange(0, d_model, 2).float()
                        * (-math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(pos * div)
        pe[:, 1::2] = torch.cos(pos * div)
        self.register_buffer("pe", pe.unsqueeze(0))
    def forward(self, x):
        return x + self.pe[:, :x.size(1)]

# ============ Mini encoder-only classifier ============
class TransformerClassifier(nn.Module):
    def __init__(self, vocab_size, num_classes,
                 d_model=256, nhead=8, num_layers=4):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, d_model, padding_idx=0)
        self.pos = PositionalEncoding(d_model)
        layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=nhead,
            dim_feedforward=4 * d_model,
            dropout=0.1, batch_first=True, norm_first=True,
        )
        self.encoder = nn.TransformerEncoder(layer, num_layers=num_layers)
        self.cls = nn.Linear(d_model, num_classes)

    def forward(self, tokens):
        pad_mask = tokens == 0
        x = self.pos(self.embed(tokens))
        h = self.encoder(x, src_key_padding_mask=pad_mask)
        # Mean-pool over non-pad positions
        mask = (~pad_mask).unsqueeze(-1).float()
        pooled = (h * mask).sum(1) / mask.sum(1).clamp_min(1)
        return self.cls(pooled)

# Smoke-test
model = TransformerClassifier(vocab_size=10000, num_classes=4)
logits = model(torch.randint(0, 10000, (8, 64)))
print("logits:", logits.shape)`,

    'loss-functions': `import torch
import torch.nn as nn
import torch.nn.functional as F

# ======= 1. Regression =======
pred = torch.randn(32, 1, requires_grad=True)
target = torch.randn(32, 1)
print("MSE :", F.mse_loss(pred, target).item())
print("L1  :", F.l1_loss(pred, target).item())
print("Huber:", F.smooth_l1_loss(pred, target).item())

# ======= 2. Multi-class classification =======
logits  = torch.randn(32, 10, requires_grad=True)
labels  = torch.randint(0, 10, (32,))
ce = nn.CrossEntropyLoss()(logits, labels)
print("CE  :", ce.item())

# Class-weighted CE for imbalance
weights = torch.tensor([1.0, 1.0, 1.0, 1.0, 1.0,
                        2.0, 2.0, 5.0, 5.0, 10.0])
ce_w = nn.CrossEntropyLoss(weight=weights)(logits, labels)
print("CE-w:", ce_w.item())

# ======= 3. Binary / multi-label =======
ml_logits  = torch.randn(32, 5)
ml_targets = torch.randint(0, 2, (32, 5)).float()
bce = nn.BCEWithLogitsLoss()(ml_logits, ml_targets)
print("BCE :", bce.item())

# ======= 4. Focal loss (hand-rolled) =======
def focal_loss(logits, targets, alpha=0.25, gamma=2.0):
    ce = F.binary_cross_entropy_with_logits(logits, targets, reduction="none")
    p = torch.sigmoid(logits)
    p_t = p * targets + (1 - p) * (1 - targets)
    return (alpha * (1 - p_t).pow(gamma) * ce).mean()

print("Focal:", focal_loss(ml_logits, ml_targets).item())

# ======= 5. Custom Dice loss for segmentation =======
class DiceLoss(nn.Module):
    def forward(self, logits, targets, eps=1e-6):
        probs = torch.sigmoid(logits)
        inter = (probs * targets).sum(dim=(2, 3))
        union = probs.sum(dim=(2, 3)) + targets.sum(dim=(2, 3))
        return 1 - ((2 * inter + eps) / (union + eps)).mean()

seg_logits  = torch.randn(4, 1, 64, 64)
seg_targets = torch.randint(0, 2, (4, 1, 64, 64)).float()
print("Dice:", DiceLoss()(seg_logits, seg_targets).item())`,

    'optimizers': `import torch, torch.nn as nn
from torch.optim import AdamW, SGD
from torch.optim.lr_scheduler import (
    CosineAnnealingLR, OneCycleLR, LambdaLR,
)

model = nn.Sequential(
    nn.Linear(128, 256), nn.GELU(),
    nn.Linear(256, 256), nn.GELU(),
    nn.Linear(256, 10),
)

# ---- Param groups: no decay for biases/norms ----
decay, no_decay = [], []
for name, p in model.named_parameters():
    if not p.requires_grad: continue
    if p.ndim == 1 or name.endswith(".bias"):
        no_decay.append(p)
    else:
        decay.append(p)

optimizer = AdamW(
    [{"params": decay,    "weight_decay": 1e-2},
     {"params": no_decay, "weight_decay": 0.0}],
    lr=3e-4, betas=(0.9, 0.999),
)

# ---- Warmup + cosine schedule ----
total_steps = 1000
warmup = 100
def lr_lambda(step):
    if step < warmup:
        return step / max(1, warmup)
    progress = (step - warmup) / max(1, total_steps - warmup)
    return 0.5 * (1 + torch.cos(torch.tensor(progress * 3.141592)).item())

scheduler = LambdaLR(optimizer, lr_lambda)

# ---- Training step with gradient clipping ----
def step(x, y):
    optimizer.zero_grad()
    loss = nn.functional.cross_entropy(model(x), y)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    optimizer.step()
    scheduler.step()
    return loss.item()

# Smoke-test
x = torch.randn(32, 128)
y = torch.randint(0, 10, (32,))
for s in range(5):
    print(f"step {s}  loss={step(x, y):.4f}  lr={scheduler.get_last_lr()[0]:.2e}")`,

    'training-loop': `import torch
import torch.nn as nn
from torch.cuda.amp import autocast, GradScaler
from torch.utils.data import DataLoader

def train_one_epoch(model, loader, loss_fn, optimizer, scaler, device):
    model.train()
    total, seen = 0.0, 0
    for x, y in loader:
        x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
        optimizer.zero_grad(set_to_none=True)
        with autocast():
            loss = loss_fn(model(x), y)
        scaler.scale(loss).backward()
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        scaler.step(optimizer)
        scaler.update()
        total += loss.item() * x.size(0); seen += x.size(0)
    return total / seen

@torch.no_grad()
def evaluate(model, loader, loss_fn, device):
    model.eval()
    total, correct, seen = 0.0, 0, 0
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        logits = model(x)
        total += loss_fn(logits, y).item() * x.size(0)
        correct += (logits.argmax(1) == y).sum().item()
        seen += x.size(0)
    return total / seen, correct / seen

def fit(model, train_loader, val_loader, epochs=20,
        lr=3e-4, device="cuda", ckpt_path="best.pth"):
    model.to(device)
    opt = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-2)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)
    scaler = GradScaler()
    loss_fn = nn.CrossEntropyLoss()

    best_acc = 0.0
    for epoch in range(1, epochs + 1):
        train_loss = train_one_epoch(model, train_loader, loss_fn, opt, scaler, device)
        val_loss, val_acc = evaluate(model, val_loader, loss_fn, device)
        sched.step()
        print(f"epoch {epoch:02d}  train {train_loss:.4f}  "
              f"val {val_loss:.4f}  acc {val_acc:.4f}")

        if val_acc > best_acc:
            best_acc = val_acc
            torch.save({
                "epoch": epoch,
                "model": model.state_dict(),
                "optimizer": opt.state_dict(),
                "scheduler": sched.state_dict(),
                "scaler": scaler.state_dict(),
                "best_acc": best_acc,
            }, ckpt_path)
    return best_acc`,

    'custom-autograd': `import torch
from torch.autograd import Function

# =====================================================
# Example 1: custom ReLU with hand-written backward
# =====================================================
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

# Verify numerically
x = torch.randn(4, dtype=torch.double, requires_grad=True)
torch.autograd.gradcheck(MyReLU.apply, (x,))
print("MyReLU gradcheck ✅")

# =====================================================
# Example 2: Straight-Through Estimator (STE)
# Forward: binarize.   Backward: identity.
# Used in quantization-aware training.
# =====================================================
class BinarizeSTE(Function):
    @staticmethod
    def forward(ctx, x):
        return (x > 0).float() * 2 - 1      # {-1, +1}

    @staticmethod
    def backward(ctx, grad_out):
        return grad_out                      # pass gradient through

x = torch.randn(5, requires_grad=True)
y = BinarizeSTE.apply(x).sum()
y.backward()
print("STE grad:", x.grad)                   # all ones

# =====================================================
# Example 3: Gradient Reversal Layer (domain adaptation)
# =====================================================
class GradientReversal(Function):
    @staticmethod
    def forward(ctx, x, lambd):
        ctx.lambd = lambd
        return x.view_as(x)

    @staticmethod
    def backward(ctx, grad_out):
        return -ctx.lambd * grad_out, None   # flip the sign

def grad_reverse(x, lambd=1.0):
    return GradientReversal.apply(x, lambd)

features = torch.randn(8, 16, requires_grad=True)
reversed_feats = grad_reverse(features, 0.5)
loss = reversed_feats.sum()
loss.backward()
print("reversed grad sign ok:", (features.grad.sum() < 0).item())`,

    'distributed-training': `# train_ddp.py
# Launch with:  torchrun --nproc_per_node=NUM_GPUS train_ddp.py
import os
import torch
import torch.nn as nn
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, DistributedSampler, TensorDataset

def setup():
    dist.init_process_group(backend="nccl")
    local_rank = int(os.environ["LOCAL_RANK"])
    torch.cuda.set_device(local_rank)
    return local_rank

def cleanup():
    dist.destroy_process_group()

def is_main():
    return (not dist.is_initialized()) or dist.get_rank() == 0

def main():
    local_rank = setup()
    device = torch.device("cuda", local_rank)

    # Fake dataset
    X = torch.randn(10_000, 128)
    y = torch.randint(0, 10, (10_000,))
    ds = TensorDataset(X, y)
    sampler = DistributedSampler(ds, shuffle=True, drop_last=True)
    loader = DataLoader(ds, batch_size=64, sampler=sampler,
                        num_workers=2, pin_memory=True)

    model = nn.Sequential(
        nn.Linear(128, 256), nn.GELU(),
        nn.Linear(256, 10),
    ).to(device)
    model = DDP(model, device_ids=[local_rank])

    opt = torch.optim.AdamW(model.parameters(), lr=3e-4)
    loss_fn = nn.CrossEntropyLoss()

    for epoch in range(5):
        sampler.set_epoch(epoch)
        for step, (xb, yb) in enumerate(loader):
            xb, yb = xb.to(device), yb.to(device)
            opt.zero_grad()
            loss = loss_fn(model(xb), yb)
            loss.backward()
            opt.step()

            if is_main() and step % 50 == 0:
                print(f"epoch {epoch}  step {step}  loss {loss.item():.4f}")

        # Save only from rank 0
        if is_main():
            torch.save(model.module.state_dict(), f"ckpt_epoch{epoch}.pth")

    cleanup()

if __name__ == "__main__":
    main()`,

    'model-optimization': `import torch
import torch.nn as nn
import torch.ao.quantization as tq

# ==============================================
# Base model
# ==============================================
class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(784, 256), nn.ReLU(),
            nn.Linear(256, 128), nn.ReLU(),
            nn.Linear(128, 10),
        )
    def forward(self, x): return self.net(x)

model = MLP().eval()
example = torch.randn(1, 784)

# ==============================================
# 1. Dynamic quantization (easy, CPU)
# ==============================================
quant_dyn = tq.quantize_dynamic(model, {nn.Linear}, dtype=torch.qint8)
print("dynamic quantized output:", quant_dyn(example).shape)

# ==============================================
# 2. Structured magnitude pruning
# ==============================================
import torch.nn.utils.prune as prune
pruned = MLP()
for m in pruned.modules():
    if isinstance(m, nn.Linear):
        prune.l1_unstructured(m, name="weight", amount=0.3)
        prune.remove(m, "weight")           # make sparsity permanent

# ==============================================
# 3. TorchScript export (tracing)
# ==============================================
scripted = torch.jit.trace(model, example)
scripted.save("model_ts.pt")
loaded = torch.jit.load("model_ts.pt")
assert torch.allclose(loaded(example), model(example))

# ==============================================
# 4. ONNX export with dynamic batch
# ==============================================
torch.onnx.export(
    model, example, "model.onnx",
    input_names=["input"], output_names=["logits"],
    dynamic_axes={"input": {0: "batch"}, "logits": {0: "batch"}},
    opset_version=17, do_constant_folding=True,
)

# ==============================================
# 5. torch.compile (PyTorch 2.x) — free speedup
# ==============================================
if hasattr(torch, "compile"):
    fast_model = torch.compile(model)
    print("compiled output:", fast_model(example).shape)`,

    'cv-fundamentals': `import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import resnet18, ResNet18_Weights

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ============ Data pipeline ============
train_tf = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(0.2, 0.2, 0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])
val_tf = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

# Replace with your own ImageFolder directories
# train_ds = datasets.ImageFolder("data/train", train_tf)
# val_ds   = datasets.ImageFolder("data/val",   val_tf)

# ============ Model: fine-tune ResNet-18 ============
def build_model(num_classes: int):
    weights = ResNet18_Weights.DEFAULT
    model = resnet18(weights=weights)
    # Freeze the backbone for the first few epochs
    for p in model.parameters():
        p.requires_grad = False
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model

# ============ Training loop sketch ============
def train(num_classes=10, epochs=5, lr=1e-3):
    model = build_model(num_classes).to(device)
    opt = torch.optim.AdamW(
        [p for p in model.parameters() if p.requires_grad], lr=lr,
    )
    loss_fn = nn.CrossEntropyLoss()
    # plug in your DataLoaders here
    # for epoch in range(epochs): ...
    return model

if __name__ == "__main__":
    model = build_model(num_classes=10)
    print(model(torch.randn(2, 3, 224, 224)).shape)`,

    'object-detection': `import torch
from torchvision.models.detection import (
    fasterrcnn_resnet50_fpn_v2, FasterRCNN_ResNet50_FPN_V2_Weights,
)
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from torchvision.ops import nms

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ============ 1. Load pretrained Faster R-CNN ============
def build_model(num_classes):
    weights = FasterRCNN_ResNet50_FPN_V2_Weights.DEFAULT
    model = fasterrcnn_resnet50_fpn_v2(weights=weights)
    in_feat = model.roi_heads.box_predictor.cls_score.in_features
    # +1 for the background class
    model.roi_heads.box_predictor = FastRCNNPredictor(in_feat, num_classes + 1)
    return model

model = build_model(num_classes=3).to(device).eval()

# ============ 2. Inference with NMS & confidence filter ============
@torch.no_grad()
def predict(images, score_thresh=0.5, nms_iou=0.5):
    outputs = model([img.to(device) for img in images])
    results = []
    for o in outputs:
        keep = o["scores"] > score_thresh
        boxes, scores, labels = o["boxes"][keep], o["scores"][keep], o["labels"][keep]
        # Per-class NMS
        final = []
        for c in labels.unique():
            idx = (labels == c).nonzero(as_tuple=True)[0]
            k = nms(boxes[idx], scores[idx], nms_iou)
            final.append(idx[k])
        final = torch.cat(final) if final else torch.empty(0, dtype=torch.long)
        results.append({
            "boxes":  boxes[final],
            "scores": scores[final],
            "labels": labels[final],
        })
    return results

# ============ 3. Training step sketch ============
def training_step(images, targets, optimizer):
    """images: list[Tensor[3, H, W]], targets: list[dict(boxes, labels)]"""
    model.train()
    loss_dict = model(images, targets)
    loss = sum(loss_dict.values())
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    return {k: v.item() for k, v in loss_dict.items()}

if __name__ == "__main__":
    img = torch.rand(3, 480, 640)
    print(predict([img]))`,

    'image-segmentation': `import torch
import torch.nn as nn
import torch.nn.functional as F

def double_conv(in_c, out_c):
    return nn.Sequential(
        nn.Conv2d(in_c, out_c, 3, padding=1, bias=False),
        nn.BatchNorm2d(out_c), nn.ReLU(inplace=True),
        nn.Conv2d(out_c, out_c, 3, padding=1, bias=False),
        nn.BatchNorm2d(out_c), nn.ReLU(inplace=True),
    )

class UNet(nn.Module):
    def __init__(self, in_channels=3, num_classes=2, base=32):
        super().__init__()
        self.d1 = double_conv(in_channels, base)
        self.d2 = double_conv(base,     base * 2)
        self.d3 = double_conv(base * 2, base * 4)
        self.bott = double_conv(base * 4, base * 8)
        self.up3 = nn.ConvTranspose2d(base * 8, base * 4, 2, stride=2)
        self.u3  = double_conv(base * 8, base * 4)
        self.up2 = nn.ConvTranspose2d(base * 4, base * 2, 2, stride=2)
        self.u2  = double_conv(base * 4, base * 2)
        self.up1 = nn.ConvTranspose2d(base * 2, base,     2, stride=2)
        self.u1  = double_conv(base * 2, base)
        self.head = nn.Conv2d(base, num_classes, 1)

    def forward(self, x):
        s1 = self.d1(x)
        s2 = self.d2(F.max_pool2d(s1, 2))
        s3 = self.d3(F.max_pool2d(s2, 2))
        b  = self.bott(F.max_pool2d(s3, 2))
        x  = self.u3(torch.cat([self.up3(b), s3], dim=1))
        x  = self.u2(torch.cat([self.up2(x), s2], dim=1))
        x  = self.u1(torch.cat([self.up1(x), s1], dim=1))
        return self.head(x)

# ============ Combined Dice + CE loss ============
class DiceCELoss(nn.Module):
    def __init__(self, dice_weight=0.5):
        super().__init__()
        self.dw = dice_weight
        self.ce = nn.CrossEntropyLoss()
    def forward(self, logits, targets):
        ce = self.ce(logits, targets)
        probs = logits.softmax(1)
        one_hot = F.one_hot(targets, logits.size(1)).permute(0, 3, 1, 2).float()
        inter = (probs * one_hot).sum(dim=(2, 3))
        union = probs.sum(dim=(2, 3)) + one_hot.sum(dim=(2, 3))
        dice = 1 - ((2 * inter + 1e-6) / (union + 1e-6)).mean()
        return (1 - self.dw) * ce + self.dw * dice

# Smoke-test
model = UNet(num_classes=3)
logits = model(torch.randn(2, 3, 128, 128))
targets = torch.randint(0, 3, (2, 128, 128))
print("logits:", logits.shape, "loss:", DiceCELoss()(logits, targets).item())`,

    'pose-estimation': `import torch
import torch.nn.functional as F
from torchvision.models.detection import (
    keypointrcnn_resnet50_fpn, KeypointRCNN_ResNet50_FPN_Weights,
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ============ 1. Use Torchvision's Keypoint R-CNN ============
weights = KeypointRCNN_ResNet50_FPN_Weights.DEFAULT
model = keypointrcnn_resnet50_fpn(weights=weights).to(device).eval()

COCO_SKELETON = [
    (5, 7), (7, 9), (6, 8), (8, 10),   # arms
    (11, 13), (13, 15), (12, 14), (14, 16),  # legs
    (5, 6), (11, 12), (5, 11), (6, 12),  # torso
]

@torch.no_grad()
def predict(image, score_thresh=0.8):
    out = model([image.to(device)])[0]
    keep = out["scores"] > score_thresh
    return {
        "keypoints": out["keypoints"][keep],  # (N, 17, 3)
        "scores":    out["scores"][keep],
        "boxes":     out["boxes"][keep],
    }

# ============ 2. Heatmap-based pose head (manual training) ============
def coords_to_heatmap(coords, H, W, sigma=2.0):
    """coords: (N, K, 2) in pixel space -> (N, K, H, W) Gaussian heatmaps"""
    N, K, _ = coords.shape
    ys = torch.arange(H).view(1, 1, H, 1).float()
    xs = torch.arange(W).view(1, 1, 1, W).float()
    cy = coords[..., 1].view(N, K, 1, 1).float()
    cx = coords[..., 0].view(N, K, 1, 1).float()
    return torch.exp(-((xs - cx) ** 2 + (ys - cy) ** 2) / (2 * sigma ** 2))

def soft_argmax_2d(heatmaps):
    """Differentiable keypoint extraction."""
    N, K, H, W = heatmaps.shape
    probs = heatmaps.view(N, K, -1).softmax(-1).view(N, K, H, W)
    ys = torch.arange(H, device=heatmaps.device).view(1, 1, H, 1).float()
    xs = torch.arange(W, device=heatmaps.device).view(1, 1, 1, W).float()
    x = (probs * xs).sum(dim=(2, 3))
    y = (probs * ys).sum(dim=(2, 3))
    return torch.stack([x, y], dim=-1)

# Smoke-test
img = torch.rand(3, 480, 640)
print(predict(img)["keypoints"].shape)`,

    'gan-basics': `import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
Z_DIM, IMG_DIM = 100, 28 * 28

class Generator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(Z_DIM, 256), nn.LeakyReLU(0.2),
            nn.Linear(256, 512),   nn.LeakyReLU(0.2),
            nn.Linear(512, IMG_DIM), nn.Tanh(),
        )
    def forward(self, z): return self.net(z)

class Discriminator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(IMG_DIM, 512), nn.LeakyReLU(0.2), nn.Dropout(0.3),
            nn.Linear(512, 256),     nn.LeakyReLU(0.2), nn.Dropout(0.3),
            nn.Linear(256, 1),
        )
    def forward(self, x): return self.net(x)

def train_gan(dataset, epochs=20, batch_size=128, lr=2e-4):
    G = Generator().to(device)
    D = Discriminator().to(device)
    opt_G = torch.optim.Adam(G.parameters(), lr=lr, betas=(0.5, 0.999))
    opt_D = torch.optim.Adam(D.parameters(), lr=lr, betas=(0.5, 0.999))
    bce = nn.BCEWithLogitsLoss()
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    for epoch in range(epochs):
        for real, in loader:
            real = real.view(real.size(0), -1).to(device)
            B = real.size(0)

            # --- Train Discriminator ---
            z = torch.randn(B, Z_DIM, device=device)
            fake = G(z).detach()
            loss_D = bce(D(real), torch.ones (B, 1, device=device)) + \\
                     bce(D(fake), torch.zeros(B, 1, device=device))
            opt_D.zero_grad(); loss_D.backward(); opt_D.step()

            # --- Train Generator ---
            z = torch.randn(B, Z_DIM, device=device)
            fake = G(z)
            loss_G = bce(D(fake), torch.ones(B, 1, device=device))
            opt_G.zero_grad(); loss_G.backward(); opt_G.step()

        print(f"epoch {epoch}  D={loss_D.item():.3f}  G={loss_G.item():.3f}")
    return G, D

if __name__ == "__main__":
    fake_data = TensorDataset(torch.randn(1024, IMG_DIM))
    train_gan(fake_data, epochs=2)`,

    'dcgan': `import torch
import torch.nn as nn

# --- Weight init from the DCGAN paper ---
def weights_init(m):
    classname = m.__class__.__name__
    if "Conv" in classname:
        nn.init.normal_(m.weight, 0.0, 0.02)
    elif "BatchNorm" in classname:
        nn.init.normal_(m.weight, 1.0, 0.02)
        nn.init.zeros_(m.bias)

class DCGenerator(nn.Module):
    """z -> 64x64 RGB image"""
    def __init__(self, z_dim=100, ngf=64, nc=3):
        super().__init__()
        self.main = nn.Sequential(
            nn.ConvTranspose2d(z_dim, ngf*8, 4, 1, 0, bias=False),
            nn.BatchNorm2d(ngf*8), nn.ReLU(True),
            nn.ConvTranspose2d(ngf*8, ngf*4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf*4), nn.ReLU(True),
            nn.ConvTranspose2d(ngf*4, ngf*2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf*2), nn.ReLU(True),
            nn.ConvTranspose2d(ngf*2, ngf,   4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf),   nn.ReLU(True),
            nn.ConvTranspose2d(ngf, nc, 4, 2, 1, bias=False),
            nn.Tanh(),
        )
    def forward(self, z):
        return self.main(z)

class DCDiscriminator(nn.Module):
    def __init__(self, ndf=64, nc=3):
        super().__init__()
        self.main = nn.Sequential(
            nn.Conv2d(nc, ndf, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, True),
            nn.Conv2d(ndf, ndf*2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf*2), nn.LeakyReLU(0.2, True),
            nn.Conv2d(ndf*2, ndf*4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf*4), nn.LeakyReLU(0.2, True),
            nn.Conv2d(ndf*4, ndf*8, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf*8), nn.LeakyReLU(0.2, True),
            nn.Conv2d(ndf*8, 1, 4, 1, 0, bias=False),
        )
    def forward(self, x):
        return self.main(x).view(-1)

G = DCGenerator().apply(weights_init)
D = DCDiscriminator().apply(weights_init)

# DCGAN-recommended optimizer settings
opt_G = torch.optim.Adam(G.parameters(), lr=2e-4, betas=(0.5, 0.999))
opt_D = torch.optim.Adam(D.parameters(), lr=2e-4, betas=(0.5, 0.999))
bce = nn.BCEWithLogitsLoss()

# One training step
z = torch.randn(16, 100, 1, 1)
fake = G(z)
print("fake shape:", fake.shape, "D(fake) shape:", D(fake).shape)`,

    'stylegan': `# Minimal StyleGAN-style building blocks (educational, not SOTA quality).
# For production use the official NVIDIA repo or 'stylegan2-pytorch'.
import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class PixelNorm(nn.Module):
    def forward(self, x):
        return x / (x.pow(2).mean(dim=1, keepdim=True) + 1e-8).sqrt()

class MappingNetwork(nn.Module):
    """z (latent) -> w (style)  [8-layer MLP]"""
    def __init__(self, z_dim=512, w_dim=512, n_layers=8):
        super().__init__()
        layers = [PixelNorm()]
        for _ in range(n_layers):
            layers += [nn.Linear(z_dim, w_dim), nn.LeakyReLU(0.2)]
            z_dim = w_dim
        self.net = nn.Sequential(*layers)
    def forward(self, z):
        return self.net(z)

class AdaIN(nn.Module):
    """Adaptive Instance Normalization conditioned on w."""
    def __init__(self, channels, w_dim):
        super().__init__()
        self.style = nn.Linear(w_dim, channels * 2)
    def forward(self, x, w):
        style = self.style(w).unsqueeze(-1).unsqueeze(-1)
        ys, yb = style.chunk(2, dim=1)
        x = (x - x.mean(dim=(2, 3), keepdim=True)) / (
            x.std(dim=(2, 3), keepdim=True) + 1e-8
        )
        return ys * x + yb

class NoiseInjection(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.weight = nn.Parameter(torch.zeros(1, channels, 1, 1))
    def forward(self, x):
        noise = torch.randn(x.size(0), 1, x.size(2), x.size(3), device=x.device)
        return x + self.weight * noise

class StyleBlock(nn.Module):
    def __init__(self, in_c, out_c, w_dim):
        super().__init__()
        self.up = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=False)
        self.conv = nn.Conv2d(in_c, out_c, 3, padding=1)
        self.noise = NoiseInjection(out_c)
        self.adain = AdaIN(out_c, w_dim)
        self.act = nn.LeakyReLU(0.2)
    def forward(self, x, w):
        x = self.conv(self.up(x))
        x = self.noise(x)
        return self.adain(self.act(x), w)

class TinyStyleGAN(nn.Module):
    def __init__(self, z_dim=512, w_dim=512):
        super().__init__()
        self.mapping = MappingNetwork(z_dim, w_dim)
        self.const = nn.Parameter(torch.randn(1, 512, 4, 4))
        self.block1 = StyleBlock(512, 256, w_dim)   #  8x8
        self.block2 = StyleBlock(256, 128, w_dim)   # 16x16
        self.block3 = StyleBlock(128,  64, w_dim)   # 32x32
        self.to_rgb = nn.Conv2d(64, 3, 1)
    def forward(self, z):
        w = self.mapping(z)
        x = self.const.expand(z.size(0), -1, -1, -1)
        x = self.block1(x, w)
        x = self.block2(x, w)
        x = self.block3(x, w)
        return torch.tanh(self.to_rgb(x))

G = TinyStyleGAN()
z = torch.randn(4, 512)
img = G(z)
print("image:", img.shape)  # (4, 3, 32, 32)`,

    'wgan': `import torch
import torch.nn as nn

# ============ Simple MLP critic / generator ============
class Generator(nn.Module):
    def __init__(self, z_dim=100, img_dim=784):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(z_dim, 256), nn.ReLU(True),
            nn.Linear(256, 512),   nn.ReLU(True),
            nn.Linear(512, img_dim), nn.Tanh(),
        )
    def forward(self, z): return self.net(z)

class Critic(nn.Module):
    """IMPORTANT for WGAN-GP: use LayerNorm, NOT BatchNorm."""
    def __init__(self, img_dim=784):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(img_dim, 512), nn.LayerNorm(512), nn.LeakyReLU(0.2),
            nn.Linear(512, 256),     nn.LayerNorm(256), nn.LeakyReLU(0.2),
            nn.Linear(256, 1),   # no sigmoid!
        )
    def forward(self, x): return self.net(x)

# ============ Gradient penalty ============
def gradient_penalty(critic, real, fake):
    B = real.size(0)
    alpha = torch.rand(B, 1, device=real.device)
    interp = (alpha * real + (1 - alpha) * fake).requires_grad_(True)
    d_interp = critic(interp)
    grads = torch.autograd.grad(
        outputs=d_interp, inputs=interp,
        grad_outputs=torch.ones_like(d_interp),
        create_graph=True, retain_graph=True,
    )[0]
    return ((grads.norm(2, dim=1) - 1) ** 2).mean()

# ============ WGAN-GP training loop ============
def train(loader, z_dim=100, n_critic=5, lambda_gp=10, lr=1e-4, epochs=20):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    G = Generator(z_dim).to(device)
    C = Critic().to(device)
    opt_G = torch.optim.Adam(G.parameters(), lr=lr, betas=(0.0, 0.9))
    opt_C = torch.optim.Adam(C.parameters(), lr=lr, betas=(0.0, 0.9))

    for epoch in range(epochs):
        for real, in loader:
            real = real.view(real.size(0), -1).to(device)

            # Critic updates (n_critic per generator step)
            for _ in range(n_critic):
                z = torch.randn(real.size(0), z_dim, device=device)
                fake = G(z).detach()
                gp = gradient_penalty(C, real, fake)
                loss_C = C(fake).mean() - C(real).mean() + lambda_gp * gp
                opt_C.zero_grad(); loss_C.backward(); opt_C.step()

            # Generator update
            z = torch.randn(real.size(0), z_dim, device=device)
            loss_G = -C(G(z)).mean()
            opt_G.zero_grad(); loss_G.backward(); opt_G.step()

        print(f"epoch {epoch}  C={loss_C.item():.3f}  G={loss_G.item():.3f}")
    return G, C`,

    'diffusion-models': `import torch
import torch.nn as nn
import torch.nn.functional as F

# ============ 1. Noise schedule ============
class DiffusionSchedule:
    def __init__(self, T=1000, device="cpu"):
        self.T = T
        self.betas = torch.linspace(1e-4, 0.02, T, device=device)
        self.alphas = 1.0 - self.betas
        self.alpha_bars = torch.cumprod(self.alphas, dim=0)

    def q_sample(self, x0, t, noise):
        ab = self.alpha_bars[t].view(-1, 1, 1, 1)
        return ab.sqrt() * x0 + (1 - ab).sqrt() * noise

# ============ 2. Tiny denoising U-Net with time embedding ============
class TimeEmbedding(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.dim = dim
    def forward(self, t):
        half = self.dim // 2
        freqs = torch.exp(
            -torch.arange(half, device=t.device)
            * (torch.log(torch.tensor(10000.0)) / half)
        )
        args = t.float().unsqueeze(1) * freqs.unsqueeze(0)
        return torch.cat([args.sin(), args.cos()], dim=-1)

class TinyUNet(nn.Module):
    def __init__(self, ch=64, t_dim=128):
        super().__init__()
        self.t_emb = TimeEmbedding(t_dim)
        self.t_mlp = nn.Sequential(nn.Linear(t_dim, ch), nn.GELU(), nn.Linear(ch, ch))
        self.enc = nn.Sequential(nn.Conv2d(3, ch, 3, padding=1), nn.GELU(),
                                 nn.Conv2d(ch, ch, 3, padding=1), nn.GELU())
        self.mid = nn.Conv2d(ch, ch, 3, padding=1)
        self.dec = nn.Sequential(nn.Conv2d(ch, ch, 3, padding=1), nn.GELU(),
                                 nn.Conv2d(ch, 3, 3, padding=1))
    def forward(self, x, t):
        t = self.t_mlp(self.t_emb(t)).unsqueeze(-1).unsqueeze(-1)
        h = self.enc(x) + t
        h = self.mid(h) + t
        return self.dec(h)

# ============ 3. Training step (ε-prediction) ============
def training_step(model, sched, x0):
    t = torch.randint(0, sched.T, (x0.size(0),), device=x0.device)
    noise = torch.randn_like(x0)
    xt = sched.q_sample(x0, t, noise)
    pred = model(xt, t)
    return F.mse_loss(pred, noise)

# ============ 4. DDPM sampling ============
@torch.no_grad()
def sample(model, sched, shape, device="cpu"):
    x = torch.randn(shape, device=device)
    for t in reversed(range(sched.T)):
        tt = torch.full((shape[0],), t, device=device, dtype=torch.long)
        pred_noise = model(x, tt)
        alpha = sched.alphas[t]
        alpha_bar = sched.alpha_bars[t]
        coef = (1 - alpha) / (1 - alpha_bar).sqrt()
        mean = (x - coef * pred_noise) / alpha.sqrt()
        if t > 0:
            x = mean + sched.betas[t].sqrt() * torch.randn_like(x)
        else:
            x = mean
    return x.clamp(-1, 1)

# Smoke-test
sched = DiffusionSchedule(T=100)
model = TinyUNet()
x0 = torch.randn(2, 3, 32, 32)
print("loss:", training_step(model, sched, x0).item())`,

    'rl-basics': `import gymnasium as gym
import numpy as np
from collections import defaultdict

# ============ 1. Environment basics ============
env = gym.make("FrozenLake-v1", is_slippery=False)
print("obs space:", env.observation_space)
print("action space:", env.action_space)

# ============ 2. Tabular Q-learning ============
def q_learning(env, episodes=2000, alpha=0.1, gamma=0.99,
               eps_start=1.0, eps_end=0.05):
    Q = defaultdict(lambda: np.zeros(env.action_space.n))
    returns = []
    for ep in range(episodes):
        eps = eps_start + (eps_end - eps_start) * ep / episodes
        obs, _ = env.reset()
        total = 0.0
        done = False
        while not done:
            if np.random.rand() < eps:
                a = env.action_space.sample()
            else:
                a = int(np.argmax(Q[obs]))
            next_obs, r, term, trunc, _ = env.step(a)
            done = term or trunc
            # Bellman update
            Q[obs][a] += alpha * (r + gamma * np.max(Q[next_obs]) - Q[obs][a])
            obs = next_obs
            total += r
        returns.append(total)
    return Q, returns

# ============ 3. Evaluate the learned policy ============
def evaluate(env, Q, episodes=100):
    totals = []
    for _ in range(episodes):
        obs, _ = env.reset()
        total, done = 0.0, False
        while not done:
            a = int(np.argmax(Q[obs]))
            obs, r, term, trunc, _ = env.step(a)
            done = term or trunc
            total += r
        totals.append(total)
    return np.mean(totals)

if __name__ == "__main__":
    Q, returns = q_learning(env)
    print(f"Avg return (last 100 eps): {np.mean(returns[-100:]):.2f}")
    print(f"Eval avg return: {evaluate(env, Q):.2f}")
    env.close()`,

    'dqn': `import random
from collections import deque, namedtuple

import gymnasium as gym
import torch
import torch.nn as nn
import torch.nn.functional as F

Transition = namedtuple("Transition", "s a r s_next done")

class ReplayBuffer:
    def __init__(self, cap=100_000):
        self.buf = deque(maxlen=cap)
    def push(self, *args): self.buf.append(Transition(*args))
    def sample(self, batch):
        items = random.sample(self.buf, batch)
        b = Transition(*zip(*items))
        return (
            torch.tensor(b.s,       dtype=torch.float32),
            torch.tensor(b.a,       dtype=torch.long),
            torch.tensor(b.r,       dtype=torch.float32),
            torch.tensor(b.s_next,  dtype=torch.float32),
            torch.tensor(b.done,    dtype=torch.float32),
        )
    def __len__(self): return len(self.buf)

class QNet(nn.Module):
    def __init__(self, obs_dim, n_actions):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(obs_dim, 128), nn.ReLU(),
            nn.Linear(128, 128),     nn.ReLU(),
            nn.Linear(128, n_actions),
        )
    def forward(self, x): return self.net(x)

def train_dqn(env_name="CartPole-v1", episodes=400,
              gamma=0.99, lr=1e-3, batch=64,
              eps_start=1.0, eps_end=0.05, eps_decay=0.995,
              target_update=10):
    env = gym.make(env_name)
    obs_dim, n_actions = env.observation_space.shape[0], env.action_space.n

    q = QNet(obs_dim, n_actions)
    q_target = QNet(obs_dim, n_actions); q_target.load_state_dict(q.state_dict())
    opt = torch.optim.Adam(q.parameters(), lr=lr)
    buffer = ReplayBuffer()
    eps = eps_start

    for ep in range(episodes):
        obs, _ = env.reset()
        total, done = 0.0, False
        while not done:
            if random.random() < eps:
                a = env.action_space.sample()
            else:
                with torch.no_grad():
                    a = int(q(torch.tensor(obs, dtype=torch.float32)).argmax())
            next_obs, r, term, trunc, _ = env.step(a)
            done = term or trunc
            buffer.push(obs, a, r, next_obs, float(done))
            obs = next_obs; total += r

            if len(buffer) >= 1000:
                s, acts, rews, s_next, d = buffer.sample(batch)
                q_val = q(s).gather(1, acts.unsqueeze(1)).squeeze(1)
                with torch.no_grad():
                    # Double DQN: online picks action, target evaluates it
                    next_act = q(s_next).argmax(1, keepdim=True)
                    q_next = q_target(s_next).gather(1, next_act).squeeze(1)
                    target = rews + gamma * q_next * (1 - d)
                loss = F.smooth_l1_loss(q_val, target)
                opt.zero_grad(); loss.backward()
                torch.nn.utils.clip_grad_norm_(q.parameters(), 10.0)
                opt.step()

        eps = max(eps_end, eps * eps_decay)
        if ep % target_update == 0:
            q_target.load_state_dict(q.state_dict())
        if ep % 20 == 0:
            print(f"ep {ep:03d}  return {total:.1f}  eps {eps:.2f}")
    env.close()
    return q`,

    'policy-gradient': `import gymnasium as gym
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.distributions import Categorical

class ActorCritic(nn.Module):
    def __init__(self, obs_dim, n_actions):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(obs_dim, 128), nn.Tanh(),
            nn.Linear(128, 128),     nn.Tanh(),
        )
        self.actor  = nn.Linear(128, n_actions)
        self.critic = nn.Linear(128, 1)
    def forward(self, obs):
        h = self.shared(obs)
        return self.actor(h), self.critic(h).squeeze(-1)

def compute_returns(rewards, gamma=0.99):
    R, out = 0.0, []
    for r in reversed(rewards):
        R = r + gamma * R
        out.insert(0, R)
    return torch.tensor(out, dtype=torch.float32)

def train(env_name="CartPole-v1", episodes=500, lr=3e-4,
          entropy_coef=0.01, value_coef=0.5):
    env = gym.make(env_name)
    model = ActorCritic(env.observation_space.shape[0], env.action_space.n)
    opt = torch.optim.Adam(model.parameters(), lr=lr)

    for ep in range(episodes):
        obs, _ = env.reset()
        log_probs, values, rewards, entropies = [], [], [], []
        done, total = False, 0.0

        while not done:
            obs_t = torch.tensor(obs, dtype=torch.float32)
            logits, value = model(obs_t)
            dist = Categorical(logits=logits)
            a = dist.sample()
            obs, r, term, trunc, _ = env.step(a.item())
            done = term or trunc
            log_probs.append(dist.log_prob(a))
            values.append(value)
            rewards.append(r)
            entropies.append(dist.entropy())
            total += r

        returns = compute_returns(rewards)
        returns = (returns - returns.mean()) / (returns.std() + 1e-8)
        values = torch.stack(values)
        log_probs = torch.stack(log_probs)
        entropies = torch.stack(entropies)

        advantage = returns - values.detach()
        actor_loss  = -(log_probs * advantage).mean()
        critic_loss = F.mse_loss(values, returns)
        entropy_bonus = entropies.mean()

        loss = actor_loss + value_coef * critic_loss - entropy_coef * entropy_bonus
        opt.zero_grad(); loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 0.5)
        opt.step()

        if ep % 20 == 0:
            print(f"ep {ep:03d}  return {total:.1f}  loss {loss.item():.3f}")
    env.close()
    return model`,

    'ppo-trpo': `import gymnasium as gym
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.distributions import Categorical

class ActorCritic(nn.Module):
    def __init__(self, obs_dim, n_actions):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(obs_dim, 64), nn.Tanh(),
            nn.Linear(64, 64),      nn.Tanh(),
        )
        self.actor  = nn.Linear(64, n_actions)
        self.critic = nn.Linear(64, 1)
    def forward(self, x):
        h = self.shared(x)
        return self.actor(h), self.critic(h).squeeze(-1)

def compute_gae(rewards, values, dones, gamma=0.99, lam=0.95):
    adv = torch.zeros_like(rewards)
    last = 0.0
    for t in reversed(range(len(rewards))):
        nonterminal = 1.0 - dones[t]
        next_val = values[t + 1] if t + 1 < len(values) else 0.0
        delta = rewards[t] + gamma * next_val * nonterminal - values[t]
        last = delta + gamma * lam * nonterminal * last
        adv[t] = last
    return adv

def collect_rollout(env, model, steps=2048):
    obs, _ = env.reset()
    data = {"obs": [], "actions": [], "logp": [],
            "rewards": [], "dones": [], "values": []}
    ep_returns, ep_return = [], 0.0

    for _ in range(steps):
        obs_t = torch.tensor(obs, dtype=torch.float32)
        with torch.no_grad():
            logits, value = model(obs_t)
        dist = Categorical(logits=logits)
        a = dist.sample()

        next_obs, r, term, trunc, _ = env.step(a.item())
        done = term or trunc
        data["obs"].append(obs_t)
        data["actions"].append(a)
        data["logp"].append(dist.log_prob(a))
        data["rewards"].append(r)
        data["dones"].append(float(done))
        data["values"].append(value)
        ep_return += r
        obs = next_obs
        if done:
            ep_returns.append(ep_return)
            ep_return = 0.0
            obs, _ = env.reset()

    return {
        "obs":     torch.stack(data["obs"]),
        "actions": torch.stack(data["actions"]),
        "logp":    torch.stack(data["logp"]).detach(),
        "rewards": torch.tensor(data["rewards"], dtype=torch.float32),
        "dones":   torch.tensor(data["dones"],   dtype=torch.float32),
        "values":  torch.stack(data["values"]).detach(),
    }, ep_returns

def ppo_update(model, opt, batch, clip=0.2, epochs=10, minibatch=64,
               value_coef=0.5, entropy_coef=0.01):
    adv = compute_gae(batch["rewards"], batch["values"], batch["dones"])
    returns = adv + batch["values"]
    adv = (adv - adv.mean()) / (adv.std() + 1e-8)

    N = len(batch["obs"])
    idx = torch.arange(N)
    for _ in range(epochs):
        perm = idx[torch.randperm(N)]
        for s in range(0, N, minibatch):
            m = perm[s:s + minibatch]
            logits, values = model(batch["obs"][m])
            dist = Categorical(logits=logits)
            new_logp = dist.log_prob(batch["actions"][m])
            ratio = (new_logp - batch["logp"][m]).exp()
            unclipped = ratio * adv[m]
            clipped = ratio.clamp(1 - clip, 1 + clip) * adv[m]
            policy_loss = -torch.min(unclipped, clipped).mean()
            value_loss  = F.mse_loss(values, returns[m])
            entropy     = dist.entropy().mean()
            loss = policy_loss + value_coef * value_loss - entropy_coef * entropy
            opt.zero_grad(); loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 0.5)
            opt.step()

def train_ppo(env_name="CartPole-v1", iterations=50):
    env = gym.make(env_name)
    model = ActorCritic(env.observation_space.shape[0], env.action_space.n)
    opt = torch.optim.Adam(model.parameters(), lr=3e-4)
    for i in range(iterations):
        batch, rets = collect_rollout(env, model, steps=1024)
        ppo_update(model, opt, batch)
        if rets:
            print(f"iter {i:02d}  avg return {sum(rets)/len(rets):.1f}")
    env.close()
    return model`,

    'model-based-rl': `import torch
import torch.nn as nn

# =====================================================
# 1. Probabilistic dynamics ensemble
# =====================================================
class DynamicsModel(nn.Module):
    def __init__(self, s_dim, a_dim, hidden=256):
        super().__init__()
        self.trunk = nn.Sequential(
            nn.Linear(s_dim + a_dim, hidden), nn.SiLU(),
            nn.Linear(hidden, hidden),        nn.SiLU(),
        )
        self.mean = nn.Linear(hidden, s_dim)
        self.logstd = nn.Linear(hidden, s_dim)
    def forward(self, s, a):
        h = self.trunk(torch.cat([s, a], dim=-1))
        mean = s + self.mean(h)                          # residual
        logstd = self.logstd(h).clamp(-5, 2)
        return mean, logstd

class DynamicsEnsemble(nn.Module):
    def __init__(self, s_dim, a_dim, n_models=5):
        super().__init__()
        self.models = nn.ModuleList(
            [DynamicsModel(s_dim, a_dim) for _ in range(n_models)]
        )
    def forward(self, s, a):
        means, logstds = zip(*[m(s, a) for m in self.models])
        return torch.stack(means), torch.stack(logstds)  # (n, B, s_dim)

def nll_loss(mean, logstd, target):
    inv_var = torch.exp(-2 * logstd)
    return (((target - mean) ** 2) * inv_var + 2 * logstd).mean()

# =====================================================
# 2. Cross-Entropy Method (CEM) planner
# =====================================================
def cem_plan(ensemble, reward_fn, s0,
             horizon=15, pop=256, elite=32, iters=5, a_dim=1):
    device = s0.device
    mu  = torch.zeros(horizon, a_dim, device=device)
    std = torch.ones (horizon, a_dim, device=device)

    for _ in range(iters):
        actions = mu + std * torch.randn(pop, horizon, a_dim, device=device)
        actions = actions.clamp(-1, 1)
        s = s0.expand(pop, -1).clone()
        total = torch.zeros(pop, device=device)
        for t in range(horizon):
            a = actions[:, t]
            means, _ = ensemble(s, a)
            # average across ensemble (simple; consider random-ensemble too)
            s = means.mean(0)
            total += reward_fn(s, a)
        elite_idx = total.topk(elite).indices
        elite_actions = actions[elite_idx]
        mu  = elite_actions.mean(0)
        std = elite_actions.std(0) + 1e-6

    return mu[0]  # best first action

# =====================================================
# 3. Dyna-style loop sketch
# =====================================================
def dyna_step(ensemble, policy, env, opt_dyn,
              real_buffer, planning_horizon=5):
    # Train dynamics from real transitions
    s, a, s_next = real_buffer.sample_batch()
    means, logstds = ensemble(s, a)
    loss = sum(nll_loss(means[i], logstds[i], s_next) for i in range(len(ensemble.models)))
    opt_dyn.zero_grad(); loss.backward(); opt_dyn.step()

    # Generate imagined rollouts from the ensemble
    # ... use them to update 'policy' via your favorite model-free algorithm
    return loss.item()`,

    'word-embeddings': `import torch
import torch.nn as nn
import torch.nn.functional as F

# =====================================================
# 1. Skip-Gram with negative sampling (Word2Vec)
# =====================================================
class SkipGram(nn.Module):
    def __init__(self, vocab_size, embed_dim=128):
        super().__init__()
        self.in_embed  = nn.Embedding(vocab_size, embed_dim)
        self.out_embed = nn.Embedding(vocab_size, embed_dim)

    def forward(self, center, context, neg):
        """center: (B,)  context: (B,)  neg: (B, K)"""
        c = self.in_embed(center)                     # (B, D)
        ctx = self.out_embed(context)                 # (B, D)
        neg_v = self.out_embed(neg)                   # (B, K, D)

        pos_score = (c * ctx).sum(dim=-1)
        neg_score = torch.bmm(neg_v, c.unsqueeze(-1)).squeeze(-1)

        loss = -(F.logsigmoid(pos_score).mean()
                 + F.logsigmoid(-neg_score).mean())
        return loss

# =====================================================
# 2. Loading pretrained embeddings (GloVe-style)
# =====================================================
def load_pretrained(vocab, path, dim=100):
    embed = nn.Embedding(len(vocab), dim)
    embed.weight.data.uniform_(-0.1, 0.1)
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.rstrip().split(" ")
            word, vec = parts[0], parts[1:]
            if word in vocab and len(vec) == dim:
                embed.weight.data[vocab[word]] = torch.tensor(
                    [float(v) for v in vec]
                )
    return embed

# =====================================================
# 3. Classifier head on top of embeddings
# =====================================================
class TextCNN(nn.Module):
    def __init__(self, vocab_size, num_classes, embed_dim=128):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.convs = nn.ModuleList([
            nn.Conv1d(embed_dim, 64, kernel_size=k, padding=k // 2)
            for k in (3, 4, 5)
        ])
        self.fc = nn.Linear(64 * 3, num_classes)
    def forward(self, tokens):
        x = self.embed(tokens).transpose(1, 2)        # (B, D, T)
        pooled = [F.relu(conv(x)).max(dim=2).values for conv in self.convs]
        return self.fc(torch.cat(pooled, dim=1))

# Smoke-test
model = TextCNN(vocab_size=5000, num_classes=4)
print(model(torch.randint(0, 5000, (8, 40))).shape)`,

    'seq2seq': `import torch
import torch.nn as nn
import torch.nn.functional as F

# =====================================================
# 1. Transformer-based Seq2Seq
# =====================================================
class Seq2SeqTransformer(nn.Module):
    def __init__(self, src_vocab, tgt_vocab, d_model=256, nhead=8,
                 num_enc=3, num_dec=3, max_len=512, pad_idx=0):
        super().__init__()
        self.pad_idx = pad_idx
        self.src_embed = nn.Embedding(src_vocab, d_model, padding_idx=pad_idx)
        self.tgt_embed = nn.Embedding(tgt_vocab, d_model, padding_idx=pad_idx)
        self.pos = nn.Embedding(max_len, d_model)
        self.transformer = nn.Transformer(
            d_model=d_model, nhead=nhead,
            num_encoder_layers=num_enc, num_decoder_layers=num_dec,
            dim_feedforward=4 * d_model, dropout=0.1,
            batch_first=True, norm_first=True,
        )
        self.out = nn.Linear(d_model, tgt_vocab)

    def _embed(self, tokens, embedder):
        B, T = tokens.shape
        pos = torch.arange(T, device=tokens.device).unsqueeze(0).expand(B, T)
        return embedder(tokens) + self.pos(pos)

    def forward(self, src, tgt):
        src_pad = src == self.pad_idx
        tgt_pad = tgt == self.pad_idx
        tgt_mask = nn.Transformer.generate_square_subsequent_mask(
            tgt.size(1)).to(src.device)

        memory = self.transformer.encoder(
            self._embed(src, self.src_embed),
            src_key_padding_mask=src_pad,
        )
        out = self.transformer.decoder(
            self._embed(tgt, self.tgt_embed), memory,
            tgt_mask=tgt_mask,
            tgt_key_padding_mask=tgt_pad,
            memory_key_padding_mask=src_pad,
        )
        return self.out(out)

# =====================================================
# 2. Greedy / beam-search decoding
# =====================================================
@torch.no_grad()
def greedy_decode(model, src, bos=1, eos=2, max_len=64):
    model.eval()
    ys = torch.full((src.size(0), 1), bos, dtype=torch.long, device=src.device)
    for _ in range(max_len - 1):
        logits = model(src, ys)
        next_tok = logits[:, -1].argmax(-1, keepdim=True)
        ys = torch.cat([ys, next_tok], dim=1)
        if (next_tok == eos).all(): break
    return ys

# =====================================================
# 3. Training step with teacher forcing
# =====================================================
def train_step(model, opt, src, tgt, pad_idx=0):
    tgt_in  = tgt[:, :-1]        # teacher forcing input
    tgt_out = tgt[:, 1:]         # target to predict
    logits = model(src, tgt_in)
    loss = F.cross_entropy(
        logits.reshape(-1, logits.size(-1)),
        tgt_out.reshape(-1),
        ignore_index=pad_idx,
    )
    opt.zero_grad(); loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    opt.step()
    return loss.item()`,

    'bert-transformers': `# pip install transformers datasets
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup,
)

MODEL_NAME = "distilbert-base-uncased"
NUM_LABELS = 2
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME, num_labels=NUM_LABELS,
).to(device)

# ============ Tokenization helper ============
def collate(batch):
    texts  = [b["text"]  for b in batch]
    labels = [b["label"] for b in batch]
    enc = tokenizer(texts, padding=True, truncation=True,
                    max_length=128, return_tensors="pt")
    enc["labels"] = torch.tensor(labels, dtype=torch.long)
    return {k: v.to(device) for k, v in enc.items()}

# ============ Training loop ============
def train(train_ds, val_ds, epochs=3, lr=2e-5, batch=16):
    train_loader = DataLoader(train_ds, batch_size=batch,
                              shuffle=True, collate_fn=collate)
    val_loader   = DataLoader(val_ds, batch_size=batch,
                              collate_fn=collate)

    no_decay = ["bias", "LayerNorm.weight"]
    grouped = [
        {"params": [p for n, p in model.named_parameters()
                    if not any(nd in n for nd in no_decay)],
         "weight_decay": 0.01},
        {"params": [p for n, p in model.named_parameters()
                    if any(nd in n for nd in no_decay)],
         "weight_decay": 0.0},
    ]
    opt = torch.optim.AdamW(grouped, lr=lr)
    total_steps = len(train_loader) * epochs
    sched = get_linear_schedule_with_warmup(
        opt, int(0.1 * total_steps), total_steps,
    )

    for epoch in range(epochs):
        model.train()
        for batch in train_loader:
            out = model(**batch)
            opt.zero_grad()
            out.loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step(); sched.step()

        # Validation
        model.eval()
        correct = total = 0
        with torch.no_grad():
            for batch in val_loader:
                logits = model(**batch).logits
                preds = logits.argmax(-1)
                correct += (preds == batch["labels"]).sum().item()
                total += preds.size(0)
        print(f"epoch {epoch}  val acc {correct / total:.4f}")

    return model

# ============ Inference ============
@torch.no_grad()
def predict(texts):
    model.eval()
    enc = tokenizer(texts, padding=True, truncation=True,
                    max_length=128, return_tensors="pt").to(device)
    return model(**enc).logits.argmax(-1).tolist()`,
  }
  
  return fullExamples[topicId] || getCodeExample(topicId)
}


type GuideEntry = { whatYouSee: string; tryThis: string; takeaway: string }

const INTERACTIVE_GUIDES: Record<string, GuideEntry> = {
  'pytorch-intro': {
    whatYouSee: 'The PyTorch logo and an AI brain diagram summarising the ecosystem.',
    tryThis: 'Hover the nodes to see how components relate, then skim the "Key Concepts" tab.',
    takeaway: 'PyTorch ties Python, tensors, autograd and GPU compute into one clean stack.',
  },
  'tensor-fundamentals': {
    whatYouSee: 'A tensor visualizer that renders scalars, vectors, matrices and a real RGB image batch.',
    tryThis: 'Cycle through 0-D → 4-D. Notice how shape grows while storage stays a flat array.',
    takeaway: 'A tensor is just numbers + a shape + a device — the "shape" is what changes meaning.',
  },
  'tensor-broadcasting': {
    whatYouSee: 'Element-wise, matmul, and broadcast ops shown step by step.',
    tryThis: 'Run "broadcast" and watch the (3,1) tensor expand against (1,3) without copying memory.',
    takeaway: 'Align shapes from the right; 1-sized dims stretch for free. No loops, no copies.',
  },
  'autograd-basics': {
    whatYouSee: 'A live backprop trace through a small computation graph.',
    tryThis: 'Play the animation and watch gradients flow backwards, accumulating in leaves.',
    takeaway: 'Autograd is the chain rule applied automatically to a dynamically built graph.',
  },
  'custom-autograd': {
    whatYouSee: 'Forward + backward passes with editable nodes.',
    tryThis: 'Imagine each node as a torch.autograd.Function: save inputs on forward, use them in backward.',
    takeaway: 'Custom Functions are just: save tensors with ctx, return grads in the same shape.',
  },
  'nn-module': {
    whatYouSee: 'A trainable 2-5-4-1 MLP classifying 2-D points + an activation-function plotter.',
    tryThis: 'Train on "circle", then switch to "spiral". Shrink both hidden layers to 1 and watch it fail.',
    takeaway: 'Depth × width × non-linearity = capacity. Too little and it cannot fit non-linear boundaries.',
  },
  'cnn-architectures': {
    whatYouSee: 'A CNN pipeline: input image → convolution → ReLU → max-pool → feature maps.',
    tryThis: 'Scrub through kernels — edge detectors in early layers become textures later.',
    takeaway: 'Convolutions share weights over space, which is why they generalise on images.',
  },
  'rnn-lstm': {
    whatYouSee: 'A small recurrent-style network + a layer flow visual.',
    tryThis: 'Picture the hidden state being re-fed at each timestep — the MLP is the "cell".',
    takeaway: 'Weights are shared over time; vanishing gradients motivate gated LSTM/GRU cells.',
  },
  'transformers': {
    whatYouSee: 'A Q·Kᵀ attention heatmap computed live between two token sequences.',
    tryThis: 'Edit the input tokens and watch which target positions each source attends to.',
    takeaway: 'Attention = weighted lookup. Softmax(QKᵀ/√d)V routes information without recurrence.',
  },
  'loss-functions': {
    whatYouSee: 'A 2-D loss landscape + gradient descent trajectory on a mini-batch.',
    tryThis: 'Crank the learning rate. You will see overshoot and divergence.',
    takeaway: 'Loss shape + lr + momentum together decide whether you converge or explode.',
  },
  'training-loop': {
    whatYouSee: 'A training simulator: forward → loss → backward → step, ticking in real time.',
    tryThis: 'Start training, then pause at different epochs and look at the weights/loss curve.',
    takeaway: 'Every step is just: zero_grad, forward, loss, backward, optimizer.step.',
  },
  'optimizers': {
    whatYouSee: 'SGD, Momentum, RMSProp and Adam racing on the same loss surface.',
    tryThis: 'Pick a ravine-shaped loss and watch Adam tunnel along it while SGD zig-zags.',
    takeaway: 'Adam adapts per-parameter step sizes; that is what makes it robust out-of-the-box.',
  },
  'distributed-training': {
    whatYouSee: 'A stacked-layer pipeline suggesting forward activations flowing across devices.',
    tryThis: 'Think of each layer block as one GPU in FSDP/DDP — all-reduce happens at the boundaries.',
    takeaway: 'Data-parallel shards the batch; model-parallel shards the parameters.',
  },
  'model-optimization': {
    whatYouSee: 'A compact layer pipeline + a small MLP (the "student" during distillation).',
    tryThis: 'Imagine halving every weight — that is what INT8 quantization does for inference.',
    takeaway: 'Quantize, prune, distill, compile. Each is a knob that trades accuracy for speed/size.',
  },
  'gan-basics': {
    whatYouSee: 'Generator samples drifting towards the real distribution while D learns a boundary.',
    tryThis: 'Watch the D heatmap — if it collapses to one colour the generator has won this round.',
    takeaway: 'GANs are a minimax game: each network is only as good as its opponent forces it to be.',
  },
  'dcgan': {
    whatYouSee: 'A GAN training demo standing in for a convolutional G/D pair.',
    tryThis: 'Translate: "Conv/BN/ReLU in G, Conv/LeakyReLU in D" — DCGAN\'s exact recipe.',
    takeaway: 'DCGAN showed that architectural choices alone can stabilise GAN training.',
  },
  'stylegan': {
    whatYouSee: 'A generator-vs-discriminator demo.',
    tryThis: 'Imagine the latent z being split per resolution level — that is the "style" in StyleGAN.',
    takeaway: 'Style-based generation gives interpretable control over coarse-to-fine features.',
  },
  'wgan': {
    whatYouSee: 'A GAN demo — replace the BCE with a Wasserstein critic mentally.',
    tryThis: 'Note how the discriminator\'s output is no longer bounded in [0,1] under WGAN.',
    takeaway: 'Wasserstein + gradient penalty = stable, meaningful loss, almost no mode collapse.',
  },
  'diffusion-models': {
    whatYouSee: 'A generative sampling demo.',
    tryThis: 'Picture the generator step as "predict noise, subtract noise" repeated T times.',
    takeaway: 'Diffusion = gradually de-noise a random vector into a sample.',
  },
  'rl-basics': {
    whatYouSee: 'A gridworld agent learning with Q-learning. Live Q-values on every cell.',
    tryThis: 'Run one episode at a time and watch Q-values propagate backwards from the goal.',
    takeaway: 'Q(s,a) ← Q(s,a) + α[r + γ max Q(s′,·) − Q(s,a)]. That single update is the whole trick.',
  },
  'dqn': {
    whatYouSee: 'Q-learning gridworld (stand-in for DQN).',
    tryThis: 'Imagine the Q-table replaced by a neural net predicting Q-values for every action.',
    takeaway: 'DQN = Q-learning + function approximation + replay buffer + target network.',
  },
  'policy-gradient': {
    whatYouSee: 'Gridworld RL agent — a policy-gradient agent would maximise expected return directly.',
    tryThis: 'Swap argmax for sampling from a softmax policy in your head.',
    takeaway: 'Policy gradient: ∇J(θ) = E[∇ log π(a|s;θ) · Gₜ]. Reward scales the gradient.',
  },
  'ppo-trpo': {
    whatYouSee: 'A stand-in RL agent.',
    tryThis: 'PPO simply clips the probability ratio between old and new policies — that is the whole change.',
    takeaway: 'Trust-region updates stop policy collapse when the environment is noisy.',
  },
  'model-based-rl': {
    whatYouSee: 'Gridworld RL agent.',
    tryThis: 'Now imagine the agent also learning a model f(s,a)→s′ and planning with it.',
    takeaway: 'Model-based RL trades sample efficiency for extra complexity.',
  },
  'cv-fundamentals': {
    whatYouSee: 'A conv pipeline + an RGB → grayscale → edge-detection demo.',
    tryThis: 'Watch how a 3×3 Sobel kernel turns an image into its gradient magnitude.',
    takeaway: 'Classic filters are small conv kernels. Deep CNNs learn the coefficients from data.',
  },
  'object-detection': {
    whatYouSee: 'Edge/feature extraction demo that feeds into a downstream head.',
    tryThis: 'Mentally add "anchor boxes + two heads (class, bbox)" to the pipeline.',
    takeaway: 'Modern detectors share a CNN backbone and attach specialised heads for class + location.',
  },
  'image-segmentation': {
    whatYouSee: 'Per-pixel feature extraction.',
    tryThis: 'Think of the output as a per-pixel class map instead of a single class.',
    takeaway: 'U-Net/Mask-R-CNN learn per-pixel predictions via encoder-decoder skip connections.',
  },
  'pose-estimation': {
    whatYouSee: 'CV feature extraction.',
    tryThis: 'Replace the output with K heatmaps, one per keypoint.',
    takeaway: 'Keypoint regression = predict heatmaps, take the argmax for joint location.',
  },
  'word-embeddings': {
    whatYouSee: 'A 2-D embedding space with clickable words and nearest-neighbour highlighting.',
    tryThis: 'Click "king" then "queen". Now switch to "Vector Arithmetic" to see king − man + woman.',
    takeaway: 'Good embeddings put similar meanings near each other; linear offsets encode analogies.',
  },
  'seq2seq': {
    whatYouSee: 'An attention heatmap — the core of an encoder-decoder with attention.',
    tryThis: 'Imagine each decoder step looking back at all encoder states via the heatmap.',
    takeaway: 'Seq2seq + attention: decoder queries encoder memory at every output step.',
  },
  'bert-transformers': {
    whatYouSee: 'Attention heatmap + embedding space.',
    tryThis: 'Swap "word vectors" for "context-dependent vectors": "bank" has two different points.',
    takeaway: 'BERT/GPT = transformer + self-supervised pretraining + fine-tuning for downstream tasks.',
  },
}

function InteractiveGuide({ topicId }: { topicId: string }) {
  const g = INTERACTIVE_GUIDES[topicId]
  if (!g) return null
  return (
    <div className="mb-6 grid gap-3 md:grid-cols-3">
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-sm">
          <Sparkle size={16} weight="fill" />
          What you're looking at
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{g.whatYouSee}</p>
      </div>
      <div className="rounded-xl border-2 border-violet/30 bg-violet/5 p-4">
        <div className="flex items-center gap-2 mb-2 text-violet font-semibold text-sm">
          <Lightbulb size={16} weight="fill" />
          Try this
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{g.tryThis}</p>
      </div>
      <div className="rounded-xl border-2 border-lime/30 bg-lime/5 p-4">
        <div className="flex items-center gap-2 mb-2 text-lime font-semibold text-sm">
          <Target size={16} weight="fill" />
          Key takeaway
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{g.takeaway}</p>
      </div>
    </div>
  )
}
