class Snare {
  constructor() {
    // Initialize with default parameters
    this.setRandomSnareParameters();

    // Connect to globalControls
    window.updateSnareVolume = this.updateVolume.bind(this);
    window.updateSnareControls = this.updateGlobalControls.bind(this);

    // Set initial volume using the updateVolume function
    this.updateVolume();
  }
 
  // Function to set random snare parameters
  setRandomSnareParameters() {
    const attack = this.randomInRange(0.001, 0.01);
    const decay = this.randomInRange(0.01, 0.1);
    const sustain = this.randomInRange(0.001, 0.01);
    const release = this.randomInRange(0.001, 0.02);
    const pitch = this.randomInRange(-12, 12);
    const filterFrequency = this.randomInRange(1000, 5000); 
    const filterQ = this.randomInRange(1, 5); 
    const noiseType = Math.random() < 0.5 ? 'white' : 'pink'; // Randomly choose between white and pink noise
    const modulationIndex = this.randomInRange(5, 20); 

    const envelope = {
      attack: attack || 0.001,
      decay: decay || 0.01,
      sustain: sustain || 0,
      release: release || 0.02,
    };

    this.synth = new Tone.NoiseSynth({
      envelope: envelope,
      filter: {
        type: 'lowpass',
        frequency: filterFrequency,
        Q: filterQ,
      },
      filterEnvelope: {
        attack: 0.001,
        decay: 0.02,
        sustain: 0,
      },
      noise: {
        type: noiseType,
      },
      modulationIndex: modulationIndex,
      // Do not set volume here
    }).toDestination();

    this.synth.pitch = pitch;
  }

  // Function to trigger attack and release of the snare
  triggerAttackRelease(time) {
    if (this.synth) {
      this.synth.triggerAttackRelease("8n", time);
    }
  }

  // Function to generate a random number within a specified range
  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Function to update volume based on global controls
  updateVolume() {
    if (this.synth) {
      this.synth.volume.value = globalControls.volumes.snare;
    }
  }

  // Function to update global controls
  updateGlobalControls(newControls) {
    if (this.synth) {
      this.synth.dispose();
    }
    Object.assign(this, newControls);
    this.setRandomSnareParameters();
    this.updateVolume();
    if (this.synth) {
      this.synth = new Tone.NoiseSynth({
        envelope: this.synth.envelope,
        filter: this.synth.filter,
        filterEnvelope: this.synth.filterEnvelope,
        noise: this.synth.noise,
        modulationIndex: this.synth.modulationIndex,
      }).toDestination();
    }
  }
}

// Create an instance of the Snare class
const snare = new Snare();

// Drum beat pattern for snare
const snarePattern = new Tone.Pattern((time, note) => {
  if (note !== null) {
    snare.triggerAttackRelease(time);
  }
}, [null, "C2"]).start(0);

// Export the snare instance for use in other files
window.snare = snare;

// Connect to controlPanel
window.updateSnareControlsPanel = (newControls) => {
  snare.updateGlobalControls(newControls);
};
