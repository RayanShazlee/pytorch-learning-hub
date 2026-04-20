/**
 * Catalogue of real-world applications built with PyTorch.
 *
 * Each entry explains:
 *  • WHY PyTorch is a natural fit (so learners understand *why* to learn it, not just
 *    how)
 *  • the concrete domain and representative public projects that prove it works
 *  • the PyTorch building blocks the application rests on, linked to topics already in
 *    the site so the learner can click through and deepen one concept at a time
 *  • a short, runnable-in-spirit starter snippet to anchor intuition
 *
 * The list is curated, not exhaustive — we favour applications where PyTorch is the
 * dominant ecosystem (research → production) and where a learner can reasonably
 * prototype a working toy within a weekend.
 */

export type AppCategory =
  | 'vision'
  | 'language'
  | 'generative'
  | 'audio'
  | 'rl'
  | 'science'
  | 'tabular'
  | 'robotics'
  | 'multimodal'

export interface Application {
  id: string
  name: string
  tagline: string
  category: AppCategory
  /** short "why PyTorch is the right tool for this" pitch */
  whyPyTorch: string
  /** 2–4 concrete public projects or products built with PyTorch */
  examples: string[]
  /** IDs of docTopics that are pre-reqs — lets the chatbot and UI jump users in */
  prerequisiteTopicIds: string[]
  /** the "hello world" of this domain */
  starterSnippet: string
  /** difficulty for a learner starting today */
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  /** rough hardware expectation for a toy version */
  hardware: string
  /** one line a learner can reasonably say "I understood this" about */
  learningGoal: string
}

export const appCategories: Array<{ id: AppCategory; label: string }> = [
  { id: 'vision', label: 'Computer Vision' },
  { id: 'language', label: 'Language & NLP' },
  { id: 'generative', label: 'Generative AI' },
  { id: 'audio', label: 'Audio & Speech' },
  { id: 'rl', label: 'Reinforcement Learning' },
  { id: 'science', label: 'Scientific ML' },
  { id: 'tabular', label: 'Tabular & Recsys' },
  { id: 'robotics', label: 'Robotics & Control' },
  { id: 'multimodal', label: 'Multimodal' },
]

