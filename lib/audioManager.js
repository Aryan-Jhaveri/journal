/**
 * Audio Manager Module
 * Handles synthesized sound effects and haptic feedback
 */

const AudioManager = {
    audioContext: null,
    isInitialized: false,
    buffer: null,

    /**
     * Initialize the Audio Context
     * Note: Must be resumed by user interaction
     */
    init() {
        const settings = JOURNAL_SETTINGS;
        if (!settings.audio?.enabled) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                this.generatePaperSound(); // Pre-generate the buffer

                // Add interaction listeners to unlock audio
                ['click', 'touchstart', 'keydown'].forEach(event => {
                    document.addEventListener(event, () => this.resumeContext(), { once: true });
                });

                console.log("AudioManager initialized (waiting for interaction)");
            }
        } catch (e) {
            console.warn("Web Audio API not supported", e);
        }
    },

    /**
     * Resume AudioContext on first user interaction
     */
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log("AudioContext resumed");
                this.isInitialized = true;
            });
        } else {
            this.isInitialized = true;
        }
    },

    /**
     * Generate a white noise buffer for the paper sound
     */
    generatePaperSound() {
        if (!this.audioContext) return;

        const duration = 0.5; // seconds
        const sampleRate = this.audioContext.sampleRate;
        const frameCount = sampleRate * duration;

        this.buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
        const data = this.buffer.getChannelData(0);

        // Fill with white noise
        for (let i = 0; i < frameCount; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    },

    /**
     * Play the page flip sound effect
     * Synthesizes a "swoosh" using filtered noise
     */
    playFlipSound() {
        const settings = JOURNAL_SETTINGS;
        if (!settings.audio?.enabled || !this.audioContext || !this.buffer) return;

        // Auto-resume if needed (fallback)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const t = this.audioContext.currentTime;
        const source = this.audioContext.createBufferSource();
        source.buffer = this.buffer;

        // Bandpass Filter to shape the noise into a "page" sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 1;

        // Gain (Volume) Envelope
        const gainNode = this.audioContext.createGain();

        // Randomize pitch/rate slightly for variety
        const variance = settings.audio.pitchVariation || 0.1;
        const rate = 1.0 + (Math.random() * variance * 2 - variance);
        source.playbackRate.value = rate;

        // Connect graph
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Sound Envelope: Swoosh
        // Filter Sweep: Low -> High -> Low allows for "swish" effect
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
        filter.frequency.exponentialRampToValueAtTime(300, t + 0.3);

        // Volume Envelope: Fade in -> Burst -> Fade out
        const vol = settings.audio.volume || 0.5;
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(vol, t + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3); // Decay

        source.start(t);
        source.stop(t + 0.4);

        if (settings.debug?.logAudio) console.log("Playing flip sound");
    },

    /**
     * Trigger Haptic Feedback
     */
    triggerHaptic() {
        const settings = JOURNAL_SETTINGS;
        if (!settings.haptics?.enabled) return;

        if (typeof navigator.vibrate === 'function') {
            const duration = settings.haptics.duration || 20;
            navigator.vibrate(duration);
            if (settings.debug?.logAudio) console.log("Haptic triggered");
        }
    }
};
