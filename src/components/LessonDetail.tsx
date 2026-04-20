import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import type { Lesson } from '@/lib/lessons'
import { TensorVisualizer } from './TensorVisualizer'
import { NeuralNetworkVisualizer } from './NeuralNetworkVisualizer'
import { TrainingSimulator } from './TrainingSimulator'
import { AIBrainVisual } from './visuals/AIBrainVisual'
import { PyTorchLogoVisual } from './visuals/PyTorchLogoVisual'
import { TensorOperationVisual } from './visuals/TensorOperationVisual'
import { LayersFlowVisual } from './visuals/LayersFlowVisual'
import { ActivationFunctionVisual } from './visuals/ActivationFunctionVisual'
import { BackpropVisualizer } from './visuals/BackpropVisualizer'
import { OptimizerComparisonVisual } from './visuals/OptimizerComparisonVisual'

interface LessonDetailProps {
  lesson: Lesson
  onBack: () => void
  onComplete: () => void
  isCompleted: boolean
}

export function LessonDetail({ lesson, onBack, onComplete, isCompleted }: LessonDetailProps) {
  const renderLessonContent = () => {
    switch (lesson.id) {
      case 'what-is-ai':
        return (
          <div className="space-y-6">
            <AIBrainVisual />
            
            <Card className="bg-gradient-to-br from-violet/5 to-primary/5 border-violet/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet to-primary bg-clip-text text-transparent">
                  What is Artificial Intelligence?
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg text-center">
                    <strong>Artificial Intelligence (AI)</strong> is like teaching computers to think and learn, just like you do! 🧠✨
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-card p-6 rounded-xl space-y-3 border-2 border-violet/20">
                      <h4 className="font-bold text-xl text-violet">👤 How Humans Learn:</h4>
                      <ul className="space-y-2 text-base">
                        <li>👀 You see a cat for the first time</li>
                        <li>🧠 Your brain notices: "It has fur, whiskers, and says meow"</li>
                        <li>📚 Next time you see something similar, you know it's a cat!</li>
                      </ul>
                    </div>
                    <div className="bg-card p-6 rounded-xl space-y-3 border-2 border-primary/20">
                      <h4 className="font-bold text-xl text-primary">🤖 How AI Learns:</h4>
                      <ul className="space-y-2 text-base">
                        <li>👁️ We show the computer thousands of cat pictures</li>
                        <li>💻 It finds patterns: "Cats have pointy ears and whiskers"</li>
                        <li>🎯 Now it can recognize cats in new pictures!</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="text-lg font-semibold bg-gradient-to-r from-violet via-primary to-cyan bg-clip-text text-transparent text-center">
                    AI is everywhere! It helps with voice assistants, game recommendations, face filters on photos, and so much more!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'what-is-pytorch':
        return (
          <div className="space-y-6">
            <PyTorchLogoVisual />
            
            <Card className="bg-gradient-to-br from-orange/5 to-accent/5 border-orange/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-orange to-accent bg-clip-text text-transparent">
                  Meet PyTorch - Your AI Building Toolkit! ⚡
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg text-center">
                    <strong>PyTorch</strong> is like a super-powered LEGO set for building AI! Just like you use LEGO blocks to build castles and spaceships, we use PyTorch to build smart computer programs! 🏗️
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card p-5 rounded-xl border-2 border-orange/20">
                      <div className="text-3xl mb-2">🧱</div>
                      <h4 className="font-bold text-lg text-orange mb-2">Building Blocks</h4>
                      <p className="text-sm">PyTorch gives you all the pieces you need - like tensors, layers, and functions - to build your AI!</p>
                    </div>
                    <div className="bg-card p-5 rounded-xl border-2 border-accent/20">
                      <div className="text-3xl mb-2">🎨</div>
                      <h4 className="font-bold text-lg text-accent mb-2">Easy to Use</h4>
                      <p className="text-sm">It's designed to be simple and fun! You can experiment and see results quickly!</p>
                    </div>
                    <div className="bg-card p-5 rounded-xl border-2 border-coral/20">
                      <div className="text-3xl mb-2">⚡</div>
                      <h4 className="font-bold text-lg text-coral mb-2">Super Fast</h4>
                      <p className="text-sm">PyTorch uses your computer's GPU (graphics card) to train AI models super quickly!</p>
                    </div>
                    <div className="bg-card p-5 rounded-xl border-2 border-lime/20">
                      <div className="text-3xl mb-2">🌟</div>
                      <h4 className="font-bold text-lg text-lime mb-2">Used by Experts</h4>
                      <p className="text-sm">Scientists and engineers at big companies use PyTorch to create amazing AI!</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange/10 to-accent/10 p-6 rounded-xl border-2 border-orange/30">
                    <p className="text-base font-semibold mb-2">🎯 Fun Fact:</p>
                    <p className="text-sm">PyTorch was created by Facebook (now Meta) and is used to build things like image recognition, language translation, and even robots!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'what-is-tensor':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-cyan/5 to-secondary/5 border-cyan/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan to-secondary bg-clip-text text-transparent">
                  What is a Tensor? 📦
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg text-center">
                    A <strong>tensor</strong> is a magical container that holds numbers! Everything in AI — images, sounds, words — gets turned into tensors so the computer can understand it! ✨
                  </p>
                  
                  <div className="bg-gradient-to-r from-cyan/10 to-cyan/5 p-6 rounded-xl border-2 border-cyan/30">
                    <h4 className="font-bold text-xl mb-3">🎯 Think of it like building blocks:</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-card p-4 rounded-lg">
                        <div className="text-4xl">📏</div>
                        <div>
                          <p className="font-bold text-base">0D Tensor = A Single Number (Scalar)</p>
                          <p className="text-sm text-muted-foreground">Just one value, like your age: <span className="font-mono bg-muted px-2 rounded">12</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-card p-4 rounded-lg">
                        <div className="text-4xl">📝</div>
                        <div>
                          <p className="font-bold text-base">1D Tensor = A List (Vector)</p>
                          <p className="text-sm text-muted-foreground">A row of numbers: <span className="font-mono bg-muted px-2 rounded">[5, 12, 8, 3, 19]</span></p>
                          <p className="text-xs text-muted-foreground mt-1">Like your scores on 5 different tests!</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-card p-4 rounded-lg">
                        <div className="text-4xl">📊</div>
                        <div>
                          <p className="font-bold text-base">2D Tensor = A Table (Matrix)</p>
                          <p className="text-sm text-muted-foreground">Rows AND columns: <span className="font-mono bg-muted px-2 rounded">[[1,2],[3,4],[5,6]]</span></p>
                          <p className="text-xs text-muted-foreground mt-1">Like a black-and-white photo — each number is how bright a pixel is!</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-card p-4 rounded-lg">
                        <div className="text-4xl">📦</div>
                        <div>
                          <p className="font-bold text-base">3D Tensor = Stacked Tables (Volume)</p>
                          <p className="text-sm text-muted-foreground">Multiple tables stacked: 3 layers for Red, Green, Blue</p>
                          <p className="text-xs text-muted-foreground mt-1">A color photo is a 3D tensor! 🌈</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card p-5 rounded-xl border-2 border-pink/30">
                      <div className="text-3xl mb-2">🖼️</div>
                      <h4 className="font-bold text-lg text-pink mb-2">Images as Tensors</h4>
                      <p className="text-xs">A 224×224 color photo = a tensor of shape [3, 224, 224] — that's 150,528 numbers!</p>
                    </div>
                    <div className="bg-card p-5 rounded-xl border-2 border-violet/30">
                      <div className="text-3xl mb-2">🔤</div>
                      <h4 className="font-bold text-lg text-violet mb-2">Words as Tensors</h4>
                      <p className="text-xs">Each word gets converted to a list of ~100-300 numbers that capture its meaning!</p>
                    </div>
                  </div>

                  <p className="text-center text-muted-foreground">
                    Try the interactive playground below to build your own tensors! 👇
                  </p>
                </div>
              </CardContent>
            </Card>
            <TensorVisualizer
              title="Interactive Tensor Playground"
              description="Add and remove dimensions to see how tensors change shape!"
            />
          </div>
        )

      case 'tensor-shapes':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-cyan/5 to-secondary/5 border-cyan/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan to-secondary bg-clip-text text-transparent">
                  Exploring Tensor Shapes! 📐
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
                    Tensors come in different <strong>shapes</strong> depending on what kind of data they hold. Let's explore!
                  </p>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-cyan/10 to-cyan/5 p-6 rounded-xl border-2 border-cyan/30">
                      <h4 className="font-bold text-xl text-cyan mb-3 flex items-center gap-2">
                        <span>📏</span> 1D Tensor (Vector)
                      </h4>
                      <p className="text-base mb-3">A simple list of numbers - just one dimension!</p>
                      <div className="bg-card p-4 rounded-lg font-mono text-sm">
                        [5, 12, 8, 3, 19]
                      </div>
                      <p className="text-sm mt-2 text-muted-foreground">
                        <strong>Real Example:</strong> Temperature readings: [72°, 75°, 78°, 80°, 77°]
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 p-6 rounded-xl border-2 border-secondary/30">
                      <h4 className="font-bold text-xl text-secondary mb-3 flex items-center gap-2">
                        <span>📊</span> 2D Tensor (Matrix)
                      </h4>
                      <p className="text-base mb-3">A table with rows and columns - two dimensions!</p>
                      <div className="bg-card p-4 rounded-lg font-mono text-sm">
                        [[1, 2, 3],<br/>
                        &nbsp;[4, 5, 6],<br/>
                        &nbsp;[7, 8, 9]]
                      </div>
                      <p className="text-sm mt-2 text-muted-foreground">
                        <strong>Real Example:</strong> A grayscale image - each number is a pixel brightness!
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-violet/10 to-violet/5 p-6 rounded-xl border-2 border-violet/30">
                      <h4 className="font-bold text-xl text-violet mb-3 flex items-center gap-2">
                        <span>📦</span> 3D Tensor (Cube)
                      </h4>
                      <p className="text-base mb-3">Multiple tables stacked together - three dimensions!</p>
                      <div className="bg-card p-4 rounded-lg font-mono text-xs">
                        [[[R, R, R], [R, R, R]],<br/>
                        &nbsp;[[G, G, G], [G, G, G]],<br/>
                        &nbsp;[[B, B, B], [B, B, B]]]
                      </div>
                      <p className="text-sm mt-2 text-muted-foreground">
                        <strong>Real Example:</strong> A color image - 3 layers for Red, Green, and Blue!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <TensorVisualizer
              title="Shape Explorer"
              description="Change dimensions and watch the shape transform!"
            />
          </div>
        )

      case 'tensor-operations':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-pink/5 to-coral/5 border-pink/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-pink to-coral bg-clip-text text-transparent">
                  Tensor Magic: Interactive Operations! ✨
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
                    Tensors aren't just for storing numbers — they can <strong>transform</strong> too! Every operation in PyTorch is a little bit of magic that turns one tensor into another. 🪄
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-pink/10 to-pink/5 p-5 rounded-xl border-2 border-pink/30">
                      <h4 className="font-bold text-lg text-pink mb-2">➕ Add & Subtract</h4>
                      <p className="text-sm">Add two tensors together number-by-number, like stacking two towers of blocks.</p>
                      <div className="bg-card p-3 rounded-lg font-mono text-xs mt-2">
                        [1, 2, 3] + [4, 5, 6]<br/>= [5, 7, 9]
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-coral/10 to-coral/5 p-5 rounded-xl border-2 border-coral/30">
                      <h4 className="font-bold text-lg text-coral mb-2">✖️ Multiply</h4>
                      <p className="text-sm">Multiply every number by another tensor or a single value (called a <em>scalar</em>).</p>
                      <div className="bg-card p-3 rounded-lg font-mono text-xs mt-2">
                        [1, 2, 3] × 2<br/>= [2, 4, 6]
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan/10 to-cyan/5 p-5 rounded-xl border-2 border-cyan/30">
                      <h4 className="font-bold text-lg text-cyan mb-2">🔄 Reshape</h4>
                      <p className="text-sm">Rearrange the same numbers into a new shape — like folding a paper strip into a square.</p>
                      <div className="bg-card p-3 rounded-lg font-mono text-xs mt-2">
                        [1, 2, 3, 4] → [[1, 2],<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[3, 4]]
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-lime/10 to-lime/5 p-5 rounded-xl border-2 border-lime/30">
                      <h4 className="font-bold text-lg text-lime mb-2">🧮 Sum & Mean</h4>
                      <p className="text-sm">Squash a whole tensor into a single number — the total or the average!</p>
                      <div className="bg-card p-3 rounded-lg font-mono text-xs mt-2">
                        sum([1, 2, 3]) = 6<br/>mean([1, 2, 3]) = 2
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-violet/10 to-primary/10 p-6 rounded-xl border-2 border-violet/30">
                    <h4 className="font-bold text-lg mb-2">💡 Why it matters:</h4>
                    <p className="text-sm">
                      Every image filter, every AI prediction, every chatbot reply — they're all made of millions of these tiny tensor operations working together. Master these and you're speaking the language of AI! 🚀
                    </p>
                  </div>

                  <p className="text-center text-muted-foreground">
                    Click the buttons below to watch tensors transform in real time! ✨
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <TensorOperationVisual />
          </div>
        )
      
      case 'what-is-neural-network':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-coral/5 to-violet/5 border-coral/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-coral to-violet bg-clip-text text-transparent">
                  Neural Networks: How Computers Think! 🧠
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg text-center">
                    A <strong>neural network</strong> is inspired by the human brain! It's made of tiny "neurons" connected together in layers, passing information along like a team relay. 🏃‍♂️➡️🏃‍♀️➡️🏃
                  </p>

                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-cyan/10 to-cyan/5 p-6 rounded-xl border-l-4 border-cyan">
                      <h4 className="font-bold text-xl text-cyan mb-2">🎯 Input Layer</h4>
                      <p className="text-sm mb-1">Where your data starts its journey.</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Example:</strong> For a 28×28 photo, each pixel becomes one input neuron — that's 784 neurons just for reading the image!
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-violet/10 to-violet/5 p-6 rounded-xl border-l-4 border-violet">
                      <h4 className="font-bold text-xl text-violet mb-2">🔮 Hidden Layers (The Thinking Part!)</h4>
                      <p className="text-sm mb-2">This is where the magic happens. Each layer spots increasingly complex patterns:</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-card p-2 rounded text-center">
                          <p className="text-lg mb-1">👀</p>
                          <p className="font-bold">Layer 1</p>
                          <p className="text-muted-foreground">Finds edges & lines</p>
                        </div>
                        <div className="bg-card p-2 rounded text-center">
                          <p className="text-lg mb-1">🔷</p>
                          <p className="font-bold">Layer 2</p>
                          <p className="text-muted-foreground">Combines into shapes</p>
                        </div>
                        <div className="bg-card p-2 rounded text-center">
                          <p className="text-lg mb-1">🐱</p>
                          <p className="font-bold">Layer 3</p>
                          <p className="text-muted-foreground">Recognizes objects!</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-lime/10 to-lime/5 p-6 rounded-xl border-l-4 border-lime">
                      <h4 className="font-bold text-xl text-lime mb-2">✨ Output Layer</h4>
                      <p className="text-sm mb-1">The final answer! One neuron per possible category.</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Example:</strong> For "cat vs dog", you have 2 output neurons. The brighter one wins: "90% cat, 10% dog → It's a cat!"
                      </p>
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-xl border-2 border-pink/30">
                    <h4 className="font-bold text-xl text-pink mb-3">🔗 How neurons connect</h4>
                    <p className="text-sm mb-2">
                      Each neuron receives numbers, multiplies them by <strong>weights</strong> (how important each input is), adds them up, and passes the result through an <strong>activation function</strong>.
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs text-center">
                      output = activation(weight₁ × input₁ + weight₂ × input₂ + ... + bias)
                    </div>
                    <p className="text-xs mt-2 text-muted-foreground">
                      Training adjusts the weights until the network gives correct answers! 🎯
                    </p>
                  </div>

                  <p className="text-center text-muted-foreground">
                    Watch the neural network in action below — see how data flows and neurons light up! 👇
                  </p>
                </div>
              </CardContent>
            </Card>
            <NeuralNetworkVisualizer />
          </div>
        )

      case 'layers-explained':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-coral/5 to-orange/5 border-coral/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-coral to-orange bg-clip-text text-transparent">
                  Understanding Neural Network Layers 🏗️
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
                    Imagine a neural network as a factory 🏭 — data comes in one end, passes through a line of workers, and a finished answer comes out the other end. Each <strong>layer</strong> is one station on that factory line.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-cyan/10 to-cyan/5 p-6 rounded-xl border-l-4 border-cyan">
                      <h4 className="font-bold text-xl text-cyan mb-2 flex items-center gap-2">
                        <span>🎯</span> Input Layer
                      </h4>
                      <p className="text-sm mb-2">This is where your raw data enters the network.</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Example:</strong> For a 28×28 image, the input layer has 784 numbers — one for every pixel.
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-violet/10 to-violet/5 p-6 rounded-xl border-l-4 border-violet">
                      <h4 className="font-bold text-xl text-violet mb-2 flex items-center gap-2">
                        <span>🔮</span> Hidden Layers
                      </h4>
                      <p className="text-sm mb-2">The "thinking" layers. Each one spots slightly more complex patterns than the one before it.</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• <strong>Early layers</strong> find simple things — edges, colors, dots</li>
                        <li>• <strong>Middle layers</strong> combine those into shapes — eyes, wheels, letters</li>
                        <li>• <strong>Later layers</strong> combine shapes into whole things — faces, cars, words</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-lime/10 to-lime/5 p-6 rounded-xl border-l-4 border-lime">
                      <h4 className="font-bold text-xl text-lime mb-2 flex items-center gap-2">
                        <span>✨</span> Output Layer
                      </h4>
                      <p className="text-sm mb-2">The final answer! It has one neuron for each possible answer.</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Example:</strong> To tell digits 0–9 apart, the output layer has 10 neurons; the one that lights up the brightest wins!
                      </p>
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-xl border-2 border-pink/30">
                    <h4 className="font-bold text-xl text-pink mb-3">🔗 How layers connect</h4>
                    <p className="text-sm mb-3">
                      Every neuron in one layer is usually connected to every neuron in the next layer. Each connection has a <strong>weight</strong> (how strong it is) that the network learns during training.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs">
                      output = activation( weight × input + bias )
                    </div>
                    <p className="text-xs mt-2 text-muted-foreground">
                      Each layer multiplies, adds a bias, and applies an activation function — that's it! Stack enough of these and you get intelligence. 🤯
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange/10 to-coral/10 p-6 rounded-xl border-2 border-orange/30">
                    <h4 className="font-bold text-lg mb-2">🧱 Layer types you'll meet:</h4>
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <div><strong>Linear (Dense)</strong> — every neuron connects to every other. The classic!</div>
                      <div><strong>Convolutional</strong> — slides a tiny window over images to find patterns.</div>
                      <div><strong>Recurrent</strong> — remembers what came before, perfect for sentences and music.</div>
                      <div><strong>Dropout</strong> — randomly ignores neurons during training, like a study break!</div>
                    </div>
                  </div>

                  <p className="text-center text-muted-foreground">
                    Watch data flow through the layers below — from input to output! 👇
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <LayersFlowVisual />
            <NeuralNetworkVisualizer />
          </div>
        )

      case 'activation-functions':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-violet/5 to-primary/5 border-violet/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-violet to-primary bg-clip-text text-transparent">
                  Activation Functions: The Decision Makers! 🎮
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
                    An <strong>activation function</strong> is a tiny decision-maker that lives inside every neuron. It looks at the neuron's number and decides: "Should I pass this on, or should I stay quiet?" 🤔
                  </p>

                  <div className="bg-gradient-to-r from-violet/10 to-primary/10 p-6 rounded-xl border-2 border-violet/30">
                    <h4 className="font-bold text-xl mb-2">💡 Why do we need them?</h4>
                    <p className="text-sm">
                      Without activation functions, a neural network — no matter how deep — would just be a very fancy calculator that can only draw straight lines. Activations add <strong>bends and curves</strong>, which is what lets AI learn complex patterns like faces, languages, and games! 🎨
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-cyan/10 to-cyan/5 p-6 rounded-xl border-l-4 border-cyan">
                      <h4 className="font-bold text-xl text-cyan mb-2 flex items-center gap-2">
                        <span>⚡</span> ReLU (Rectified Linear Unit)
                      </h4>
                      <p className="text-sm mb-2">
                        The simplest and most popular activation! If the number is negative, it becomes 0. Otherwise, it stays the same.
                      </p>
                      <div className="bg-card p-3 rounded-lg font-mono text-xs">
                        ReLU(-5) = 0 &nbsp;&nbsp;|&nbsp;&nbsp; ReLU(0) = 0 &nbsp;&nbsp;|&nbsp;&nbsp; ReLU(7) = 7
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground">
                        <strong>Think of it like:</strong> a light switch — off for negatives, on for positives. Fast and works great for most hidden layers! 💡
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-pink/10 to-pink/5 p-6 rounded-xl border-l-4 border-pink">
                      <h4 className="font-bold text-xl text-pink mb-2 flex items-center gap-2">
                        <span>📊</span> Sigmoid
                      </h4>
                      <p className="text-sm mb-2">
                        Squishes any number into a value between 0 and 1 — perfect for "how likely is this?" questions.
                      </p>
                      <div className="bg-card p-3 rounded-lg font-mono text-xs">
                        Sigmoid(-10) ≈ 0 &nbsp;&nbsp;|&nbsp;&nbsp; Sigmoid(0) = 0.5 &nbsp;&nbsp;|&nbsp;&nbsp; Sigmoid(10) ≈ 1
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground">
                        <strong>Think of it like:</strong> a confidence meter from 0% to 100%. Great for yes/no predictions! 🎯
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-lime/10 to-lime/5 p-6 rounded-xl border-l-4 border-lime">
                      <h4 className="font-bold text-xl text-lime mb-2 flex items-center gap-2">
                        <span>🌊</span> Tanh
                      </h4>
                      <p className="text-sm mb-2">
                        Like Sigmoid, but squishes numbers into a range of -1 to 1, so negatives stay negative.
                      </p>
                      <div className="bg-card p-3 rounded-lg font-mono text-xs">
                        Tanh(-10) ≈ -1 &nbsp;&nbsp;|&nbsp;&nbsp; Tanh(0) = 0 &nbsp;&nbsp;|&nbsp;&nbsp; Tanh(10) ≈ 1
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground">
                        <strong>Think of it like:</strong> a balance scale — tells you how strongly the answer leans positive or negative. ⚖️
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange/10 to-coral/10 p-6 rounded-xl border-2 border-orange/30">
                    <h4 className="font-bold text-lg mb-3">🎯 Which one should I use?</h4>
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <div><strong>Hidden layers:</strong> start with ReLU — fast and works almost everywhere.</div>
                      <div><strong>Binary yes/no output:</strong> use Sigmoid.</div>
                      <div><strong>Between -1 and 1:</strong> use Tanh.</div>
                      <div><strong>Pick one class out of many:</strong> use Softmax (the cousin of Sigmoid for many categories).</div>
                    </div>
                  </div>

                  <p className="text-center text-muted-foreground">
                    Try different activation functions below and see how they transform inputs! 👇
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <ActivationFunctionVisual />
          </div>
        )
      
      case 'training-intro':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-lime/5 to-cyan/5 border-lime/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-lime to-cyan bg-clip-text text-transparent">
                  Training Your First Model! 🎓
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg text-center">
                    <strong>Training</strong> is how your AI learns from examples — just like practicing a sport over and over until you get good! 🏀
                  </p>
                  
                  <div className="bg-gradient-to-r from-cyan/10 to-cyan/5 p-6 rounded-xl border-2 border-cyan/30">
                    <h4 className="font-bold text-xl mb-3">🔄 The Training Loop</h4>
                    <p className="text-sm mb-3">Every AI learns by repeating four simple steps thousands of times:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-card p-4 rounded-lg border">
                        <p className="font-semibold text-sm mb-1">1️⃣ Show Examples</p>
                        <p className="text-xs text-muted-foreground">Feed the model a batch of training data (images, text, numbers)</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <p className="font-semibold text-sm mb-1">2️⃣ Make Predictions</p>
                        <p className="text-xs text-muted-foreground">The model guesses an answer for each example</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <p className="font-semibold text-sm mb-1">3️⃣ Check Mistakes</p>
                        <p className="text-xs text-muted-foreground">Compare predictions to correct answers — this is the "loss"</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <p className="font-semibold text-sm mb-1">4️⃣ Improve Weights</p>
                        <p className="text-xs text-muted-foreground">Adjust the network to make fewer mistakes next time</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-card p-5 rounded-xl border-2 border-lime/30">
                      <div className="text-3xl mb-2">🔁</div>
                      <h4 className="font-bold text-base text-lime mb-2">Epochs</h4>
                      <p className="text-xs">One <strong>epoch</strong> = the model sees every example once. More epochs = more practice! Usually 10–100 epochs.</p>
                    </div>
                    <div className="bg-card p-5 rounded-xl border-2 border-cyan/30">
                      <div className="text-3xl mb-2">📦</div>
                      <h4 className="font-bold text-base text-cyan mb-2">Batches</h4>
                      <p className="text-xs">We don't show ALL examples at once. We split them into small <strong>batches</strong> (like 32 images at a time) — it's faster!</p>
                    </div>
                    <div className="bg-card p-5 rounded-xl border-2 border-violet/30">
                      <div className="text-3xl mb-2">🎚️</div>
                      <h4 className="font-bold text-base text-violet mb-2">Learning Rate</h4>
                      <p className="text-xs">Controls how big the adjustments are. Too high = chaotic learning. Too low = painfully slow. Usually 0.001–0.01.</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-pink/10 to-coral/10 p-6 rounded-xl border-2 border-pink/30">
                    <h4 className="font-bold text-lg mb-2">📉 What does "good training" look like?</h4>
                    <p className="text-sm">
                      The <strong>loss</strong> (mistake score) should steadily go DOWN as training progresses.
                      If it goes up or stays flat, something's wrong — maybe the learning rate is too high, or the model needs more data!
                    </p>
                  </div>

                  <p className="text-center text-muted-foreground">
                    Try the Training Simulator below — adjust the learning rate and watch the loss curve! 👇
                  </p>
                </div>
              </CardContent>
            </Card>
            <TrainingSimulator />
          </div>
        )

      case 'loss-and-optimization':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-orange/5 to-coral/5 border-orange/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange to-coral bg-clip-text text-transparent">
                  Loss & Optimization: Learning from Mistakes! 📉
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
                    Imagine learning to throw a ball into a basket. Each throw that misses teaches you something! That's how AI learns too! 🏀
                  </p>

                  <div className="bg-gradient-to-r from-pink/10 to-pink/5 p-6 rounded-xl border-l-4 border-pink">
                    <h4 className="font-bold text-xl text-pink mb-3">📊 What is Loss?</h4>
                    <p className="text-base mb-3">
                      <strong>Loss</strong> is like a "mistake score" - it tells us how wrong the AI's guess was!
                    </p>
                    <div className="bg-card p-4 rounded-lg space-y-2 text-sm">
                      <p>✅ <strong>Low Loss:</strong> The AI is guessing correctly! (Score: 0.05)</p>
                      <p>⚠️ <strong>Medium Loss:</strong> Some mistakes, but learning! (Score: 0.5)</p>
                      <p>❌ <strong>High Loss:</strong> Lots of wrong guesses! (Score: 2.8)</p>
                    </div>
                    <p className="text-sm mt-3 text-muted-foreground">
                      Our goal: Make the loss as small as possible! 🎯
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-cyan/10 to-cyan/5 p-6 rounded-xl border-l-4 border-cyan">
                    <h4 className="font-bold text-xl text-cyan mb-3">⚙️ What is Optimization?</h4>
                    <p className="text-base mb-3">
                      <strong>Optimization</strong> is the process of adjusting the network to reduce loss. Think of it like tuning a guitar! 🎸
                    </p>
                    <div className="bg-card p-4 rounded-lg space-y-3 text-sm">
                      <div>
                        <p className="font-semibold mb-1">1️⃣ Make a Prediction</p>
                        <p className="text-xs text-muted-foreground">The network guesses an answer</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">2️⃣ Calculate Loss</p>
                        <p className="text-xs text-muted-foreground">Compare the guess to the right answer</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">3️⃣ Adjust Weights</p>
                        <p className="text-xs text-muted-foreground">Tweak the network to make better guesses</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">4️⃣ Repeat!</p>
                        <p className="text-xs text-muted-foreground">Do it thousands of times until it's perfect!</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card p-5 rounded-xl border-2 border-lime/30">
                      <h4 className="font-bold text-lg text-lime mb-2">🚀 SGD (Stochastic Gradient Descent)</h4>
                      <p className="text-xs">The classic optimizer! Takes small steps toward the solution, like walking down a hill to find the lowest point.</p>
                    </div>
                    <div className="bg-card p-5 rounded-xl border-2 border-violet/30">
                      <h4 className="font-bold text-lg text-violet mb-2">⚡ Adam (Adaptive Moment)</h4>
                      <p className="text-xs">The smart optimizer! Adjusts its steps automatically - sometimes big steps, sometimes small steps!</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-violet/10 to-primary/10 p-6 rounded-xl border-2 border-violet/30">
                    <h4 className="font-bold text-lg mb-2">💡 Remember:</h4>
                    <p className="text-sm">
                      Every mistake makes the AI smarter! Loss goes DOWN ⬇️ means the AI is learning! The optimizer is like a coach, helping the network improve after every mistake. 🎓
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <OptimizerComparisonVisual />
            <TrainingSimulator />
          </div>
        )

      case 'backpropagation':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-violet/5 to-pink/5 border-violet/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet via-pink to-coral bg-clip-text text-transparent">
                  Backpropagation: Learning Backwards! 🔄
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
                    <strong>Backpropagation</strong> is the secret superpower that lets neural networks learn! It's like playing a game in reverse to figure out where you went wrong. 🕹️
                  </p>

                  <div className="bg-gradient-to-r from-cyan/10 to-secondary/10 p-6 rounded-xl border-2 border-cyan/30">
                    <h4 className="font-bold text-xl mb-3">🎯 The Story of Learning:</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">1️⃣</span>
                        <div>
                          <p className="font-semibold">Forward Pass (Making a Guess)</p>
                          <p className="text-muted-foreground">Data flows from input → hidden layers → output</p>
                          <p className="text-xs italic">Example: Show an image of a cat → Network says "DOG" 🐕 (Oops!)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">2️⃣</span>
                        <div>
                          <p className="font-semibold">Calculate the Mistake</p>
                          <p className="text-muted-foreground">Compare the guess to the real answer</p>
                          <p className="text-xs italic">Example: You said "DOG" but it's actually a "CAT" 🐱 - Loss is HIGH!</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">3️⃣</span>
                        <div>
                          <p className="font-semibold">Backward Pass (The Magic!)</p>
                          <p className="text-muted-foreground">Error flows backward: output → hidden layers → input</p>
                          <p className="text-xs italic">Example: "I was wrong because I didn't look at the whiskers carefully enough!"</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">4️⃣</span>
                        <div>
                          <p className="font-semibold">Update Weights</p>
                          <p className="text-muted-foreground">Adjust each layer to make better guesses next time</p>
                          <p className="text-xs italic">Example: "Next time, I'll pay more attention to whiskers!"</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-xl border-2 border-pink/30">
                    <h4 className="font-bold text-xl text-pink mb-3">🧮 The Math Behind the Magic</h4>
                    <p className="text-base mb-3">
                      Backpropagation uses something called the <strong>"Chain Rule"</strong> from calculus. Don't worry - you don't need to understand the math to use it!
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                      <p>🔗 <strong>Chain Rule:</strong> If A affects B, and B affects C, then we can figure out how A affects C!</p>
                      <p>📊 <strong>Gradient:</strong> Tells us which direction to adjust each weight (up or down)</p>
                      <p>⚡ <strong>Learning Rate:</strong> Controls how big each adjustment is</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-lime/10 to-lime/5 p-5 rounded-xl border-2 border-lime/30">
                      <div className="text-3xl mb-2">✅</div>
                      <h4 className="font-bold text-lg text-lime mb-2">Why It's Amazing:</h4>
                      <ul className="text-xs space-y-1">
                        <li>• Updates millions of weights efficiently</li>
                        <li>• Works for any network architecture</li>
                        <li>• Gets better with each iteration</li>
                        <li>• The foundation of modern AI!</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-orange/10 to-orange/5 p-5 rounded-xl border-2 border-orange/30">
                      <div className="text-3xl mb-2">🎓</div>
                      <h4 className="font-bold text-lg text-orange mb-2">Real-World Analogy:</h4>
                      <p className="text-xs">
                        Imagine you're learning to bake. If your cake is too dry, you work backward: "Was it the oven temp? The baking time? The ingredient ratios?" Then you adjust for next time!
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-violet/10 to-primary/10 p-6 rounded-xl border-2 border-violet/30">
                    <h4 className="font-bold text-lg mb-2">🚀 Fun Fact:</h4>
                    <p className="text-sm">
                      Backpropagation was discovered in the 1980s and revolutionized AI! Before it, training neural networks was almost impossible. Now it's used in everything from self-driving cars to voice assistants! 🎉
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <BackpropVisualizer />
            <NeuralNetworkVisualizer />
          </div>
        )

      case 'build-your-own':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-lime/5 via-cyan/5 to-violet/5 border-lime/30">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-lime via-cyan to-violet bg-clip-text text-transparent">
                  🏆 Build Your Own Neural Network!
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
                    Congratulations! You've learned all the pieces. Now let's put them together and build a complete neural network! 🎉
                  </p>

                  <div className="bg-gradient-to-r from-violet/10 to-primary/10 p-6 rounded-xl border-2 border-violet/30">
                    <h4 className="font-bold text-xl mb-3">📋 Your Neural Network Checklist:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 bg-card p-3 rounded-lg">
                        <span className="text-xl">✅</span>
                        <div className="text-sm">
                          <p className="font-semibold">Step 1: Define Your Problem</p>
                          <p className="text-xs text-muted-foreground">What do you want your AI to learn? (e.g., recognize cats vs dogs)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-card p-3 rounded-lg">
                        <span className="text-xl">✅</span>
                        <div className="text-sm">
                          <p className="font-semibold">Step 2: Prepare Your Data</p>
                          <p className="text-xs text-muted-foreground">Convert your data into tensors that PyTorch can understand</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-card p-3 rounded-lg">
                        <span className="text-xl">✅</span>
                        <div className="text-sm">
                          <p className="font-semibold">Step 3: Design Your Network</p>
                          <p className="text-xs text-muted-foreground">Choose layers, activation functions, and architecture</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-card p-3 rounded-lg">
                        <span className="text-xl">✅</span>
                        <div className="text-sm">
                          <p className="font-semibold">Step 4: Choose Loss & Optimizer</p>
                          <p className="text-xs text-muted-foreground">Pick how you'll measure mistakes and learn from them</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-card p-3 rounded-lg">
                        <span className="text-xl">✅</span>
                        <div className="text-sm">
                          <p className="font-semibold">Step 5: Train Your Model</p>
                          <p className="text-xs text-muted-foreground">Run many epochs and watch the loss decrease!</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-card p-3 rounded-lg">
                        <span className="text-xl">✅</span>
                        <div className="text-sm">
                          <p className="font-semibold">Step 6: Test & Improve</p>
                          <p className="text-xs text-muted-foreground">See how well it works and make it even better!</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-card p-5 rounded-xl border-2 border-pink/30">
                      <div className="text-3xl mb-2">🎨</div>
                      <h4 className="font-bold text-base text-pink mb-2">Image Recognition</h4>
                      <p className="text-xs">Build a network that can tell cats from dogs, or recognize handwritten digits!</p>
                    </div>
                    <div className="bg-card p-5 rounded-xl border-2 border-cyan/30">
                      <div className="text-3xl mb-2">💬</div>
                      <h4 className="font-bold text-base text-cyan mb-2">Text Classification</h4>
                      <p className="text-xs">Create an AI that can tell if a movie review is positive or negative!</p>
                    </div>
                    <div className="bg-card p-5 rounded-xl border-2 border-lime/30">
                      <div className="text-3xl mb-2">📊</div>
                      <h4 className="font-bold text-base text-lime mb-2">Prediction</h4>
                      <p className="text-xs">Build a model that predicts prices, temperatures, or game scores!</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange/10 to-coral/10 p-6 rounded-xl border-2 border-orange/30">
                    <h4 className="font-bold text-lg mb-3">🎓 What You've Learned:</h4>
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-semibold mb-1">🧠 AI Fundamentals</p>
                        <p className="text-muted-foreground">What AI is and how it works</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">📦 Tensors</p>
                        <p className="text-muted-foreground">How data is stored and manipulated</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">🌐 Neural Networks</p>
                        <p className="text-muted-foreground">How layers work together</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">⚡ Activation Functions</p>
                        <p className="text-muted-foreground">How neurons make decisions</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">📉 Training</p>
                        <p className="text-muted-foreground">How models learn from data</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">🔄 Backpropagation</p>
                        <p className="text-muted-foreground">How learning happens backwards</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-violet/15 via-pink/15 via-cyan/15 to-lime/15 p-8 rounded-2xl border-2 border-violet/40 text-center">
                    <div className="text-5xl mb-3">🎉</div>
                    <h4 className="font-bold text-2xl mb-2 bg-gradient-to-r from-violet via-pink via-cyan to-lime bg-clip-text text-transparent">
                      You're Now a PyTorch Explorer!
                    </h4>
                    <p className="text-sm">
                      You have all the tools to start building amazing AI projects. Keep experimenting, keep learning, and most importantly - have fun! The world of AI is waiting for you! 🚀✨
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-6">
              <NeuralNetworkVisualizer />
              <TrainingSimulator />
            </div>
          </div>
        )
      
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">{lesson.title}</h3>
              <div className="prose prose-lg max-w-none space-y-4">
                <p>{lesson.description}</p>
                <p className="text-muted-foreground">
                  This lesson is coming soon with amazing interactive content!
                </p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto px-6 py-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft weight="bold" />
          Back to Lessons
        </Button>
        
        {!isCompleted && (
          <Button
            onClick={onComplete}
            className="gap-2"
          >
            <CheckCircle weight="bold" />
            Mark as Complete
          </Button>
        )}
      </div>

      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl md:text-5xl font-bold mb-3 leading-tight"
        >
          {lesson.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground"
        >
          {lesson.description}
        </motion.p>
      </div>

      {renderLessonContent()}
    </motion.div>
  )
}
