# Planning Guide

A playful, animated learning platform that transforms complex PyTorch concepts into intuitive visual experiences designed specifically for children and beginners.

**Experience Qualities**:
1. **Delightful** - Learning should feel like playing a game, with rewarding animations and colorful visuals that celebrate progress
2. **Intuitive** - Abstract concepts like tensors and neural networks become tangible through interactive visualizations that respond to user input
3. **Progressive** - Content builds naturally from simple ideas to complex concepts, ensuring no learner is left behind

**Complexity Level**: Light Application (multiple features with basic state)
This is a multi-lesson educational platform with progress tracking, interactive animations, and various learning modules. While comprehensive in content, the technical implementation focuses on smooth UX and visual storytelling rather than complex backend systems.

## Essential Features

### Lesson Navigation System
- **Functionality**: Browse and access different PyTorch concept lessons organized by difficulty
- **Purpose**: Provides clear learning path and lets users choose their journey
- **Trigger**: User opens app or completes a lesson
- **Progression**: View lesson cards → Select lesson → Enter lesson detail view → Begin interactive content
- **Success criteria**: Users can easily find and access any lesson, with visual indicators showing completed vs. upcoming content

### Interactive Tensor Playground
- **Functionality**: Visual representation of tensors with ability to manipulate dimensions, values, and see operations in real-time
- **Purpose**: Makes abstract mathematical concepts concrete and playful
- **Trigger**: User enters "What is a Tensor?" lesson
- **Progression**: See animated 1D tensor → Add dimensions with buttons → Watch shape transform → Apply operations (add, multiply) → See results animate
- **Success criteria**: Children can create tensors of different shapes and understand dimensionality through visual feedback

### Neural Network Visualizer
- **Functionality**: Animated visualization of how data flows through neural network layers with adjustable architecture
- **Purpose**: Demystifies how neural networks process information
- **Trigger**: User enters neural network lesson
- **Progression**: Draw/input simple data → Watch data enter network → See activation animations → Observe transformations through layers → View final prediction
- **Success criteria**: Users understand the flow of information and can explain what layers do in their own words

### Training Animation Simulator
- **Functionality**: Interactive visualization of the training loop showing loss decreasing and weights updating
- **Purpose**: Makes the learning process visible and understandable
- **Trigger**: User enters "Training Your First Model" lesson
- **Progression**: Set learning rate → Press "Train" → Watch epochs count up → See loss curve descend → Observe weights adjust → Celebrate when model converges
- **Success criteria**: Users grasp the iterative nature of training and understand key concepts like epochs and loss

### Progress Tracker
- **Functionality**: Persistent storage of completed lessons and achievements
- **Purpose**: Motivates continued learning and provides sense of accomplishment
- **Trigger**: User completes lesson or returns to app
- **Progression**: Complete lesson → Earn badge/star → See progress bar fill → View achievement collection
- **Success criteria**: Progress persists across sessions and encourages users to continue learning

## Edge Case Handling

- **First-Time Users**: Welcome modal with friendly introduction to the platform and suggested starting lesson
- **Incomplete Lessons**: Save progress within lessons so users can resume where they left off
- **Browser Compatibility**: Graceful degradation for browsers that don't support advanced animations
- **Mobile Touch**: All interactions work with touch, not just mouse/keyboard
- **Overwhelmed Learners**: "Hint" and "Explain Like I'm 5" buttons available on complex topics

## Design Direction

The design should evoke wonder, curiosity, and confidence. It should feel like a magical learning space where complex ideas become friendly and approachable. Think playground meets science lab, with vibrant colors, smooth animations, and encouraging feedback that makes learners excited to explore.

## Color Selection

A vibrant, energetic palette inspired by educational toys and modern learning apps, using colors that feel both playful and sophisticated.

- **Primary Color**: Deep Purple `oklch(0.45 0.15 290)` - Represents intelligence and creativity, used for key interactive elements and primary actions
- **Secondary Colors**: 
  - Bright Cyan `oklch(0.70 0.12 210)` - Represents data and flow, used for neural network visualizations
  - Warm Coral `oklch(0.72 0.14 25)` - Represents energy and success, used for completed states and achievements