export const applications: Application[] = [
  // ─────────────────────────── VISION ───────────────────────────
  {
    id: 'image-classifier',
    name: 'Image classifier',
    tagline: 'Tell what is in a picture — the "hello world" of deep learning.',
    category: 'vision',
    whyPyTorch:
      'PyTorch + torchvision ships the entire CV research stack: pretrained ResNet/EfficientNet/ViT checkpoints, augmentation transforms, and dataset wrappers. A useful classifier is a 40-line training loop.',
    examples: [
      'Medical X-ray triage (e.g. CheXNet-style lung pathology detection)',
      'Retail product recognition in store shelf photography',
      'Plant-disease apps like PlantVillage',
    ],
    prerequisiteTopicIds: ['tensor-fundamentals', 'nn-module', 'cnn-architectures', 'training-loop', 'loss-functions'],
    difficulty: 'beginner',
    hardware: 'Laptop CPU works for small nets; a single GPU trains ImageNet transfer-learning in minutes.',
    learningGoal: 'Know why convolution + pooling + softmax is enough to map pixels to classes.',
    starterSnippet: `import torch, torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# 1. Grab a pretrained backbone — transfer learning is the 80/20 of CV
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT).eval()

# 2. Replicate the preprocessing the backbone was trained with
preprocess = models.ResNet18_Weights.DEFAULT.transforms()

img = Image.open("cat.jpg").convert("RGB")
x = preprocess(img).unsqueeze(0)           # add batch dim

with torch.no_grad():
    logits = model(x)
    probs = logits.softmax(dim=-1)

top5 = probs.topk(5)
print(top5)`,
  },
  {
    id: 'object-detection',
    name: 'Object detection / segmentation',
    tagline: 'Find where things are, not just what they are.',
    category: 'vision',
    whyPyTorch:
      'torchvision ships pretrained Faster-R-CNN, RetinaNet, Mask-R-CNN and DETR with a uniform API. Fine-tuning on a custom dataset is mostly a data-loading problem.',
    examples: [
      'Autonomous-vehicle perception stacks (lane + car + pedestrian detection)',
      'Drone surveying — counting cars, crops, construction progress',
      'Sports analytics — tracking ball + players across frames',
    ],
    prerequisiteTopicIds: ['cnn-architectures', 'training-loop', 'datasets-dataloaders'],
    difficulty: 'intermediate',
    hardware: 'One modern GPU (8GB+) for fine-tuning; CPU is fine for inference.',
    learningGoal: 'Understand the anchor/box → class-+-offset output format that all detectors share.',
    starterSnippet: `import torch
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.io import read_image
from torchvision.utils import draw_bounding_boxes

model = fasterrcnn_resnet50_fpn(pretrained=True).eval()
img = read_image("street.jpg")
with torch.no_grad():
    pred = model([img.float() / 255])[0]

# boxes, labels, and confidences come out of the same dict
keep = pred["scores"] > 0.7
result = draw_bounding_boxes(img, pred["boxes"][keep], width=3)`,
  },
  {
    id: 'semantic-segmentation',
    name: 'Semantic segmentation',
    tagline: 'Classify every single pixel.',
    category: 'vision',
    whyPyTorch:
      'U-Net, DeepLab, and SAM are all canonical PyTorch implementations. Segmentation is just a pixel-wise cross-entropy loss over a feature-pyramid network.',
    examples: [
      'Medical imaging — tumour/organ boundary delineation',
      'Satellite imagery — land use / deforestation maps',
      'Meta\'s Segment Anything (SAM)',
    ],
    prerequisiteTopicIds: ['cnn-architectures', 'loss-functions'],
    difficulty: 'intermediate',
    hardware: 'Single GPU for 512×512 images; Colab T4 is enough.',
    learningGoal: 'Why an encoder-decoder (U-Net) beats a plain classifier for dense prediction.',
    starterSnippet: `import torch
from torchvision.models.segmentation import deeplabv3_resnet50

m = deeplabv3_resnet50(pretrained=True).eval()
x = torch.randn(1, 3, 520, 520)
with torch.no_grad():
    out = m(x)["out"]     # (1, 21, H, W)
mask = out.argmax(dim=1)  # per-pixel class id`,
  },
  // ─────────────────────────── LANGUAGE ───────────────────────────
  {
    id: 'sentiment-classifier',
    name: 'Sentiment / text classifier',
    tagline: 'Is this review positive, negative, angry, spammy?',
    category: 'language',
    whyPyTorch:
      'HuggingFace transformers is built on PyTorch first. You load a BERT-family model in one line and fine-tune on your CSV in ~100 lines.',
    examples: [
      'Moderation pipelines flagging toxic comments',
      'Customer-support ticket triage / routing',
      'Financial-news sentiment signals for trading models',
    ],
    prerequisiteTopicIds: ['nn-module', 'transformers', 'training-loop', 'loss-functions'],
    difficulty: 'beginner',
    hardware: 'Colab free tier is plenty for DistilBERT fine-tuning.',
    learningGoal: 'See that "tokens → embeddings → transformer → linear head" is the same recipe for every text task.',
    starterSnippet: `import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

name = "distilbert-base-uncased-finetuned-sst-2-english"
tok  = AutoTokenizer.from_pretrained(name)
mdl  = AutoModelForSequenceClassification.from_pretrained(name).eval()

text = "PyTorch makes deep learning feel like writing normal Python."
inp  = tok(text, return_tensors="pt")
with torch.no_grad():
    logits = mdl(**inp).logits
print(["NEG","POS"][logits.argmax(-1).item()])`,
  },
  {
    id: 'chatbot-llm',
    name: 'Chatbot / instruction-following LLM',
    tagline: 'Fine-tune a Llama / Mistral / Gemma on your own domain.',
    category: 'language',
    whyPyTorch:
      'Every open-weight LLM (Llama, Mistral, Gemma, Qwen, Phi) ships in PyTorch weights first. PEFT/LoRA lets you adapt a 7B model on one consumer GPU.',
    examples: [
      'Internal company assistant on top of policy PDFs',
      'Coding copilots fine-tuned on in-house code',
      'Domain-specific medical/legal assistants',
    ],
    prerequisiteTopicIds: ['transformers', 'optimizers', 'training-loop'],
    difficulty: 'advanced',
    hardware: 'LoRA fine-tune of a 7B model needs ≥ 16GB VRAM (A100/3090/4090).',
    learningGoal: 'Understand why *instruction tuning* is a small data + small compute lever on top of a huge pretrained base.',
    starterSnippet: `# LoRA fine-tune sketch (peft + transformers + PyTorch)
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer

base = "mistralai/Mistral-7B-v0.1"
model = AutoModelForCausalLM.from_pretrained(base, torch_dtype="auto")
lora  = LoraConfig(r=8, lora_alpha=16, target_modules=["q_proj","v_proj"])
model = get_peft_model(model, lora)   # only LoRA params are trainable

# ... Trainer with your instruction dataset ...`,
  },
  {
    id: 'rag-search',
    name: 'Retrieval-augmented search (RAG)',
    tagline: 'Ground an LLM in your own documents.',
    category: 'language',
    whyPyTorch:
      'Sentence-transformers and every modern embedding model are PyTorch. Combine a vector store (FAISS/Chroma) with a PyTorch re-ranker for state-of-the-art quality.',
    examples: [
      'Enterprise knowledge assistants over Confluence/SharePoint',
      'Research-paper Q&A (e.g. arXiv semantic search)',
      'Product-manual chatbots',
    ],
    prerequisiteTopicIds: ['transformers', 'nn-module'],
    difficulty: 'intermediate',
    hardware: 'Laptop CPU is enough for modest corpora; GPU only for the re-ranker.',
    learningGoal: 'See that an embedding is just a hidden state — same math as any transformer output.',
    starterSnippet: `from sentence_transformers import SentenceTransformer
import torch

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
docs  = ["PyTorch is a deep learning framework.", "Bananas ripen quickly."]
q     = "What is PyTorch?"

emb_docs = model.encode(docs, convert_to_tensor=True)
emb_q    = model.encode(q,    convert_to_tensor=True)
sims     = torch.nn.functional.cosine_similarity(emb_q.unsqueeze(0), emb_docs)
best     = docs[sims.argmax().item()]
print(best)`,
  },
  // ─────────────────────────── GENERATIVE ───────────────────────────
  {
    id: 'image-generation',
    name: 'Image generation (diffusion)',
    tagline: 'Stable Diffusion-style text → image.',
    category: 'generative',
    whyPyTorch:
      'HuggingFace diffusers and every Stable Diffusion checkpoint are PyTorch. Prompt → image in 10 lines; LoRA-fine-tune a style on one GPU in an evening.',
    examples: [
      'Stable Diffusion, SDXL, Flux (open weights)',
      'Midjourney / DALL-E style image tools',
      'Product mock-ups / advertising concept art pipelines',
    ],
    prerequisiteTopicIds: ['nn-module', 'cnn-architectures', 'autograd-basics'],
    difficulty: 'intermediate',
    hardware: 'Inference: 8GB VRAM (SDXL in half-precision). Fine-tuning a LoRA: ≥ 12GB.',
    learningGoal: 'Grok the "noise → denoise → image" loop and why it is secretly regression.',
    starterSnippet: `from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16
).to("cuda")

img = pipe("a watercolor of a koala riding a skateboard").images[0]
img.save("koala.png")`,
  },
  {
    id: 'gan-faces',
    name: 'GAN — synthetic faces / data',
    tagline: 'Two networks playing a game to generate realistic samples.',
    category: 'generative',
    whyPyTorch:
      'Writing a custom training loop with two optimizers and two losses is where PyTorch\'s flexibility shines compared with higher-level frameworks.',
    examples: [
      'StyleGAN family (NVIDIA)',
      'Synthetic training data for rare classes',
      'Super-resolution (ESRGAN)',
    ],
    prerequisiteTopicIds: ['nn-module', 'autograd-basics', 'optimizers', 'training-loop'],
    difficulty: 'advanced',
    hardware: 'One GPU for toy 64×64 faces; serious GANs need multi-GPU.',
    learningGoal: 'Understand why the adversarial min-max loss yields sharper samples than MSE.',
    starterSnippet: `import torch, torch.nn as nn

G = nn.Sequential(nn.Linear(100, 256), nn.ReLU(), nn.Linear(256, 784), nn.Tanh())
D = nn.Sequential(nn.Linear(784, 256), nn.LeakyReLU(0.2), nn.Linear(256, 1))
bce = nn.BCEWithLogitsLoss()

z   = torch.randn(64, 100)
fake = G(z)
real = torch.randn(64, 784)
# In a real loop you alternate: minimise D loss, then minimise G loss.
print(fake.shape, D(fake).shape)`,
  },
  {
    id: 'music-generation',
    name: 'Audio / music generation',
    tagline: 'Text-to-music (MusicGen), voice cloning (Bark), drum continuation.',
    category: 'audio',
    whyPyTorch:
      'torchaudio + HuggingFace audio models (Whisper, MusicGen, SpeechT5, Bark) are all PyTorch. Audio becomes tensors, then you are back on familiar ground.',
    examples: ["Meta's MusicGen", 'OpenAI Whisper (speech-to-text)', 'Suno / ElevenLabs-style voice synthesis'],
    prerequisiteTopicIds: ['transformers', 'nn-module'],
    difficulty: 'intermediate',
    hardware: 'Inference: 8GB VRAM; generation is slower than images.',
    learningGoal: 'See that audio is just a long 1-D tensor — the same transformer tools apply.',
    starterSnippet: `from transformers import AutoProcessor, MusicgenForConditionalGeneration
import torch

proc  = AutoProcessor.from_pretrained("facebook/musicgen-small")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")

inputs = proc(text=["happy upbeat lofi hip-hop"], return_tensors="pt")
with torch.no_grad():
    audio = model.generate(**inputs, max_new_tokens=256)   # (1, 1, T)
print(audio.shape)`,
  },
  // ─────────────────────────── AUDIO ───────────────────────────
  {
    id: 'speech-to-text',
    name: 'Speech-to-text / ASR',
    tagline: 'Transcribe meetings, podcasts, phone calls.',
    category: 'audio',
    whyPyTorch:
      "OpenAI Whisper is PyTorch and open-weight. torchaudio supplies spectrograms, MFCCs and resampling on the GPU.",
    examples: ['YouTube auto-captions', 'Otter.ai / Zoom transcription', 'Accessibility tools for the hearing-impaired'],
    prerequisiteTopicIds: ['transformers', 'rnn-lstm'],
    difficulty: 'intermediate',
    hardware: 'Whisper-small runs on CPU in near-real-time.',
    learningGoal: 'Learn the mel-spectrogram → encoder → decoder pipeline shared by most ASR systems.',
    starterSnippet: `import whisper  # pip install -U openai-whisper

model = whisper.load_model("base")
result = model.transcribe("meeting.wav")
print(result["text"])`,
  },
  // ─────────────────────────── RL ───────────────────────────
  {
    id: 'game-rl-agent',
    name: 'Reinforcement-learning agent',
    tagline: 'Teach a neural net to play Atari, Go, or trade.',
    category: 'rl',
    whyPyTorch:
      'Stable-Baselines3, CleanRL and Tianshou are the de facto RL stacks and are all PyTorch. Custom losses — exactly where PyTorch wins.',
    examples: ['DeepMind AlphaZero / MuZero', 'Self-driving simulation agents', 'Trading-bot RL prototypes'],
    prerequisiteTopicIds: ['nn-module', 'optimizers', 'autograd-basics'],
    difficulty: 'advanced',
    hardware: 'CPU for classic control; one GPU for Atari DQN; clusters for MuZero-scale.',
    learningGoal: 'Derive a policy gradient update and watch the agent improve sample by sample.',
    starterSnippet: `import torch, torch.nn as nn
import gymnasium as gym

env = gym.make("CartPole-v1")
policy = nn.Sequential(nn.Linear(4, 64), nn.ReLU(), nn.Linear(64, 2))
opt = torch.optim.Adam(policy.parameters(), lr=1e-3)

obs, _ = env.reset()
logits = policy(torch.tensor(obs).float())
action = torch.distributions.Categorical(logits=logits).sample().item()
next_obs, reward, done, trunc, _ = env.step(action)
# Real training: compute REINFORCE / PPO loss on collected trajectories.`,
  },
  // ─────────────────────────── SCIENCE ───────────────────────────
  {
    id: 'protein-folding',
    name: 'Protein structure / biology models',
    tagline: 'AlphaFold-style 3D structure prediction, drug discovery.',
    category: 'science',
    whyPyTorch:
      'OpenFold, ESM, Boltz-1 are all PyTorch. Custom architectures with exotic attention masks are where dynamic graphs shine.',
    examples: ['DeepMind AlphaFold 2/3', "Meta's ESM-2 protein language model", 'Drug-target binding prediction pipelines'],
    prerequisiteTopicIds: ['transformers', 'autograd-basics'],
    difficulty: 'advanced',
    hardware: 'Inference on ESM-2: modern GPU with ≥ 16GB.',
    learningGoal: 'Understand why sequence models generalise from natural language to biology.',
    starterSnippet: `import torch
from transformers import AutoTokenizer, AutoModel

name = "facebook/esm2_t6_8M_UR50D"
tok  = AutoTokenizer.from_pretrained(name)
mdl  = AutoModel.from_pretrained(name).eval()

seq  = "MKTFFVAGNWKMNKTLSE"
x    = tok(seq, return_tensors="pt")
with torch.no_grad():
    h = mdl(**x).last_hidden_state   # (1, L, 320) embeddings per residue
print(h.shape)`,
  },
  {
    id: 'physics-simulation',
    name: 'Physics-informed / scientific ML',
    tagline: 'Learn PDE solvers, turbulence models, weather.',
    category: 'science',
    whyPyTorch:
      'Custom differentiable losses (physics residuals, conservation laws) are trivial in PyTorch because the whole computation is a differentiable program.',
    examples: ['GraphCast weather forecasting (DeepMind)', 'Neural ODE / physics-informed neural networks', 'Climate surrogate models'],
    prerequisiteTopicIds: ['autograd-basics', 'nn-module'],
    difficulty: 'advanced',
    hardware: 'GPU helpful but small PINNs run on CPU.',
    learningGoal: 'See that "loss = data error + physics residual" lets a network obey conservation laws.',
    starterSnippet: `# Physics-informed NN (PINN) for u'(x) = cos(x), u(0)=0
import torch, torch.nn as nn
net = nn.Sequential(nn.Linear(1,32), nn.Tanh(), nn.Linear(32,1))
opt = torch.optim.Adam(net.parameters(), lr=1e-3)

for step in range(2000):
    x = torch.rand(64,1, requires_grad=True)
    u = net(x)
    du = torch.autograd.grad(u, x, torch.ones_like(u), create_graph=True)[0]
    ic = net(torch.zeros(1,1))
    loss = ((du - torch.cos(x))**2).mean() + ic.pow(2).mean()
    opt.zero_grad(); loss.backward(); opt.step()`,
  },
  // ─────────────────────────── TABULAR / RECSYS ───────────────────────────
  {
    id: 'recommender',
    name: 'Recommender system',
    tagline: 'Netflix / Spotify / e-commerce ranking.',
    category: 'tabular',
    whyPyTorch:
      'TorchRec (Meta) and every two-tower / transformer-rec paper ships as PyTorch code. Embedding tables of billions of rows are a first-class citizen.',
    examples: ['Meta\'s Reels / Instagram ranking', 'YouTube video recommendations', 'Amazon product ranking'],
    prerequisiteTopicIds: ['nn-module', 'loss-functions', 'training-loop'],
    difficulty: 'intermediate',
    hardware: 'Toy MovieLens on CPU; production systems run on many GPUs.',
    learningGoal: 'Understand why "learned embeddings + dot product" beats collaborative filtering.',
    starterSnippet: `import torch, torch.nn as nn

class TwoTower(nn.Module):
    def __init__(self, n_users, n_items, d=32):
        super().__init__()
        self.user = nn.Embedding(n_users, d)
        self.item = nn.Embedding(n_items, d)
    def forward(self, u, i):
        return (self.user(u) * self.item(i)).sum(-1)

model = TwoTower(10_000, 50_000)
score = model(torch.tensor([0,1,2]), torch.tensor([42,7,9]))`,
  },
  // ─────────────────────────── ROBOTICS ───────────────────────────
  {
    id: 'robot-policy',
    name: 'Robot manipulation / control policy',
    tagline: 'Vision → action models (Diffusion-Policy, RT-X, ALOHA).',
    category: 'robotics',
    whyPyTorch:
      'The entire robot-learning research ecosystem (Isaac Lab, RoboHive, LeRobot) is PyTorch. Train in sim, deploy via TorchScript.',
    examples: ['Tesla self-driving perception/planning stack', 'DeepMind RT-2', 'Covariant / warehouse picking robots'],
    prerequisiteTopicIds: ['cnn-architectures', 'rnn-lstm', 'transformers'],
    difficulty: 'advanced',
    hardware: 'Sim on single GPU; real robots vary.',
    learningGoal: 'See that a robot policy is just "observation tensor → action tensor" with extra data pipelines.',
    starterSnippet: `# Behaviour cloning: map camera image to joint velocities
import torch, torch.nn as nn

class Policy(nn.Module):
    def __init__(self, n_joints=7):
        super().__init__()
        self.vision = nn.Sequential(
            nn.Conv2d(3, 32, 3, 2), nn.ReLU(),
            nn.Conv2d(32, 64, 3, 2), nn.ReLU(),
            nn.AdaptiveAvgPool2d(1), nn.Flatten(),
        )
        self.head = nn.Linear(64, n_joints)
    def forward(self, img):
        return self.head(self.vision(img))

pi = Policy()
pi(torch.randn(1, 3, 96, 96))  # predicted 7-DOF velocity`,
  },
  // ─────────────────────────── MULTIMODAL ───────────────────────────
  {
    id: 'vlm',
    name: 'Vision-language model (VLM)',
    tagline: 'Ask questions about an image (LLaVA, CLIP, GPT-4V style).',
    category: 'multimodal',
    whyPyTorch:
      'CLIP / SigLIP / LLaVA / InternVL all ship as PyTorch weights. Combining a vision encoder with an LLM decoder is a handful of PyTorch modules glued together.',
    examples: ['OpenAI CLIP, Google SigLIP', 'LLaVA / InternVL / Qwen-VL', 'Image search by natural-language query'],
    prerequisiteTopicIds: ['transformers', 'cnn-architectures'],
    difficulty: 'intermediate',
    hardware: 'CLIP inference: any laptop GPU.',
    learningGoal: 'See how contrastive training aligns image embeddings with text embeddings in one shared space.',
    starterSnippet: `import torch, clip, PIL.Image as Image

model, preprocess = clip.load("ViT-B/32")
img = preprocess(Image.open("cat.jpg")).unsqueeze(0)
text = clip.tokenize(["a cat", "a dog", "a rocket"])
with torch.no_grad():
    probs = (model.encode_image(img) @ model.encode_text(text).T).softmax(-1)
print(probs)   # most of the mass on "a cat"`,
  },
]

