/**
 * Per-visual "field guides" — written for humans.
 *
 * Each visual gets an entry. The goal is plain language and vivid
 * analogies first, technical precision second. A curious 12-year-old
 * should get it; a grad student shouldn't feel talked down to.
 */

export type ExplainerEntry = {
  title: string
  oneLine: string
  analogy?: { title: string; body: string }
  readThePicture: { symbol: string; meaning: string }[]
  stepByStep: string[]
  tryThis: string[]
  gotchas: string[]
  mathNote?: { formula: string; plain: string }
  realCode?: string
}

export const VISUAL_EXPLAINERS: Record<string, ExplainerEntry> = {
  // ─── Core math ──────────────────────────────────────────────────────────
  matmul: {
    title: 'Matrix multiplication, one cell at a time',
    oneLine:
      "It looks fancy, but every output number is really just 'multiply these pairs, add them up'. Do that a bunch of times and you've trained a neural network.",
    analogy: {
      title: 'Think of it like a grocery bill',
      body:
        "Row of A = the quantities you bought (2 apples, 3 breads, 1 milk). Column of B = the price of each item ($1.50, $2, $3). Multiply each quantity by its price, add them all up — that's your total, which becomes ONE number in the result. Every cell of the output is just one grocery bill like this.",
    },
    readThePicture: [
      { symbol: 'Pink matrix A', meaning: 'The left side. Think: quantities, or the input coming into a layer.' },
      { symbol: 'Cyan matrix B', meaning: 'The right side. Think: prices, or the learned weights of the layer.' },
      { symbol: 'Violet matrix C', meaning: "The answer. Each cell is one 'total bill' built from one row of A and one column of B." },
      { symbol: 'The pulsing pair', meaning: "The exact two numbers being multiplied right now. That's it. Just one little multiplication at a time." },
      { symbol: 'Shaded row & column', meaning: 'The row and column being zipped together for the current output cell.' },
    ],
    stepByStep: [
      "Pick one cell in the answer. We're about to build that one number.",
      'Grab the matching row from A and the matching column from B — they are the same length.',
      'Zip them together: multiply first-with-first, second-with-second, third-with-third.',
      'Add all those little products into a running total. That total IS the answer for that cell.',
      'Slide to the next cell. Same process. Do this for every cell.',
    ],
    tryThis: [
      "Try a 3×2 times 2×4. Notice the answer is 3×4. The '2' in the middle disappears — it's the thing being summed over.",
      'Pause mid-cell and add the little products yourself. The formula chip below should match exactly.',
      "Big matrices? Same math. GPUs just do millions of these little grocery bills in parallel.",
    ],
    gotchas: [
      'The inner sizes must match. (2×3) · (3×2) works. (2×3) · (4×2) does not — the lengths being zipped would be different.',
      "A @ B is not the same as B @ A. Order matters, like subtracting — 5−3 ≠ 3−5.",
      'If your output shape looks wrong, 9 times out of 10 you multiplied in the wrong order.',
    ],
    mathNote: {
      formula: 'C[i,j] = Σₜ A[i,t] · B[t,j]',
      plain: "For each output cell: zip a row with a column, multiply pairs, add them up. That's the whole operation.",
    },
    realCode: 'y = x @ W    # same as torch.matmul(x, W)',
  },

  convolution: {
    title: 'Convolution — a little window sliding across the picture',
    oneLine:
      "Take a tiny 3×3 stamp, press it down on the image, read a number out of each spot. Slide the stamp one step. Repeat. That's it.",
    analogy: {
      title: 'Think of a flashlight on a painting',
      body:
        "Imagine walking past a painting with a small flashlight. At each spot, the flashlight 'notices' something — maybe an edge, maybe a colour change. You write down what it noticed. Move the flashlight one step. Write again. Do this for the whole painting and you have a map of where that specific thing appears. A CNN uses hundreds of these flashlights, each tuned to notice something different (edges, curves, spots, stripes).",
    },
    readThePicture: [
      { symbol: 'Big grid', meaning: 'The input picture. Each cell is one pixel value.' },
      { symbol: 'Floating 3×3 box', meaning: 'The filter (kernel). Its 9 numbers are what the network learns. Different numbers = different things it notices.' },
      { symbol: 'Preset buttons', meaning: "Hand-designed filters from the pre-deep-learning era: one finds edges, one blurs, one sharpens. Trained networks learn thousands of filters like these automatically." },
      { symbol: 'Output grid', meaning: "A map of 'how strongly did the filter react at each location'. Bright = strong reaction, dark = nothing." },
    ],
    stepByStep: [
      'Put the 3×3 filter on the top-left of the image.',
      'Multiply each filter number with the pixel under it — 9 tiny multiplications.',
      'Add those 9 products into one number. That single number is the output at this spot.',
      'Slide the filter one step right. Do it again.',
      "End of the row? Drop down one step, start from the left. Keep going until you've covered the whole image.",
    ],
    tryThis: [
      "Pick 'edge'. The output is black except where the picture CHANGES — because the filter's numbers cancel out on flat areas.",
      "Pick 'blur'. Details go soft — the filter averages each pixel with its neighbours.",
      'Same filter is used at every position. That weight-sharing is why CNNs can spot a cat anywhere in the picture, not just where they saw it during training.',
    ],
    gotchas: [
      'The output is slightly smaller than the input. If you want them the same size, pad the edges with zeros (this is what `padding="same"` does).',
      'Stack several layers and each output pixel "sees" a bigger chunk of the original image. After 3 layers of 3×3 filters, one output number reflects a 7×7 input patch. This is called the receptive field.',
      "Math textbook convolution flips the filter first; deep-learning 'convolution' actually doesn't flip. Don't be confused — it's still called convolution.",
    ],
    mathNote: {
      formula: 'out[i,j] = Σₐ Σᵦ kernel[a,b] · input[i+a, j+b]',
      plain: 'Grab a patch the size of the filter, multiply matching cells, add them all up. Slide. Repeat.',
    },
    realCode: 'nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3)',
  },

  gradientDescent: {
    title: 'Gradient descent — rolling a ball down a hill',
    oneLine:
      "Training a model is basically this: you're at some spot, look at which way is downhill, take a small step that way, repeat until you stop moving.",
    analogy: {
      title: 'Imagine you are lost in fog on a mountain',
      body:
        "You can't see far, but you can feel which way the ground slopes under your feet. So you take a small step in the downhill direction. Then another. Eventually you reach a valley. That's gradient descent. The 'loss' is your altitude. The 'gradient' is which way is uphill. The 'learning rate' is how big each of your steps is.",
    },
    readThePicture: [
      { symbol: 'The curve', meaning: "The loss as a function of one weight. Height = how wrong the model is. We want to be as low as possible." },
      { symbol: 'The ball', meaning: 'The current value of the weight. Its height is the current loss.' },
      { symbol: 'Red arrow', meaning: 'The slope at the ball. It points uphill. We move the OPPOSITE direction (downhill).' },
      { symbol: 'LR slider', meaning: "How far to step each time. Tiny steps = safe but slow. Huge steps = fast but you might overshoot the valley." },
      { symbol: 'Two valleys', meaning: "One is shallow (a local minimum), the other deeper (the global minimum). Bad luck can leave you stuck in the shallow one." },
    ],
    stepByStep: [
      "Feel the slope where you're standing.",
      'Flip its sign — we want to go down, so walk opposite to the uphill direction.',
      'Multiply by the step size (learning rate).',
      "Move: new_position = old_position − lr × slope.",
      "When the ground feels flat, you've reached a minimum. Stop.",
    ],
    tryThis: [
      "Start on the right with a tiny LR. The ball trickles into the first valley and gets stuck. It doesn't know a better valley exists.",
      'Crank LR up to about 0.3. Now the ball has enough energy to hop over the little hill and find the deeper valley.',
      "Crank LR past 0.8. The ball bounces chaotically and flies off the curve. In real training, this shows up as 'loss: NaN' and ruins your day.",
    ],
    gotchas: [
      "LR too small: training feels stuck. Your loss barely moves. Bump it up.",
      "LR too big: loss explodes and becomes NaN. Drop it by 10×.",
      "Real networks have millions of weights, not one. The 'landscape' is ridiculously high-dimensional. 1-D intuition mostly holds but it can lie about things like saddle points.",
    ],
    mathNote: {
      formula: 'w ← w − η · ∂L/∂w',
      plain: "New weight = old weight minus (step size × slope). That one line is the heart of every optimizer ever made.",
    },
    realCode: 'optimizer = torch.optim.SGD(model.parameters(), lr=0.01)\noptimizer.step()',
  },

  attention: {
    title: 'Attention — every word asking "who here matters to me?"',
    oneLine:
      'Each word looks around the sentence, decides how much every other word matters to it, and mixes together a new version of itself based on those choices.',
    analogy: {
      title: 'Imagine a group meeting',
      body:
        "You're in a meeting deciding something. You look around the room and silently rate how useful each person's opinion is for your specific question. High-rated voices get listened to more, low-rated ones fade into background noise. You mix everyone's opinions together, weighted by how much you trust them on this topic, and that becomes your updated view. Every person in the room does this at the same time. That's attention.",
    },
    readThePicture: [
      { symbol: 'Row of coloured tokens', meaning: 'The sentence. One pill per word.' },
      { symbol: 'Highlighted token', meaning: "The word currently 'asking the question'. Click any other token to switch." },
      { symbol: 'Phase 1 bars (raw scores)', meaning: "How similar each other word is to the question-asker. Bigger bar = more similar." },
      { symbol: 'Phase 2 bars (scaled)', meaning: 'Same scores, shrunk by √(key size). Stops the numbers from getting so huge the math breaks.' },
      { symbol: 'Phase 3 bars (softmax)', meaning: "Scores turned into percentages that add up to 100%. These are the actual 'how much to listen' weights." },
      { symbol: 'Phase 4 mix', meaning: 'The new version of the question-asking word, built by mixing everyone else according to those percentages.' },
    ],
    stepByStep: [
      "Every word makes three copies of itself: a Question version (Query), an Answer version (Key), and a Content version (Value). Three little linear layers do this.",
      "Pick one word. Compare its Question to every other word's Answer by dot-producting them → one similarity score per word.",
      "Divide every score by √(key size) so the math stays stable.",
      'Run softmax over the scores → now they all add up to 1 — these are the attention weights.',
      "Take every word's Content, multiply by its weight, add them all up. That sum is the new version of your word.",
    ],
    tryThis: [
      "Click 'sat'. Which words does it pay most attention to? Usually 'cat' (who sat) and 'mat' (where).",
      "Click 'the'. It attends kind of broadly — common words aren't strongly tied to any specific other word.",
      "A transformer has many 'heads' doing this in parallel with different Q/K/V weights. One head might track grammar, another might track meaning, another might track nearby-ness.",
    ],
    gotchas: [
      "Cost grows with the SQUARE of sentence length. 2× longer input = 4× more work. That's why long-context LLMs are expensive.",
      "Without the √(key size) divide, scores explode, softmax collapses to 'one word gets 100%', and gradients die.",
      "Rows of the attention matrix sum to 1, columns do NOT. Attention is one-directional (I listen to you) not symmetric.",
    ],
    mathNote: {
      formula: 'Attn(Q,K,V) = softmax(Q·Kᵀ / √dₖ) · V',
      plain: 'Score every pair (Q·K), scale, softmax into percentages, use those to mix the Values.',
    },
    realCode: 'torch.nn.functional.scaled_dot_product_attention(q, k, v)',
  },

  softmax: {
    title: "Softmax — turning 'scores' into 'percentages'",
    oneLine:
      'You have raw numbers. You need probabilities that add up to 100%. Softmax is the recipe that converts one into the other.',
    analogy: {
      title: 'Think of votes in a talent show',
      body:
        "Five contestants each have a raw score from a judge. Those scores could be anything — negative, positive, huge. The audience wants to know 'what's the chance each one wins?' Softmax exaggerates the differences (via e^x), then divides by the total so everything sums to 100%. Higher original score → disproportionately bigger chance of winning. A 'temperature' knob lets you decide: do you want a clear favourite, or keep the race open?",
    },
    readThePicture: [
      { symbol: 'Phase 1 — raw logits', meaning: "The scores straight out of the last layer. No rules — they can be any number, positive or negative." },
      { symbol: 'Phase 2 — e^x', meaning: 'Raise e to each score. Negative scores become tiny, positive scores become huge. This exaggerates the gaps between them.' },
      { symbol: 'Phase 3 — sum', meaning: 'Add all those exaggerated values together. This is the total we divide by.' },
      { symbol: 'Phase 4 — probabilities', meaning: "Each exaggerated score divided by the sum. They're all positive and add up to exactly 1.0." },
      { symbol: 'Temperature slider', meaning: 'Divides every score before the exaggeration step. Low T = sharper winner. High T = more of an even race.' },
    ],
    stepByStep: [
      "Start with raw scores. They could be anything: 3.2, -1, 0.7, …",
      'Optionally divide by a temperature T (usually just T=1).',
      'Take e^score for each one. Big scores balloon, small scores shrink toward zero.',
      'Add those e^score values up → Z.',
      'Divide each e^score by Z. Now you have real probabilities.',
    ],
    tryThis: [
      'Set temperature to 0.1. One class shoots up to ~100% — the model is super confident.',
      'Set temperature to 3.0. Everything flattens toward equal odds — the model hedges. This is the knob language models use to get creative instead of boring.',
      "Adding the same constant to every score doesn't change the output. This trick is how libraries keep the math numerically stable.",
    ],
    gotchas: [
      "Huge scores (>700) overflow e^x and give infinity. Libraries subtract the max score first before exponentiating — always.",
      "softmax is NOT argmax. If you just want the winner, use argmax. Use softmax when you need the actual probability distribution (training, sampling).",
      "PyTorch's CrossEntropyLoss already applies softmax internally. If you apply it yourself first, you'll double-softmax and training will be broken.",
    ],
    mathNote: {
      formula: 'pᵢ = exp(xᵢ/T) / Σⱼ exp(xⱼ/T)',
      plain: 'Exaggerate each score (via exp), divide by total. Temperature controls how peaky the result is.',
    },
    realCode: 'probs = torch.softmax(logits, dim=-1)',
  },

  rnn: {
    title: 'RNN — one memory pill, updated word by word',
    oneLine:
      "The network reads one word at a time and keeps a single 'summary so far' vector that it updates after every word.",
    analogy: {
      title: 'Think of reading a book while only remembering one note',
      body:
        "You're reading a book, but you only have one sticky note to write on. After every sentence you rewrite the note with a new summary of everything so far. The old note is gone. That single evolving note is the RNN's hidden state. It's surprisingly powerful for short things, and hopelessly forgetful for long ones — which is why LSTMs and Transformers exist.",
    },
    readThePicture: [
      { symbol: 'The morphing pill', meaning: "The memory (hidden state). Just ONE small vector. Same pill, new values after every word." },
      { symbol: 'Arriving token', meaning: 'The new word being fed in.' },
      { symbol: 'W_hh and W_xh', meaning: 'Two weight matrices: one mixes in the old memory, the other mixes in the new word. Same weights every step.' },
      { symbol: 'tanh squash', meaning: "Keeps the numbers in the pill between -1 and 1 so they don't blow up as you process more words." },
    ],
    stepByStep: [
      'Start with a pill of all zeros (no memory yet).',
      'A word arrives. Mix the old pill with the new word using the two weight matrices.',
      'Add a bias, squash the result with tanh → the pill has new values.',
      'Throw the word away. Its essence is now baked into the pill.',
      'Next word arrives. Same math. Same weights. Different memory.',
    ],
    tryThis: [
      'Step through the sentence once and watch how the pill values shift with each word — it really is a rolling summary.',
      "Imagine a 100-word sentence. By word 100, information from word 1 has been overwritten 99 times. It's mostly gone. That's the 'vanishing memory' problem.",
      "LSTMs and GRUs add 'gates' — little valves that decide what to keep and what to forget. That's the one-sentence reason they exist.",
    ],
    gotchas: [
      'Same weights every step. A 1M-parameter RNN stays 1M parameters whether the sentence is 10 words or 10,000.',
      "Gradients flow backwards through every time step. Long sentences = many multiplications = gradients vanish (or explode).",
      "Can't be parallelised across time: step 5 needs step 4 to finish first. That's a huge reason Transformers replaced RNNs — they process all words at once.",
    ],
    mathNote: {
      formula: 'hₜ = tanh(Wₕₕ · hₜ₋₁ + Wₓₕ · xₜ + b)',
      plain: 'New memory = squash(weight × old memory + weight × new word + bias). Same weights every step.',
    },
    realCode: 'rnn = nn.RNN(input_size=embed_dim, hidden_size=128)\nout, h_n = rnn(x)',
  },

  diffusion: {
    title: 'Diffusion — destroy the image, then learn to un-destroy it',
    oneLine:
      "Add tiny bits of random fuzz to an image over and over until it's pure static. Then train a network to undo ONE tiny bit of fuzz at a time. Running that network in reverse creates images from nothing.",
    analogy: {
      title: 'Think of a Polaroid being slowly smudged',
      body:
        "Imagine smudging a Polaroid photo a little bit every second. After 30 seconds it's unrecognisable grey mush. Now train a friend: 'here's a slightly smudged photo, please guess what the fresh smudge looked like, so I can wipe it off.' Do this tons of times. Eventually, your friend can look at pure grey mush and start wiping smudges off in reverse — until a brand-new photo appears that was never there before.",
    },
    readThePicture: [
      { symbol: '12×12 smiley canvas', meaning: 'A starting clean image. Any grid would work — we use a face because watching it dissolve is intuitive.' },
      { symbol: 'β schedule bar chart', meaning: "How much fuzz to add at each step. Usually small amounts at first, more later." },
      { symbol: 'Forward toggle', meaning: "Runs the destruction: adds fuzz step by step. By the end, it's pure noise." },
      { symbol: 'Reverse toggle', meaning: 'Runs the learned un-destruction: takes a step from noise toward a clean picture. In real life a U-Net predicts the fuzz; here we fake it for the demo.' },
    ],
    stepByStep: [
      'Forward (training): take a clean image, add a scheduled amount of random fuzz → xₜ.',
      'Repeat for T steps. By step T, the image is indistinguishable from pure random noise.',
      'Train a network to look at xₜ and guess what fuzz was just added.',
      'Reverse (generating): start from pure noise. Have the network guess the fuzz. Subtract it. You now have slightly-less-fuzzy noise.',
      "Repeat. After many steps, you've un-fuzzed your way into a brand-new image the network has hallucinated.",
    ],
    tryThis: [
      "Run forward to step 20. The smiley is gone. You couldn't identify it from static.",
      "Run reverse. The smiley slowly re-emerges. Feels magical — but it's just math, step by tiny step.",
      "Slower schedules (more steps, less fuzz per step) usually produce better-quality samples. More steps = more compute. That's the tradeoff.",
    ],
    gotchas: [
      "The fuzz at each step is independent, but the TOTAL accumulated fuzz ᾱₜ is what determines how destroyed the image is at step t.",
      'The network predicts the NOISE, not the clean image. Weird choice, but it gives nicer gradients and works better in practice.',
      "Real diffusion takes 50-1000 reverse steps. That's why it's slower than GANs. Newer tricks (DDIM, consistency models) cut this dramatically.",
    ],
    mathNote: {
      formula: 'xₜ = √ᾱₜ · x₀ + √(1−ᾱₜ) · ε,  ε ~ N(0, I)',
      plain: "Mix the clean image with noise in a precise ratio. The network's job: given this mix, predict the noise part.",
    },
    realCode: 'noise_pred = unet(x_t, t)\nx_prev = scheduler.step(noise_pred, t, x_t)',
  },

  // ─── Higher-level / compound visuals ────────────────────────────────────
  attentionHeatmap: {
    title: "Attention heatmap — everyone's attention, all at once",
    oneLine:
      "The step-by-step attention visual above shows ONE word looking around. This heatmap shows EVERY word's looking-around at the same time, as a grid.",
    analogy: {
      title: 'A seating-chart of eye contact',
      body:
        "Picture a grid where rows are people in a room (who's looking) and columns are also people in the room (who's being looked at). A bright cell means 'this person stared really hard at that person'. A dim cell means barely a glance. Reading one row left-to-right tells you everything about one person's gaze.",
    },
    readThePicture: [
      { symbol: 'Rows', meaning: "Each row is one word doing the looking ('the query')." },
      { symbol: 'Columns', meaning: "Each column is one word being looked at ('the key')." },
      { symbol: 'Cell brightness', meaning: 'The attention weight — how strongly this row looked at this column. Brighter = more attention. Each row adds up to 1.' },
      { symbol: 'Diagonal stripe', meaning: 'Tokens often pay some attention to themselves. Not always. Depends on the layer and the task.' },
    ],
    stepByStep: [
      'Pick any row. It is the complete answer to "where did this word look?"',
      "Scan along the row to find the brightest cell. That's the word it cared about most.",
      "A real transformer has dozens of these heatmaps (one per layer × per head). Different heads end up specialising in different patterns — some track subjects, some track nearby words, some track sentence endings.",
    ],
    tryThis: [
      'Compare this heatmap with the step-by-step attention visual above. A row here should match the bar chart you saw there.',
      'A 12-layer, 12-head model produces 144 of these maps per sentence. Researchers visualise them to understand what the model learned.',
    ],
    gotchas: [
      "Rows sum to 1, columns don't. Attention is one-way, not symmetric.",
      'In GPT-style models the top-right triangle is zero because tokens are forbidden from peeking at future words (causal masking).',
    ],
  },

  cnnFeatureMap: {
    title: 'Feature maps — what each layer of a CNN actually sees',
    oneLine:
      "Early layers see edges and colours. Middle layers see textures and shapes. Deep layers see whole things like 'eye' or 'wheel'. The network builds understanding layer by layer.",
    analogy: {
      title: 'Think of how you describe a face',
      body:
        "You don't start with 'that's Grandma'. Your brain first notices edges (jawline, nose shape), then textures (skin, hair), then parts (eyes, mouth), and only at the end puts it together into 'Grandma'. A CNN does the same progression. Each layer is a step up the abstraction ladder.",
    },
    readThePicture: [
      { symbol: 'Each little grid', meaning: 'One channel at one layer. It shows where THAT channel reacted strongly in the image.' },
      { symbol: 'Bright spots', meaning: 'Places where the filter found what it was looking for.' },
      { symbol: 'Deeper layers (further right)', meaning: 'Each spot represents a much larger area of the original image and a more abstract concept.' },
    ],
    stepByStep: [
      'Layer 1: tiny filters fire on edges at different angles, colour blobs, sharp contrasts.',
      'Layer 2-3: combinations of edges → corners, stripes, textures.',
      'Middle layers: shapes starting to resemble parts — ears, wheels, eyes.',
      'Late layers: near-semantic features — "dog-ness", "car-ness". These are what the classifier head uses to decide the label.',
    ],
    tryThis: [
      'Look at several channels of one layer side by side. Each channel is its own specialist detector.',
      "Deeper = smarter features but smaller picture (pooling keeps shrinking the spatial size while the channel count grows).",
    ],
    gotchas: [
      "A single channel is usually not interpretable on its own. It's the combination across channels that encodes meaning.",
      "Nobody tells a channel what to specialise in. It self-organises during training.",
    ],
  },

  embeddingSpace: {
    title: 'Embeddings — every word gets a spot on an invisible map',
    oneLine:
      'Similar meanings → similar map positions. Subtract two spots and the result points in a meaningful direction ("from man to woman", "from past tense to present tense").',
    analogy: {
      title: 'Imagine a huge library with no labels',
      body:
        'You walk in and place every book on the floor such that books about similar topics end up near each other. Cookbooks in one corner, space books in another, romance somewhere else. No one told you the topics — you just noticed which books tended to talk about the same stuff. An embedding space is that floor, and the points are words instead of books.',
    },
    readThePicture: [
      { symbol: 'Each dot', meaning: 'One word or token, projected from a high-dimensional space down to 2-D so humans can see it.' },
      { symbol: 'Clusters', meaning: 'Words that mean similar things end up close together. "dog", "cat", "puppy" in one area.' },
      { symbol: 'Directions', meaning: 'Some axes capture structure: gender, tense, size. The classic "king - man + woman ≈ queen" trick lives here.' },
    ],
    stepByStep: [
      'Start: each word gets a random vector.',
      'Train the model on a prediction task: next word, or fill-in-the-blank.',
      "Gradient descent nudges the vectors. Words that show up in similar contexts drift closer — that's how the map self-organises.",
      'After training: distance = similarity. Useful for search, clustering, recommendation.',
    ],
    tryThis: [
      'Static embeddings (word2vec) give every word ONE vector. Contextual embeddings (BERT, GPT) give the same word different vectors depending on the sentence — "bank" gets different spots for "river bank" vs "money bank".',
      'Typical embedding size: 128 to 4096 numbers per word. 2-D is just for the drawing — the real space is way bigger.',
    ],
    gotchas: [
      "The 2-D picture loses information. Two dots that look close might not actually be close in the real high-dim space.",
      'Bigger embeddings = more expressive but more memory and more compute.',
    ],
  },

  activationFunction: {
    title: 'Activation functions — the bendy bit that makes networks powerful',
    oneLine:
      "Without activation functions, stacking layers does nothing — it's still just one big matrix multiply. Activations add the bends that let networks fit curves, jumps, and everything in between.",
    analogy: {
      title: 'A straight pipe vs a pipe that can bend',
      body:
        "If all your pipes are straight, no matter how many you connect in series, the whole thing is still straight. But if each pipe can bend at a joint, now you can build any shape. Linear layers are the pipes; activation functions are the joints. Without joints, deep networks are no more powerful than shallow ones.",
    },
    readThePicture: [
      { symbol: 'X axis', meaning: 'The number coming out of the linear layer (before activation).' },
      { symbol: 'Y axis', meaning: 'What the activation turns it into (what gets passed to the next layer).' },
      { symbol: 'Different curves', meaning: 'ReLU = hockey stick. Sigmoid = S-curve 0-to-1. Tanh = S-curve -1-to-1. GELU = smoothed ReLU.' },
    ],
    stepByStep: [
      'Linear layer computes a raw number.',
      "Activation bends it: maybe clips it (ReLU clips negatives to 0), maybe squashes it (sigmoid squashes everything into 0-1).",
      'Bent number flows to the next layer. The shape of the bend determines what the network can learn.',
    ],
    tryThis: [
      'ReLU is the default — dead simple (negative→0, positive→unchanged), fast, and works great for most deep nets.',
      'Sigmoid is for final layers of binary classifiers (output is a probability 0-1).',
      'GELU is the smoother ReLU that Transformers (BERT, GPT) prefer. Slightly better gradients.',
    ],
    gotchas: [
      "Remove all activations and your 20-layer network collapses to a single equivalent linear layer. All the 'depth' becomes useless.",
      'Sigmoid and tanh saturate at the extremes — their slope becomes zero and gradients die. This is why deep nets using them used to be so hard to train.',
    ],
    mathNote: {
      formula: 'ReLU(x) = max(0, x)   •   σ(x) = 1/(1+e⁻ˣ)   •   tanh(x)',
      plain: 'Clip, or squash. Different shapes push networks toward different kinds of solutions.',
    },
  },

  backprop: {
    title: 'Backpropagation — blaming each weight for the mistake',
    oneLine:
      "After the network makes a prediction, we need to figure out: 'how much did each weight contribute to this being wrong?' Backprop is the clever trick that answers this in ONE backward pass instead of millions of guesses.",
    analogy: {
      title: 'Think of a factory where something went wrong',
      body:
        "A factory produces a defective product. The boss wants to know: who's to blame? She starts at the end of the assembly line and works backward, at each station asking 'how much did YOU mess it up?'. Each station looks at what it received, what it did to it, and quantifies its share of the error. That cascaded blame-assignment is backprop. It's just the chain rule applied station by station.",
    },
    readThePicture: [
      { symbol: 'Forward arrows (→)', meaning: 'The prediction flowing through: inputs → layer 1 → layer 2 → ... → loss.' },
      { symbol: 'Backward arrows (←)', meaning: 'The blame flowing back: loss → last layer → earlier layers → ... → input.' },
      { symbol: 'Highlighted weight', meaning: "The weight whose 'share of the blame' is currently being calculated." },
    ],
    stepByStep: [
      "Forward pass: data flows through every layer until you get a prediction and a loss.",
      "Start at the loss. Compute how a tiny wiggle in the last layer's output would change the loss.",
      "Step one layer back. Use the chain rule to figure out: how does a wiggle HERE change the layer in front, which changes the loss?",
      "Keep going back, layer by layer. At each layer, you also get the gradient of the loss with respect to THAT layer's weights.",
      'Those gradients are what the optimizer uses to update weights.',
    ],
    tryThis: [
      "PyTorch builds the whole computation graph as you do the forward pass. `loss.backward()` runs this entire animation for you.",
      "After `loss.backward()`, call `optimizer.step()` to actually apply the updates using those gradients. That's the full update cycle.",
    ],
    gotchas: [
      "Call `optimizer.zero_grad()` before each backward pass, or gradients will accumulate from previous batches and your training will be wrong.",
      "If you detach a tensor with `.detach()`, the blame can't flow through it. That's how you freeze part of a network.",
    ],
    mathNote: {
      formula: '∂L/∂w = ∂L/∂y · ∂y/∂w',
      plain: "How much does this weight affect the loss? It's how much it affects the next thing, times how much that thing affects the loss. Apply recursively.",
    },
  },

  optimizer: {
    title: 'Optimizers — different walking styles down the hill',
    oneLine:
      'Given the same gradient, different optimizers take different-shaped steps. SGD plods straight. Momentum plows through. Adam adjusts step size per-weight automatically.',
    analogy: {
      title: 'Different hikers going down the same mountain',
      body:
        "SGD is the hiker who reads the slope and steps straight downhill. Momentum is the hiker with a rolling ball who uses past steps to build speed through dips. Adam is the adaptive hiker who takes small cautious steps on steep, noisy parts and big confident strides on smooth parts. Same mountain, very different paths and speeds.",
    },
    readThePicture: [
      { symbol: 'Coloured paths', meaning: "Each colour is a different optimizer descending the same loss surface from the same starting point." },
      { symbol: 'Trails', meaning: 'History of their positions. Jagged trails = noisy updates. Smooth trails = damped/averaged updates.' },
    ],
    stepByStep: [
      'SGD: new = old − lr × gradient. Simplest possible step.',
      "Momentum: also keep a running average of recent gradients. Use that instead. Plows through small bumps — like a ball rolling.",
      "Adam: track gradient AND squared gradient averages per weight. Use them to pick a different step size for each weight automatically. Usually just works out of the box.",
      'RMSProp: like Adam without the momentum part. Still adapts step size per weight.',
    ],
    tryThis: [
      "On bumpy losses, Adam often crushes plain SGD — its per-weight step sizes navigate terrain better.",
      "Momentum is the difference between 'stuck oscillating in a narrow valley' and 'smoothly flowing along to the bottom'.",
    ],
    gotchas: [
      'Adam uses extra memory (two extra numbers per weight). Matters for huge models.',
      'For LLMs, AdamW is the go-to — it handles weight decay correctly, unlike vanilla Adam.',
      'Different optimizers can reach different minima even on the same loss. Optimizer choice is not neutral.',
    ],
  },

  layersFlow: {
    title: 'The network as an assembly line',
    oneLine:
      "Data goes in one end, passes through stations that reshape it a bit, and comes out the other end as your prediction. Each station is a layer.",
    analogy: {
      title: 'A car wash',
      body:
        "A dirty car enters. It goes through pre-rinse, soap, scrub, rinse, dry — one station after another. No station does everything; each does one small job. By the end the car is clean. A neural network is exactly this, except the stations reshape tensors instead of washing cars, and the final station outputs a prediction instead of a clean car.",
    },
    readThePicture: [
      { symbol: 'Blocks', meaning: 'Each block is one layer (Linear, Conv, Attention, etc).' },
      { symbol: 'Arrows between blocks', meaning: 'The tensor being passed to the next layer. Shape is usually annotated.' },
      { symbol: 'Final block', meaning: 'The output head — whatever shape your task needs (class scores, image, token IDs).' },
    ],
    stepByStep: [
      'Input arrives — usually a batch of examples.',
      'Each layer takes a tensor in, applies its transformation, passes a new tensor out.',
      'By the final layer, the tensor has the right shape and meaning for your task.',
    ],
    tryThis: [
      "Try mapping each block to one line of PyTorch — in an `nn.Sequential` it really is 1-to-1.",
      'Watch the shapes: Conv reduces spatial size, pooling halves it, flatten collapses to 1-D, Linear changes the feature count.',
    ],
    gotchas: [
      "Shape mismatches are the #1 beginner error. Print `x.shape` between layers — it's free debugging.",
      "Residual connections (ResNet, Transformer) add the input back to the output of a block. Essential for very deep networks, not shown in a straight pipeline like this.",
    ],
  },

  tensor: {
    title: 'Tensors — multi-dimensional arrays of numbers',
    oneLine:
      "Every piece of data in deep learning lives in a tensor. 0D = a single number. 1D = a list. 2D = a spreadsheet. 3D = a stack of spreadsheets. More dimensions = bigger box of numbers.",
    analogy: {
      title: 'Think of nested boxes',
      body:
        "A tensor is a box of numbers. A 1D tensor is one row. A 2D tensor is rows of rows (a grid). A 3D tensor is a grid of grids (like a stack of photos where each photo is itself a grid). 4D images have shape (batch, channels, height, width) = a batch of colour photos. Same concept, more nesting.",
    },
    readThePicture: [
      { symbol: 'The grid', meaning: 'The actual numbers. Colour usually encodes magnitude.' },
      { symbol: 'Shape label', meaning: 'How many dimensions, and how big each one is. Images are usually (batch, channels, height, width).' },
      { symbol: 'dtype', meaning: 'Precision of each number. float32 for training, float16 / bfloat16 for fast inference, int64 for indices.' },
    ],
    stepByStep: [
      'Create a tensor with `torch.tensor([...])` or `torch.randn(shape)`.',
      "Reshape with `.view()` or `.reshape()`. Doesn't copy the data, just reinterprets the layout.",
      "Move to GPU with `.to('cuda')`. Now math runs much faster.",
      "Operate element-wise (+, *, etc) or via ops (matmul, conv).",
    ],
    tryThis: [
      'The four most useful properties: `.shape`, `.dtype`, `.device`, `.requires_grad`. These answer most beginner questions.',
      "Broadcasting lets tensors of different shapes math with each other when the dimensions line up — `(32, 1, 28, 28)` can multiply with `(3, 1, 1)` just fine.",
    ],
    gotchas: [
      "Mixing CPU and GPU tensors throws an error. Move both to the same device before you operate.",
      "Mixing dtypes (float32 + int64) silently makes copies. Keep them consistent.",
    ],
  },

  trainingLoop: {
    title: 'The training loop — four lines that train every model',
    oneLine:
      "Predict. Compute how wrong. Compute blame. Update weights. Repeat a million times. That's the whole loop.",
    analogy: {
      title: 'Learning to throw darts blindfolded',
      body:
        "Throw a dart (predict). Someone tells you how far off you were (loss). You feel your muscles and think about which motions caused the error (backprop). Adjust your form slightly (optimizer step). Throw again. After millions of throws you've learned. That's exactly what training a neural network is.",
    },
    readThePicture: [
      { symbol: 'Loss curve', meaning: 'How wrong the model is over time. Should generally go DOWN.' },
      { symbol: 'Accuracy curve', meaning: 'How often predictions are right. Should generally go UP.' },
      { symbol: 'Train vs validation gap', meaning: "Overfitting meter. Small gap = healthy. Big gap = model's memorising instead of learning." },
    ],
    stepByStep: [
      'Grab a mini-batch of training examples.',
      'Forward pass: `y_pred = model(x)`.',
      'Compare to the truth: `loss = criterion(y_pred, y)`.',
      'Run blame assignment: `loss.backward()`.',
      'Apply the updates: `optimizer.step()` — and zero out gradients for the next batch with `optimizer.zero_grad()`.',
    ],
    tryThis: [
      "Watch the loss curve. Flat = learning rate too small. Exploding = learning rate too large.",
      "If training loss keeps dropping but validation loss starts rising, you're overfitting. Add dropout, weight decay, or more data.",
    ],
    gotchas: [
      "Forgetting `zero_grad()` means gradients accumulate across batches. Your updates become nonsense garbage.",
      "Calling `.backward()` twice on the same graph errors out (unless you pass `retain_graph=True`).",
    ],
  },

  gan: {
    title: 'GANs — a forger and a detective training each other',
    oneLine:
      "One network makes fakes. Another judges if they're real. They improve against each other until fakes are indistinguishable from real.",
    analogy: {
      title: 'A counterfeiter and a bank teller',
      body:
        "A rookie counterfeiter makes fake bills. A bank teller spots them easily at first. The counterfeiter watches which details gave them away and makes better fakes. The teller, now facing better fakes, gets sharper at noticing subtle flaws. They push each other to improve. After enough rounds, the counterfeiter makes bills so good the teller can only guess. That's a trained GAN.",
    },
    readThePicture: [
      { symbol: 'Generator (G)', meaning: 'Takes random noise and outputs a fake sample.' },
      { symbol: 'Discriminator (D)', meaning: 'Takes any sample (real or fake) and outputs a probability that it is real.' },
      { symbol: 'Two loss curves', meaning: "G wants D to be fooled. D wants to stop being fooled. When they're balanced, fakes look real." },
    ],
    stepByStep: [
      'Feed D some real data AND some fakes from G.',
      "Train D to output 1 for real, 0 for fake — it's the judge.",
      'Train G to make D output 1 for its fakes — it wants to fool the judge.',
      'Alternate between training G and D.',
      'Over time, G gets better because D keeps getting better. Both improve.',
    ],
    tryThis: [
      "If D wins too easily (too good at spotting fakes), G stops getting useful feedback and collapses. Careful balance needed.",
      'If G wins too easily, D never provides a useful learning signal.',
    ],
    gotchas: [
      "GANs are notoriously unstable to train. Wasserstein loss + gradient penalty (WGAN-GP) fixes a lot of the pain.",
      "Mode collapse: G learns one really good fake and outputs only that. Diversity-preserving losses fight this.",
    ],
  },

  rl: {
    title: 'Reinforcement learning — learning by trial, error, and rewards',
    oneLine:
      "No labels. An agent tries stuff. Sometimes it gets a reward. It figures out on its own which choices lead to more reward in the long run.",
    analogy: {
      title: 'Training a dog with treats',
      body:
        "You don't hand the dog a manual. You let it try things. When it does something good, treat. When it does something bad, nothing. The dog tries stuff, notices which things lead to treats, and gradually does more of those. That's reinforcement learning. The agent is the dog, the environment is you, the reward is the treat. Except the agent might be an AI playing chess, driving a car, or balancing a portfolio.",
    },
    readThePicture: [
      { symbol: 'Agent', meaning: 'Picks actions based on the current state (via a policy).' },
      { symbol: 'Environment', meaning: 'Responds to actions with a new state and maybe a reward.' },
      { symbol: 'Reward signal', meaning: 'The only supervision. Sparse (only at the end, like chess) or dense (every step, like Atari score).' },
      { symbol: 'Value function', meaning: "Agent's learned estimate of 'how good is this situation', built up over many experiences." },
    ],
    stepByStep: [
      'Agent sees state sₜ.',
      'Picks action aₜ according to its current policy π.',
      'Environment returns new state sₜ₊₁ and reward rₜ.',
      'Update the policy: make rewarded actions more likely; make penalised actions less likely.',
      'Repeat over thousands of episodes. The policy gradually points toward high-reward behaviours.',
    ],
    tryThis: [
      "Watch early episodes — agent mostly acts randomly ('exploration'). Later episodes are almost deterministic ('exploitation').",
      "Sparse rewards (chess: only signal is win/lose at the end) are way harder than dense rewards (Atari: score updates every frame).",
    ],
    gotchas: [
      "Credit assignment: when you finally win chess, WHICH of your 50 moves deserves credit? Discount factor γ controls how far back credit spreads.",
      "Exploration vs exploitation: trying new stuff risks missing known rewards; sticking with known stuff risks never finding better. Every algorithm has its own balance.",
    ],
  },

  classification: {
    title: 'Image classification — from pixels to a label',
    oneLine:
      'An image is just a big grid of numbers. A CNN gradually turns that grid into a probability for each possible label.',
    analogy: {
      title: 'Identifying a fruit in a bag',
      body:
        "You reach into a bag. Your fingers first notice texture (rough? smooth?), then shape (round? long?), then weight and other features. Your brain combines these clues to output a guess: 'apple, 85% confidence'. A CNN does the same progression on pixels. Early layers feel textures and edges, middle layers build shapes, late layers combine everything into a class probability.",
    },
    readThePicture: [
      { symbol: 'Input grid', meaning: 'The raw RGB image. One coloured cell per pixel.' },
      { symbol: 'Grayscale stage', meaning: "Brightness only. 0.30×R + 0.59×G + 0.11×B per pixel — humans see green as brightest, so it's weighted more." },
      { symbol: 'Edges stage', meaning: 'Sobel gradients highlight where brightness changes sharply. Early CNN layers learn filters just like this automatically.' },
      { symbol: 'Output bars', meaning: 'Softmax probabilities over the class vocabulary. Argmax of these = the predicted label.' },
    ],
    stepByStep: [
      'Image → tensor of shape (3, H, W).',
      "Many Conv layers shrink spatial size while growing channel count. By the end, shape is something like (512, H/32, W/32).",
      'Global pool squashes spatial dims → one feature vector per image.',
      'Final Linear layer turns that vector into class scores (logits).',
      'Softmax turns logits into probabilities. Argmax picks the winner.',
    ],
    tryThis: [
      "Try 'detection' — same feature extractor, different head: output boxes + class per box.",
      "Try 'segmentation' — same feature extractor, different head: a class for every single pixel.",
      'Transfer learning: take a backbone pretrained on ImageNet, swap in your custom head, fine-tune. Almost every real-world CV system starts here.',
    ],
    gotchas: [
      "The only real difference between classify / detect / segment is the HEAD. The backbone is the same.",
      "Raw pixels have way too much info. The network's job is to throw away the irrelevant stuff and keep only what matters for the label.",
    ],
  },

  // Fallback for purely decorative visuals
  decorative: {
    title: 'A visual metaphor',
    oneLine: "A gentle, animated picture of what's happening inside a network. Meant to give vibes, not exact numbers.",
    readThePicture: [
      { symbol: 'Moving dots / lines', meaning: 'Activations flowing or neurons firing — in spirit, not to scale.' },
    ],
    stepByStep: [
      'Use this for intuition, not for arithmetic.',
      'The precise math is on the step-by-step visuals on this same page.',
    ],
    tryThis: [
      'Real networks fire thousands of neurons in parallel — not one at a time like the animation suggests.',
    ],
    gotchas: [
      "This is a poster, not a simulator. Don't read specific numbers off of it.",
    ],
  },

  // ─── Phase 2: advanced concepts ──────────────────────────────────────────

  compile: {
    title: 'torch.compile — from interpreted Python to a fused GPU graph',
    oneLine:
      'One decorator (or one function call) captures your model, fuses ops, and generates a fast kernel. 1.3–3× speedup is typical with zero other code changes.',
    analogy: {
      title: 'Think of eager mode as texting one word at a time',
      body:
        'In eager mode, every op is its own tiny phone call from Python to the GPU — hello, matmul please; hello, add please; hello, gelu please. Lots of overhead. torch.compile records the whole recipe once and sends it as a single letter. The GPU reads the whole recipe and runs it flat-out with no interruptions.',
    },
    readThePicture: [
      { symbol: 'Rose boxes', meaning: 'Individual eager-mode ops — each is a separate Python call and CUDA kernel launch.' },
      { symbol: 'Emerald block', meaning: 'The fused graph produced by Dynamo + Inductor. Runs as one optimised kernel.' },
      { symbol: 'Pulse', meaning: 'The compiled kernel executing end-to-end with no Python in the loop.' },
    ],
    stepByStep: [
      'Dynamo traces your Python forward() and builds an FX graph.',
      'Inductor lowers that graph to Triton / C++ and autotunes kernel configs.',
      'The next forward uses the compiled graph directly — no Python overhead.',
      'If inputs change shape, the graph is re-specialised or falls back to eager.',
    ],
    tryThis: [
      'Wrap just your hottest module: model.block = torch.compile(model.block).',
      'Try mode="reduce-overhead" for small batches, mode="max-autotune" for big ones.',
      "First call is slow — that's compilation. Only time the steady-state.",
    ],
    gotchas: [
      'Dynamic shapes can cause recompiles. Use torch._dynamo.config.dynamic_shapes = True if shapes vary.',
      'Side-effectful Python inside forward (prints, random calls, .item()) may trigger graph breaks.',
      'Requires PyTorch ≥ 2.0.',
    ],
    mathNote: {
      formula: 'forward(x) = K_fused(x)   where K_fused = Inductor(FX(trace(forward)))',
      plain: 'Forward becomes a single fused kernel under the hood.',
    },
    realCode: 'model = torch.compile(model)   # that\'s it',
  },

  hooks: {
    title: 'Hooks — listen in on any module',
    oneLine:
      "Register a function that fires whenever data passes through a module — forward for activations, backward for gradients. The cheapest way to see what's actually happening inside.",
    analogy: {
      title: 'Think of a tap on a water pipe',
      body:
        "Your model is a pipeline of layers with data flowing through. A hook is a clear-plastic tap that lets you see (and optionally rewrite) whatever is flowing past — without cutting the pipe or changing the plumbing.",
    },
    readThePicture: [
      { symbol: 'Green dot moving →', meaning: 'Activations flowing forward through the network.' },
      { symbol: 'Amber dot moving ←', meaning: 'Gradients flowing backward.' },
      { symbol: '🔎 fwd hook', meaning: 'Callback fires after forward(). Read activations, save to file, visualise.' },
      { symbol: '✏️ bwd hook', meaning: 'Callback fires during backward(). You can inspect, clip, or replace the gradient.' },
    ],
    stepByStep: [
      'handle = layer.register_forward_hook(lambda m, inp, out: ...)',
      'Every time layer(x) runs, your hook sees (module, inputs, output).',
      'For gradients: register_full_backward_hook sees (module, grad_input, grad_output).',
      "When done, call handle.remove() — forgotten hooks are a classic memory leak.",
    ],
    tryThis: [
      'Extract a feature vector: save the output of a middle layer into a dict keyed by module name.',
      'Sanity-check vanishing gradients: log each layer\'s grad-norm from a backward hook.',
      'Zero out the gradient of a frozen module with a tiny backward hook.',
    ],
    gotchas: [
      'Forgetting to remove hooks piles up callbacks across runs.',
      'Forward hooks fire AFTER the layer runs — if you need the raw input, forward_pre_hook is your friend.',
      "Don't modify activations in-place inside a forward hook — autograd will cry.",
    ],
    realCode: 'h = model.layer3.register_forward_hook(lambda m,i,o: feats.append(o.detach()))',
  },

  gradientCheckpointing: {
    title: 'Gradient checkpointing — swap memory for a little compute',
    oneLine:
      "Instead of storing every activation, keep a few, throw away the rest, and recompute them when backward needs them. ~65% memory saved for ~33% more compute — so you can train a bigger model.",
    analogy: {
      title: 'Think of a long hike',
      body:
        "You could photograph every step of the trail on the way up so the walk back is easy to plan — but your phone runs out of storage. Instead, photograph only every 3rd turn. On the way down, re-walk the small gap to figure out the in-between steps. A bit more walking, way less storage.",
    },
    readThePicture: [
      { symbol: 'Green blocks', meaning: 'Activations kept in memory (checkpoints).' },
      { symbol: 'Grey blocks', meaning: 'Activations freed. When backward reaches them, forward is re-run to rebuild them.' },
      { symbol: 'Cyan bar', meaning: 'Peak activation memory — drops dramatically when checkpointing is on.' },
      { symbol: 'Amber bar', meaning: 'Backward compute — a little higher because of the recompute.' },
    ],
    stepByStep: [
      'Split your model into segments (typically every Transformer block).',
      'Wrap each segment with torch.utils.checkpoint.checkpoint(segment, x).',
      'Forward runs normally but drops intermediate activations.',
      'Backward re-runs the forward for each segment to rebuild what it needs.',
    ],
    tryThis: [
      'Turn it on for the whole backbone first — biggest win.',
      'Use checkpoint_sequential for plain nn.Sequential models.',
      'Combine with AMP + gradient accumulation to fit really large models on a single GPU.',
    ],
    gotchas: [
      "Your segments must be deterministic — randomness (dropout etc.) needs use_reentrant=False or a manual RNG.",
      'BatchNorm running stats get updated twice if you\'re not careful — usually fine, worth knowing.',
      "Not free: each segment's forward runs twice. ~25–33% backward slowdown is typical.",
    ],
    realCode: 'from torch.utils.checkpoint import checkpoint\ny = checkpoint(block, x)',
  },

  amp: {
    title: 'Mixed precision — fast fp16 ops, safe fp32 master weights',
    oneLine:
      'Keep a float32 copy of every parameter. Cast down to float16/bfloat16 for the heavy ops (matmul, conv). Scale the loss so tiny gradients survive the cast back. Same accuracy, much faster.',
    analogy: {
      title: 'Think of drafting vs publishing',
      body:
        "Draft the text quickly in pencil (fp16) — cheap and fast. Keep the master copy in ink (fp32). Whenever you update the master, you carefully read your pencil edits and apply them. You get the speed of pencil with the durability of ink.",
    },
    readThePicture: [
      { symbol: 'Cyan block', meaning: 'fp32 master weights. Never destroyed.' },
      { symbol: 'Amber block', meaning: 'fp16 copies used inside autocast regions.' },
      { symbol: '↔', meaning: 'Weights are cast down for forward, gradients cast back up for the optimizer step.' },
      { symbol: 'Status line', meaning: 'The four phases of an AMP step: autocast fwd → scaled loss → scaled backward → unscale & step.' },
    ],
    stepByStep: [
      'Wrap the forward pass in `with torch.autocast(device, dtype=torch.float16):`.',
      'Compute the loss inside autocast so intermediate tensors are fp16.',
      'scaler.scale(loss).backward() — multiplies the loss so small fp16 gradients survive.',
      'scaler.step(opt) unscales the gradients, applies the update to the fp32 master.',
      'scaler.update() adjusts the scale factor for next iteration.',
    ],
    tryThis: [
      'Switch dtype to bfloat16 on Ampere+ GPUs — no GradScaler needed.',
      'Profile with torch.profiler — matmul/conv should now show as HMMA / bf16 kernels.',
      'Measure memory with torch.cuda.max_memory_allocated() before / after — you should see ~40–50% drop.',
    ],
    gotchas: [
      'Only cast the compute-heavy parts. Reductions and loss computation often stay in fp32 automatically.',
      "If you skip GradScaler in fp16 you'll silently get zero gradients on tiny values.",
      'bf16 has wider range but less precision — test on your task.',
    ],
    realCode: 'with torch.autocast("cuda", dtype=torch.float16):\n    loss = loss_fn(model(x), y)\nscaler.scale(loss).backward()\nscaler.step(opt); scaler.update()',
  },

  ddp: {
    title: 'DistributedDataParallel — everyone trains, then averages',
    oneLine:
      "Launch one process per GPU. Each one processes its own batch, computes local gradients, then the ring all-reduce averages every gradient across every GPU. After that, everyone's weights move together.",
    analogy: {
      title: 'Think of 4 chefs making the same dish',
      body:
        "Each chef cooks their own portion (different ingredients = different batches). Halfway, they all compare notes and average everyone's seasoning adjustments. After the adjustment, every plate has the exact same recipe again — but four times as much food has been cooked.",
    },
    readThePicture: [
      { symbol: '4 circles', meaning: 'One process per GPU. Each holds a full copy of the model.' },
      { symbol: 'Ring edges', meaning: 'The all-reduce ring — gradients flow around and get summed pair-wise.' },
      { symbol: 'Colour cycle', meaning: 'Phases: forward (cyan) → backward (amber) → all-reduce (emerald) → step (violet).' },
    ],
    stepByStep: [
      'Spawn N processes (torchrun --nproc_per_node=N).',
      'Each process calls dist.init_process_group, sets its local device, wraps the model in DDP(...).',
      'A DistributedSampler gives each rank a disjoint shard of the dataset each epoch.',
      'backward() automatically triggers all-reduce on every parameter\'s gradient.',
      'optimizer.step() runs locally — but every rank had the same averaged gradient, so weights stay in sync.',
    ],
    tryThis: [
      'DDP(model, find_unused_parameters=False) unless you have conditional branches.',
      'Use set_epoch on the sampler so shuffle order differs across epochs but stays consistent across ranks.',
      'Gradient accumulation works: wrap the inner steps in model.no_sync() to skip all-reduce until the final sub-step.',
    ],
    gotchas: [
      'All-reduce is synchronous — the slowest GPU pins the whole step. Watch for stragglers.',
      'Don\'t forget DistributedSampler; otherwise every rank trains on the same data.',
      'Effective batch size = per-GPU batch × world_size. Scale learning rate accordingly.',
    ],
    realCode: 'model = DDP(model, device_ids=[local_rank])\nloss.backward()      # triggers all-reduce\nopt.step()',
  },

  fsdp: {
    title: 'Fully Sharded Data Parallel — split the model itself',
    oneLine:
      "Instead of replicating the whole model on every GPU (DDP), slice the parameters, gradients, and optimizer state across all GPUs. Each GPU only holds 1/N of everything at rest — so you can fit a model ~N× bigger.",
    analogy: {
      title: 'Think of a library co-op',
      body:
        "DDP gives every member the entire library. FSDP gives each member one shelf. When you need a book, the co-op briefly pools it; when you're done, everyone puts it back on their own shelf. Same books available, but each member's house stays small.",
    },
    readThePicture: [
      { symbol: 'Left panel (rose)', meaning: 'DDP — every GPU stores every parameter block.' },
      { symbol: 'Right panel (emerald)', meaning: 'FSDP — each GPU owns a vertical slice of the parameter blocks.' },
      { symbol: 'Empty (slate) cells', meaning: 'Parameters NOT stored on that GPU — materialised briefly on demand.' },
    ],
    stepByStep: [
      'Every layer is wrapped in an FSDP unit (usually a Transformer block).',
      'Before that unit runs forward, FSDP all-gathers its shards → full weights on every rank.',
      'The unit runs forward, then the full weights are immediately released.',
      'Same thing happens in reverse during backward.',
      'Gradients and optimizer state are also sharded — so peak memory is ~1/N of DDP.',
    ],
    tryThis: [
      'Use ShardingStrategy.FULL_SHARD for max memory win; HYBRID_SHARD for multi-node.',
      'Turn on CPU offload if you\'re still OOM — optimizer state goes to CPU RAM.',
      'Combine with bf16 autocast + gradient checkpointing for the biggest models.',
    ],
    gotchas: [
      'Save checkpoints with the full_state_dict helpers — sharded state_dicts are not portable.',
      'Comm overhead is higher than DDP — best when GPUs are well-interconnected (NVLink, InfiniBand).',
      'Wrapping granularity matters — too fine wastes comms, too coarse wastes memory.',
    ],
    realCode: 'model = FSDP(model, auto_wrap_policy=transformer_auto_wrap_policy)',
  },

  profiler: {
    title: 'torch.profiler — an X-ray of your training step',
    oneLine:
      'Record every op (CPU, GPU, memory) for a few steps, export a trace, open it in TensorBoard or Chrome. Bottlenecks become obvious once you can see them on a timeline.',
    analogy: {
      title: 'Think of timing a relay race',
      body:
        "Without timing, you just know the team lost. With a stopwatch on each runner and each handoff, you see exactly which runner was slow and where the handoffs wasted time. The profiler does that for every op in your model.",
    },
    readThePicture: [
      { symbol: 'Lane 0 (cyan)', meaning: 'Dataloading — if these bars are wide, your GPU is starving.' },
      { symbol: 'Lane 1 (emerald)', meaning: 'Forward pass ops.' },
      { symbol: 'Lane 2 (amber)', meaning: 'Backward pass ops — usually ~1.5–2× the forward cost.' },
      { symbol: 'Lane 3 (violet)', meaning: 'optimizer.step — should be a tiny sliver.' },
      { symbol: 'Gaps between bars', meaning: 'Idle time. Usually means synchronous transfers or blocking Python.' },
    ],
    stepByStep: [
      'Wrap your step in `with profile(activities=[CPU, CUDA], record_shapes=True) as prof:`.',
      'Use `with record_function("my_label"):` to annotate custom regions.',
      'After a few steps: prof.export_chrome_trace("trace.json").',
      'Open chrome://tracing or the TensorBoard Profiler plugin to see the flame chart.',
    ],
    tryThis: [
      'Is your GPU idle? Increase num_workers, enable pin_memory, prefetch.',
      'One op dominates? Check its shapes — maybe you\'re launching many tiny kernels instead of one big one.',
      'backward much longer than forward? Check for unnecessary autograd tracking in eval code.',
    ],
    gotchas: [
      'Profiling slows things down ~10–20%. Profile a few steps, then turn it off.',
      'Use schedule(wait, warmup, active, repeat) so you\'re not profiling the cold start.',
      'record_shapes=True costs memory but is very useful once.',
    ],
    realCode: 'with profile(activities=[ProfilerActivity.CUDA], record_shapes=True) as prof:\n    for _ in range(5): train_step()\nprof.export_chrome_trace("trace.json")',
  },

  reparam: {
    title: 'Reparameterisation trick — route gradients around the randomness',
    oneLine:
      "You can't differentiate through a random sample. Trick: write z = μ + σ·ε with ε ~ N(0,1). Now the randomness sits in ε (no gradient needed) and the parameters μ, σ can be learned normally.",
    analogy: {
      title: 'Think of throwing a paper airplane',
      body:
        "You can't control a gust of wind (randomness), but you CAN control the angle and speed you throw (μ and σ). If the plane lands in a bad spot, you can still adjust your throw even though the gust was out of your hands. That's exactly what rsample does — it isolates the uncontrollable part so gradients can still reach the parts you control.",
    },
    readThePicture: [
      { symbol: 'Cyan node (μ, σ)', meaning: 'Learned parameters of the distribution.' },
      { symbol: 'Grey node (ε)', meaning: 'External randomness — no gradient passes through it.' },
      { symbol: 'Violet node (z)', meaning: 'The sample — but constructed as μ + σ·ε so gradients can chain to μ, σ.' },
      { symbol: 'Red dashed path', meaning: '.sample() — gradient blocked. You can\'t train anything upstream.' },
      { symbol: 'Green dashed path', meaning: '.rsample() — gradient flows through, lighting up μ and σ.' },
    ],
    stepByStep: [
      'Without the trick: z ~ p(z|μ,σ). Autograd sees a cut — gradient dies.',
      'With the trick: ε ~ fixed noise; z = μ + σ·ε.',
      'Now ∂z/∂μ = 1 and ∂z/∂σ = ε — both well-defined.',
      'Loss can depend on z and still train μ, σ end-to-end.',
    ],
    tryThis: [
      'Build a VAE: encoder outputs (μ, logσ), sample with rsample, decoder reconstructs.',
      'Policy gradient (continuous actions): use Normal(μ(s), σ).rsample() for pathwise derivatives.',
      'Swap .rsample() for .sample() and watch training collapse — the evidence is brutal.',
    ],
    gotchas: [
      'Not every distribution has an rsample (e.g. Categorical). Use Gumbel-Softmax as the differentiable relaxation.',
      'log_prob is always defined — it\'s the score-function estimator path (REINFORCE), which works but has higher variance.',
      "Don't forget to parameterise σ > 0 — usually by predicting log σ and exponentiating.",
    ],
    realCode: 'q = torch.distributions.Normal(mu, sigma)\nz = q.rsample()     # gradient flows to mu, sigma',
  },

  vmap: {
    title: 'vmap — write code for one example, run it on a whole batch',
    oneLine:
      "Express the math for a single input. Wrap the function in vmap and PyTorch automatically vectorises it across the batch dim — no Python loop, no manual reshape, no performance penalty.",
    analogy: {
      title: 'Think of a recipe',
      body:
        "A cookbook tells you how to make ONE serving. For a dinner party, you could cook each serving separately (a Python loop — tedious and slow), or you could scale the recipe to feed everyone at once (vmap — the kitchen does it in one pass).",
    },
    readThePicture: [
      { symbol: 'Left (rose rows flashing)', meaning: 'Python for-loop: each batch element processed sequentially.' },
      { symbol: 'Right (single emerald bar)', meaning: 'vmap: one vectorised kernel handles the whole batch at once.' },
    ],
    stepByStep: [
      'Define model_forward(single_x) — no batch dimension anywhere.',
      'batched = torch.func.vmap(model_forward).',
      'Call batched(batch_x) and you get the stacked output.',
      'Works with grad, jacrev, functional_call — they all compose.',
    ],
    tryThis: [
      'Compute per-example gradients: vmap(grad(loss_fn))(params, x, y).',
      'Efficiently evaluate an ensemble: stack parameter copies, vmap over them.',
      'Jacobians: jacrev(f) if output < input, jacfwd(f) if input < output.',
    ],
    gotchas: [
      'Some in-place ops or data-dependent control flow can\'t be vmapped — torch.func will tell you.',
      'Modules with stateful behaviour (BatchNorm) need functional_call to be safely vmapped.',
      'Don\'t vmap things that already have a batch dim — pick one place to add it.',
    ],
    realCode: 'per_sample_grads = torch.func.vmap(torch.func.grad(loss_fn))(params, x, y)',
  },

  weightInit: {
    title: 'Weight initialisation — why the very first numbers matter',
    oneLine:
      "Too small and activations vanish layer by layer; too big and they explode; all zeros and every neuron computes the same thing. Kaiming (for ReLU) and Xavier (for tanh) are calibrated so variance stays roughly 1 through the network — the neat histograms below.",
    analogy: {
      title: 'Think of passing a ball down a line of people',
      body:
        "If everyone passes it softer than they received it, by person 20 the ball has stopped moving (vanishing). If everyone passes it harder, by person 20 it's supersonic (exploding). Kaiming / Xavier init picks the starting throw strength so, on average, the ball arrives at person 20 with the same energy it left person 1.",
    },
    readThePicture: [
      { symbol: 'Each column', meaning: 'Distribution of activations at one layer right after initialisation.' },
      { symbol: 'Shrinking columns (small normal)', meaning: 'Classic vanishing — by layer 6 most neurons are near zero.' },
      { symbol: 'Single spike (zeros)', meaning: 'All neurons identical — symmetry never breaks.' },
      { symbol: 'Stable bell curves (Kaiming)', meaning: 'What you want: similar spread at every layer.' },
    ],
    stepByStep: [
      'Zeros: weights W=0. forward → all zeros. Gradients all identical. Network can\'t learn.',
      'Small normal (σ≈0.01): forward shrinks geometrically → vanishing grads.',
      'Kaiming: σ = √(2/fan_in). Designed for ReLU. Variance preserved forward and backward.',
      'Xavier (Glorot): σ = √(2/(fan_in + fan_out)). Designed for tanh / sigmoid.',
    ],
    tryThis: [
      'Call model.apply(fn) where fn checks isinstance(m, nn.Linear) and calls init.kaiming_normal_(m.weight, nonlinearity="relu").',
      'Initialise biases to 0 with init.zeros_(m.bias).',
      'For LayerNorm / BatchNorm gain, use init.ones_(m.weight).',
    ],
    gotchas: [
      'PyTorch defaults for nn.Linear are already Kaiming uniform — you only need to customise if you deviate.',
      'Pick the right "nonlinearity" arg — relu, leaky_relu, tanh — it changes the gain.',
      'Residual networks often scale the last layer of each block by a small factor for extra stability.',
    ],
    realCode: 'def init(m):\n    if isinstance(m, nn.Linear):\n        nn.init.kaiming_normal_(m.weight, nonlinearity="relu")\n        nn.init.zeros_(m.bias)\nmodel.apply(init)',
  },

  quantization: {
    title: 'Quantisation — round the weights to int8',
    oneLine:
      "A float32 number costs 32 bits; an int8 costs 8 bits — 4× smaller, 2–3× faster on CPUs with SIMD. The trick is choosing the scale (float-per-bin) so rounding hurts accuracy as little as possible.",
    analogy: {
      title: 'Think of compressing a photo',
      body:
        "A raw photo has millions of colours. A GIF has 256. If you pick 256 wisely, most photos still look fine — and the file is tiny. Quantisation does the same with weights: pick 256 integer levels, snap every weight to the nearest one, use ~4× less storage.",
    },
    readThePicture: [
      { symbol: 'Cyan curve (fp32)', meaning: 'Original weight values, continuous.' },
      { symbol: 'Emerald dots (int8)', meaning: 'Every weight snapped to the nearest of 8 (illustrated) bins.' },
      { symbol: 'Horizontal dashes', meaning: 'The quantisation grid — bins are evenly spaced between min and max.' },
    ],
    stepByStep: [
      'Find the min/max of the weights to compute scale = (max-min)/255 and zero_point.',
      'q = round(w / scale + zero_point), clamped to int8 range.',
      'Dequantise on-demand inside each op: w ≈ scale·(q - zero_point).',
      'Dynamic quant: weights quantised offline, activations quantised on the fly at inference.',
      'Static / QAT: also quantise activations; QAT inserts fake-quant during training so the model learns to be robust.',
    ],
    tryThis: [
      'Dynamic quant, one line: qmodel = torch.quantization.quantize_dynamic(model, {nn.Linear}, dtype=torch.qint8).',
      'Measure size: torch.save(qmodel.state_dict()) should be ~4× smaller.',
      'Benchmark on CPU — the speedup shows up there, not on GPU (FP16 wins on GPU).',
    ],
    gotchas: [
      'Outliers blow up the scale. Use per-channel quantisation for weights and clip activations for robustness.',
      'Accuracy drop is usually 0.5–1%. If bigger, try QAT (quantisation-aware training).',
      'Some ops don\'t have quantised kernels — they fall back to fp32 and eat the speedup.',
    ],
    realCode: 'qm = torch.quantization.quantize_dynamic(m, {nn.Linear}, dtype=torch.qint8)',
  },

  pruning: {
    title: 'Pruning — delete the smallest weights',
    oneLine:
      "A trained network has tons of near-zero weights that barely do anything. Zero them out, briefly retrain, and the network recovers to almost the same accuracy — with a fraction of the parameters.",
    analogy: {
      title: 'Think of editing a novel',
      body:
        "First draft has 150,000 words. Half of them are padding. Highlight the padding in grey, delete it, reread — the story is still there, and the book is half the length. Pruning is exactly that for neural networks.",
    },
    readThePicture: [
      { symbol: 'Green cells', meaning: 'Kept weights. Brightness = magnitude.' },
      { symbol: 'Slate cells', meaning: 'Pruned weights (set to zero).' },
      { symbol: 'Slider', meaning: 'Pruning amount — the percentile below which weights get zeroed.' },
    ],
    stepByStep: [
      'Train the dense model to convergence.',
      'Pick a fraction (e.g. 50%) and a criterion (L1 magnitude).',
      'prune.l1_unstructured(layer, "weight", amount=0.5) zeros the smallest 50%.',
      'Fine-tune briefly — surviving weights compensate.',
      'Optionally repeat in rounds (iterative magnitude pruning).',
    ],
    tryThis: [
      'Try global magnitude pruning: treat all weights together when ranking — often better than per-layer.',
      'Structured pruning (whole channels/heads) gives real speedups; unstructured only helps if the runtime skips zeros.',
      'Combine with quantisation for extra compression.',
    ],
    gotchas: [
      'Unstructured pruning doesn\'t speed up dense GPU matmuls by default — you need a sparsity-aware kernel.',
      'Prune too aggressively without retraining and accuracy collapses.',
      'BatchNorm parameters are tiny — don\'t count them in global ranking.',
    ],
    realCode: 'from torch.nn.utils import prune\nprune.l1_unstructured(layer, name="weight", amount=0.5)',
  },

  customAutograd: {
    title: 'torch.autograd.Function — teach autograd a new move',
    oneLine:
      "If you need a custom gradient (a weird op, a non-differentiable thing you want to back-propagate through, a CUDA kernel you wrote), subclass autograd.Function and provide forward() + backward().",
    analogy: {
      title: 'Think of teaching a dictionary a new word',
      body:
        "Autograd knows a pile of ops and the exact derivative of each. When you use a new op, it doesn't know what to do. autograd.Function is your way of opening the dictionary, writing the new word's entry (forward), and its meaning for differentiation (backward).",
    },
    readThePicture: [
      { symbol: 'Violet box', meaning: 'Your custom Function — a black box to the rest of the graph.' },
      { symbol: 'Green arrows →', meaning: 'forward(): input in, output out. Save any tensors needed for backward.' },
      { symbol: 'Amber arrows ←', meaning: 'backward(): upstream grad in, input gradient out — you write the math.' },
    ],
    stepByStep: [
      'Subclass torch.autograd.Function.',
      'Implement @staticmethod forward(ctx, *inputs) — compute the output; use ctx.save_for_backward to stash anything you\'ll need.',
      'Implement @staticmethod backward(ctx, *grad_outputs) — return the gradient w.r.t. every input (None if non-differentiable).',
      'Call it via MyFn.apply(x) — NOT MyFn.forward(x).',
    ],
    tryThis: [
      'Straight-through estimator: forward returns round(x), backward returns grad_output (pretend it\'s identity).',
      'Wrap a CUDA kernel: forward calls your kernel, backward calls your grad kernel.',
      'Gradient reversal (domain adaptation): forward is identity, backward returns -grad_output.',
    ],
    gotchas: [
      'forward() runs in no-grad mode — save tensors you need explicitly.',
      'Return a tuple of gradients matching every positional input to forward, in order.',
      'Test with torch.autograd.gradcheck(MyFn.apply, (x_double,)) — it catches sign / scale bugs.',
    ],
    realCode: 'class MyFn(torch.autograd.Function):\n    @staticmethod\n    def forward(ctx, x):\n        ctx.save_for_backward(x); return x.pow(3)\n    @staticmethod\n    def backward(ctx, g):\n        (x,) = ctx.saved_tensors; return g * 3 * x.pow(2)',
  },
}
