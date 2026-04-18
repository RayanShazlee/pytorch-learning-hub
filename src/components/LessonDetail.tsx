import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import type { Lesson } from '@/lib/lessons'
import { TensorVisualizer } from './TensorVisualizer'
import { NeuralNetworkVisualizer } from './NeuralNetworkVisualizer'
import { TrainingSimulator } from './TrainingSimulator'

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
            <Card className="bg-gradient-to-br from-violet/5 to-primary/5 border-violet/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet to-primary bg-clip-text text-transparent">
                  What is Artificial Intelligence?
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
                    <strong>Artificial Intelligence (AI)</strong> is like teaching computers to think and learn, just like you do! 🧠✨
                  </p>
                  <div className="bg-card p-6 rounded-xl space-y-3 border-2 border-violet/20">
                    <h4 className="font-bold text-xl text-violet">How Humans Learn:</h4>
                    <ul className="space-y-2 text-base">
                      <li>👀 You see a cat for the first time</li>
                      <li>🧠 Your brain notices: "It has fur, whiskers, and says meow"</li>
                      <li>📚 Next time you see something similar, you know it's a cat!</li>
                    </ul>
                  </div>
                  <div className="bg-card p-6 rounded-xl space-y-3 border-2 border-primary/20">
                    <h4 className="font-bold text-xl text-primary">How AI Learns:</h4>
                    <ul className="space-y-2 text-base">
                      <li>👁️ We show the computer thousands of cat pictures</li>
                      <li>💻 It finds patterns: "Cats have pointy ears and whiskers"</li>
                      <li>🎯 Now it can recognize cats in new pictures!</li>
                    </ul>
                  </div>
                  <p className="text-lg font-semibold bg-gradient-to-r from-violet via-primary to-cyan bg-clip-text text-transparent">
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
            <Card className="bg-gradient-to-br from-orange/5 to-accent/5 border-orange/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange to-accent bg-clip-text text-transparent">
                  Meet PyTorch - Your AI Building Toolkit! ⚡
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
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
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">Understanding Tensors</h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p>
                    A <strong>tensor</strong> is like a magical container that holds numbers! Think of it like:
                  </p>
                  <ul className="space-y-2">
                    <li>📝 <strong>1D Tensor</strong>: A list of numbers (like your grocery list!)</li>
                    <li>📊 <strong>2D Tensor</strong>: A table of numbers (like a spreadsheet or checkerboard!)</li>
                    <li>📦 <strong>3D Tensor</strong>: Stacked tables (like a stack of papers or video frames!)</li>
                  </ul>
                  <p>
                    In PyTorch, we use tensors to store everything - images, sounds, text, and more!
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
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink to-coral bg-clip-text text-transparent">
                  Tensor Magic: Operations! ✨
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
                    Tensors can do <strong>magical transformations</strong>! Let's learn the most important operations:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card p-5 rounded-xl border-2 border-pink/20">
                      <div className="text-3xl mb-2">➕</div>
                      <h4 className="font-bold text-lg text-pink mb-2">Addition</h4>
                      <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs mb-2">
                        [1, 2, 3] + [4, 5, 6]<br/>
                        = [5, 7, 9]
                      </div>
                      <p className="text-xs">Add numbers in the same position!</p>
                    </div>

                    <div className="bg-card p-5 rounded-xl border-2 border-coral/20">
                      <div className="text-3xl mb-2">✖️</div>
                      <h4 className="font-bold text-lg text-coral mb-2">Multiplication</h4>
                      <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs mb-2">
                        [1, 2, 3] * 2<br/>
                        = [2, 4, 6]
                      </div>
                      <p className="text-xs">Multiply every number by the same value!</p>
                    </div>

                    <div className="bg-card p-5 rounded-xl border-2 border-cyan/20">
                      <div className="text-3xl mb-2">🔄</div>
                      <h4 className="font-bold text-lg text-cyan mb-2">Reshape</h4>
                      <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs mb-2">
                        [1,2,3,4,5,6] → [[1,2,3],[4,5,6]]
                      </div>
                      <p className="text-xs">Change the shape without changing the numbers!</p>
                    </div>

                    <div className="bg-card p-5 rounded-xl border-2 border-lime/20">
                      <div className="text-3xl mb-2">🔗</div>
                      <h4 className="font-bold text-lg text-lime mb-2">Concatenate</h4>
                      <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs mb-2">
                        [1,2] + [3,4]<br/>
                        = [1,2,3,4]
                      </div>
                      <p className="text-xs">Join tensors together end-to-end!</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-violet/10 to-primary/10 p-6 rounded-xl border-2 border-violet/30">
                    <h4 className="font-bold text-lg mb-3">🎯 Why These Operations Matter:</h4>
                    <p className="text-sm">
                      In neural networks, we use these operations millions of times! Each operation transforms the data a little bit, helping the AI learn patterns and make predictions. It's like a recipe where each step brings you closer to the final dish! 👨‍🍳
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'what-is-neural-network':
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">Neural Networks Explained</h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p>
                    A <strong>neural network</strong> is like a team of friends passing a ball! Each friend (neuron) catches the ball, does something with it, and passes it to the next friend.
                  </p>
                  <ul className="space-y-2">
                    <li>🎯 <strong>Input Layer</strong>: Where your data starts (like a picture of a cat)</li>
                    <li>🔄 <strong>Hidden Layers</strong>: Where the magic happens! Each layer finds patterns</li>
                    <li>✨ <strong>Output Layer</strong>: The final answer (like "This is a cat!")</li>
                  </ul>
                  <p>
                    The network learns by adjusting how each neuron processes information!
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
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-coral to-orange bg-clip-text text-transparent">
                  Understanding Neural Network Layers 🏗️
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
                    Think of layers like floors in a building! Information flows from the ground floor up to the top, getting smarter at each level. 🏢
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-cyan/10 to-cyan/5 p-6 rounded-xl border-l-4 border-cyan">
                      <h4 className="font-bold text-xl text-cyan mb-3">🚪 Input Layer (Ground Floor)</h4>
                      <p className="text-base mb-2">This is where your data enters! Like walking into a building.</p>
                      <div className="bg-card p-4 rounded-lg text-sm">
                        <strong>Example:</strong> An image enters here. Each pixel becomes a number that the network can understand!
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-pink/10 to-pink/5 p-6 rounded-xl border-l-4 border-pink">
                      <h4 className="font-bold text-xl text-pink mb-3">🔬 Hidden Layers (Middle Floors)</h4>
                      <p className="text-base mb-2">This is where the magic happens! Each layer looks for different patterns.</p>
                      <div className="bg-card p-4 rounded-lg text-sm space-y-2">
                        <p><strong>Layer 1:</strong> Finds simple edges and lines</p>
                        <p><strong>Layer 2:</strong> Combines edges to find shapes</p>
                        <p><strong>Layer 3:</strong> Combines shapes to recognize objects!</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-lime/10 to-lime/5 p-6 rounded-xl border-l-4 border-lime">
                      <h4 className="font-bold text-xl text-lime mb-3">🎯 Output Layer (Top Floor)</h4>
                      <p className="text-base mb-2">The final answer comes out here!</p>
                      <div className="bg-card p-4 rounded-lg text-sm">
                        <strong>Example:</strong> "This is a cat!" or "This is a dog!" - the network makes its final decision here.
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-violet/10 to-primary/10 p-6 rounded-xl border-2 border-violet/30">
                    <h4 className="font-bold text-lg mb-2">💡 Cool Insight:</h4>
                    <p className="text-sm">
                      More layers = More intelligence! But also = More training time. It's all about finding the right balance! Deep networks (lots of layers) can learn really complex patterns, which is why they're called "Deep Learning"! 🧠✨
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <NeuralNetworkVisualizer />
          </div>
        )

      case 'activation-functions':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-violet/5 to-primary/5 border-violet/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet to-primary bg-clip-text text-transparent">
                  Activation Functions: The Decision Makers! 🎮
                </h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p className="text-lg">
                    <strong>Activation functions</strong> help neurons decide: "Should I get excited and pass this information forward?" Think of them like traffic lights! 🚦
                  </p>

                  <div className="space-y-4">
                    <div className="bg-card p-6 rounded-xl border-2 border-lime/30">
                      <h4 className="font-bold text-xl text-lime mb-3 flex items-center gap-2">
                        <span>⚡</span> ReLU (Most Popular!)
                      </h4>
                      <p className="text-base mb-3">ReLU says: "If it's positive, pass it on! If it's negative, block it!"</p>
                      <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm mb-2">
                        Input: -5 → Output: 0 ❌<br/>
                        Input: 3 → Output: 3 ✅<br/>
                        Input: 10 → Output: 10 ✅
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Why it's cool:</strong> Super simple and super fast! Like a bouncer that only lets positive vibes through! 😎
                      </p>
                    </div>

                    <div className="bg-card p-6 rounded-xl border-2 border-cyan/30">
                      <h4 className="font-bold text-xl text-cyan mb-3 flex items-center gap-2">
                        <span>📊</span> Sigmoid (The Squisher!)
                      </h4>
                      <p className="text-base mb-3">Sigmoid squishes ANY number into a range between 0 and 1!</p>
                      <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm mb-2">
                        Input: -100 → Output: ~0<br/>
                        Input: 0 → Output: 0.5<br/>
                        Input: 100 → Output: ~1
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Why it's cool:</strong> Perfect for answers that need to be "yes or no" - like "Is this a cat?" (0 = no, 1 = yes)
                      </p>
                    </div>

                    <div className="bg-card p-6 rounded-xl border-2 border-pink/30">
                      <h4 className="font-bold text-xl text-pink mb-3 flex items-center gap-2">
                        <span>🌊</span> Tanh (The Balancer!)
                      </h4>
                      <p className="text-base mb-3">Tanh squishes numbers between -1 and 1, keeping things balanced!</p>
                      <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm mb-2">
                        Input: -100 → Output: ~-1<br/>
                        Input: 0 → Output: 0<br/>
                        Input: 100 → Output: ~1
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Why it's cool:</strong> Great for data that can be positive OR negative, like temperature changes!
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange/10 to-coral/10 p-6 rounded-xl border-2 border-orange/30">
                    <h4 className="font-bold text-lg mb-2">🎯 The Big Picture:</h4>
                    <p className="text-sm">
                      Without activation functions, neural networks would just be fancy calculators! Activation functions add the "non-linearity" that lets networks learn complex patterns. They're like the secret sauce that makes AI smart! 🧠✨
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'training-intro':
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">Training Your Model</h3>
                <div className="prose prose-lg max-w-none space-y-4">
                  <p>
                    <strong>Training</strong> is how your AI learns! It's like practicing a sport:
                  </p>
                  <ul className="space-y-2">
                    <li>🎓 <strong>Examples</strong>: You show the AI lots of examples (like showing pictures of cats)</li>
                    <li>🎯 <strong>Guessing</strong>: The AI makes guesses about what it sees</li>
                    <li>📉 <strong>Learning from Mistakes</strong>: It learns from wrong guesses and gets better!</li>
                    <li>🔄 <strong>Epochs</strong>: Each time it looks at all examples is called an "epoch"</li>
                  </ul>
                  <p>
                    The <strong>learning rate</strong> controls how fast the AI learns. Too fast and it might miss important details. Too slow and it takes forever!
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