/**
 * Why should someone choose PyTorch over the alternatives? These are the answers the
 * chatbot reaches for when a learner asks the *motivation* questions ("why learn
 * this?", "PyTorch vs TensorFlow", etc.). Keep them crisp and honest.
 */
export const pytorchMotivation = [
  {
    claim: 'Research-to-production is the same code.',
    detail:
      'Most new papers drop their reference code in PyTorch first. Learning PyTorch means you can read and run the state of the art the week it is published — you are not waiting for someone to port it.',
  },
  {
    claim: 'The API feels like NumPy, not a config file.',
    detail:
      'Dynamic graphs mean you can print tensors, set breakpoints, and write plain Python control flow. Debugging a model is debugging normal code.',
  },
  {
    claim: 'You own the training loop.',
    detail:
      'Once you understand forward → loss → backward → step, you can build ANY training regimen — GANs with two optimizers, curriculum learning, custom losses, reinforcement learning. You are not boxed into someone else\'s Trainer class.',
  },
  {
    claim: 'The ecosystem is enormous and open.',
    detail:
      'torchvision, torchaudio, torchtext, HuggingFace transformers/diffusers, Lightning, TorchRec, Stable-Baselines3, AllenNLP, MONAI, PyG… nearly every vertical has a first-class PyTorch library.',
  },
  {
    claim: 'Careers follow it.',
    detail:
      'Meta, Tesla, OpenAI, Anthropic, Stability, NVIDIA research, DeepMind (alongside JAX), and most startups build on PyTorch. Job listings mentioning "PyTorch" have outnumbered "TensorFlow" since 2022.',
  },
  {
    claim: "It teaches the concepts, not the framework.",
    detail:
      'The tensor / autograd / nn.Module abstractions mirror how deep learning actually works mathematically. Skills you build here transfer straight to JAX, MLX, Triton, or whatever comes next.',
  },
]
