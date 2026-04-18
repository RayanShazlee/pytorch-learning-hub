class AudioSynthesizer {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private isEnabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio()
    }
  }

  private initAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.value = 0.15
      this.masterGain.connect(this.audioContext.destination)
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  private ensureAudioContext() {
    if (!this.audioContext || !this.masterGain) return false
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    return true
  }

  playNeuronPulse(activation: number, layerIndex: number, nodeIndex: number) {
    if (!this.isEnabled || !this.ensureAudioContext() || !this.audioContext || !this.masterGain) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const filterNode = this.audioContext.createBiquadFilter()

    const baseFrequency = 300 + (layerIndex * 150)
    const nodeOffset = nodeIndex * 20
    const frequency = baseFrequency + nodeOffset + (activation * 100)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.3, now + 0.05)
    oscillator.frequency.exponentialRampToValueAtTime(frequency, now + 0.15)

    filterNode.type = 'lowpass'
    filterNode.frequency.setValueAtTime(2000 + (activation * 1000), now)
    filterNode.Q.setValueAtTime(1, now)

    const volume = 0.08 + (activation * 0.12)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    oscillator.connect(filterNode)
    filterNode.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start(now)
    oscillator.stop(now + 0.3)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
      filterNode.disconnect()
    }
  }

  playSignalFlow(fromLayer: number, toLayer: number, activation: number) {
    if (!this.isEnabled || !this.ensureAudioContext() || !this.audioContext || !this.masterGain) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const filterNode = this.audioContext.createBiquadFilter()

    const startFrequency = 200 + (fromLayer * 80)
    const endFrequency = 200 + (toLayer * 80)

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(startFrequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + 0.4)

    filterNode.type = 'bandpass'
    filterNode.frequency.setValueAtTime(1000, now)
    filterNode.frequency.linearRampToValueAtTime(2500, now + 0.4)
    filterNode.Q.setValueAtTime(2, now)

    const volume = 0.04 + (activation * 0.06)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.05)
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, now + 0.3)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    oscillator.connect(filterNode)
    filterNode.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start(now)
    oscillator.stop(now + 0.6)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
      filterNode.disconnect()
    }
  }

  playLayerActivation(layerIndex: number, nodeCount: number) {
    if (!this.isEnabled || !this.ensureAudioContext() || !this.audioContext || !this.masterGain) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    const baseFrequency = 400 + (layerIndex * 100)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(baseFrequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * 1.5, now + 0.1)

    const volume = Math.min(0.03 + (nodeCount * 0.008), 0.12)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start(now)
    oscillator.stop(now + 0.35)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  playStartSound() {
    if (!this.isEnabled || !this.ensureAudioContext() || !this.audioContext || !this.masterGain) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(400, now)
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start(now)
    oscillator.stop(now + 0.35)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  playStopSound() {
    if (!this.isEnabled || !this.ensureAudioContext() || !this.audioContext || !this.masterGain) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, now)
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.15)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.03)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start(now)
    oscillator.stop(now + 0.25)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  getEnabled() {
    return this.isEnabled
  }

  cleanup() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
  }
}

export const audioSynthesizer = new AudioSynthesizer()