- **Accent Color**: Electric Yellow `oklch(0.85 0.15 95)` - Attention-grabbing highlight for CTAs, active states, and celebration moments
- **Foreground/Background Pairings**: 
  - Background (Soft Lavender `oklch(0.96 0.02 290)`): Deep Purple text `oklch(0.45 0.15 290)` - Ratio 7.2:1 ✓
  - Primary (Deep Purple): White text `oklch(1 0 0)` - Ratio 8.5:1 ✓
  - Accent (Electric Yellow): Deep Purple text `oklch(0.45 0.15 290)` - Ratio 5.1:1 ✓
  - Card (White `oklch(1 0 0)`): Dark Gray text `oklch(0.25 0 0)` - Ratio 14.8:1 ✓

## Font Selection

Typography should feel modern, friendly, and slightly playful while maintaining excellent readability for younger audiences.

- **Primary Font**: Space Grotesk - A geometric sans-serif that feels both technical and approachable, perfect for educational tech content
- **Code/Technical Font**: JetBrains Mono - For any code snippets, maintaining the technical authenticity of PyTorch learning

- **Typographic Hierarchy**:
  - H1 (Page Titles): Space Grotesk Bold / 42px / -0.02em letter-spacing / 1.1 line-height
  - H2 (Lesson Titles): Space Grotesk Bold / 32px / -0.01em letter-spacing / 1.2 line-height
  - H3 (Section Headers): Space Grotesk SemiBold / 24px / normal letter-spacing / 1.3 line-height
  - Body Text: Space Grotesk Regular / 16px / normal letter-spacing / 1.6 line-height
  - Button Text: Space Grotesk Medium / 15px / normal letter-spacing / 1 line-height
  - Code: JetBrains Mono Regular / 14px / normal letter-spacing / 1.5 line-height

## Animations

Animations serve as both delightful moments and educational tools, making abstract concepts visible. Use physics-based animations with bounce and spring effects for playful interactions (buttons, cards). Data flow animations should be smooth and purposeful, helping users understand transformations. Celebrate achievements with confetti and scale effects. Keep micro-interactions subtle (100-200ms) while making concept visualizations longer and observable (500-1500ms) so learners can follow the logic.

## Component Selection

- **Components**:
  - Cards: For lesson tiles with hover scale effects and gradient backgrounds
  - Buttons: Primary actions with subtle shadow and active press states
  - Progress: For learning journey tracking with animated fills
  - Tabs: For switching between different lesson sections
  - Dialog: For "Explain Like I'm 5" help modals and welcome screens
  - Badge: For achievement indicators and completion markers
  - Scroll Area: For lesson content that may be lengthy

- **Customizations**:
  - Custom Canvas Components: Interactive tensor and neural network visualizations using HTML5 Canvas or SVG
  - Animated Number Counter: For epochs, loss values that count up/down
  - Interactive Slider: For adjusting hyperparameters with real-time visual feedback
  - Confetti Component: Using framer-motion for celebration moments

- **States**:
  - Buttons: Rest has subtle shadow; Hover lifts with increased shadow; Active presses down; Disabled is grayscale with reduced opacity
  - Cards: Rest is flat; Hover elevates and applies glow; Selected has persistent glow and border
  - Inputs/Sliders: Focus shows accent color ring; Dragging shows active value tooltip
  - Lessons: Locked (grayscale with lock icon), Available (full color), In Progress (partial fill indicator), Completed (checkmark and coral background)

- **Icon Selection**:
  - Phosphor Icons throughout for consistency
  - Brain (brain icon) for neural network concepts
  - Cube (cube icon) for tensor representations
  - Lightning (lightning-charge) for training/compute
  - Trophy (trophy) for achievements
  - Play (play) for starting lessons
  - Lock (lock-simple) for locked content
  - Check (check-circle) for completed items

- **Spacing**:
  - Card padding: p-6 (24px)
  - Section gaps: gap-8 (32px) for major sections, gap-4 (16px) for related items
  - Button padding: px-6 py-3 (24px horizontal, 12px vertical)
  - Page margins: max-w-7xl mx-auto px-6 (constrained content with side padding)
  - Grid gaps: gap-6 for lesson grid

- **Mobile**:
  - Lesson grid: 3 columns → 2 columns → 1 column (lg, md, base)
  - Navigation: Horizontal scroll for lesson categories on mobile
  - Canvas interactions: Simplified for touch with larger hit areas
  - Typography: Reduce by 1-2 steps on mobile (H1 42px → 32px)
  - Spacing: Reduce padding/gaps by 25% on mobile (p-6 → p-4)
