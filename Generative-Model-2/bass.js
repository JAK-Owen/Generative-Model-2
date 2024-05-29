class Bass {
  constructor(volume, key) {
    this.params = this.generateRandomBassParams();
    this.synth = new Tone.MembraneSynth({
      ...this.params,
      volume: volume + globalControls.volumes.bass,
      polyphony: 1,
    }); 
 
    // Add a low-pass filter with a cutoff frequency of 50Hz
    this.lowPassFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 50,
    });

    // Connect the synth to the low-pass filter and then to the destination
    this.synth.connect(this.lowPassFilter);
    this.lowPassFilter.toDestination();
  }

  generateRandomBassParams() {
    const minPitch = Tone.Frequency(`${globalControls.globalKey}1`).toMidi();
    const maxPitch = Tone.Frequency(`${globalControls.globalKey}3`).toMidi();

    return {
      octaves: Math.floor(Math.random() * 2) + 3,
      oscillator: { type: this.randomOscillatorType() },
      envelope: {
        attack: Math.random() * 0.2 + 1,
        decay: Math.random() * 0.2 + 1,
        sustain: 0,
        release: 0,
      },
      pitch: {
        min: minPitch,
        max: maxPitch,
      },
      polyphony: 1,
    };
  }

  triggerAttackRelease(time) {
    const note = Tone.Frequency(this.params.pitch.min, "midi").toNote();
    this.synth.triggerAttackRelease(note, "8n", time);
  }

  createNewRandomBass() {
    this.synth.dispose();
    this.params = this.generateRandomBassParams();
    this.synth = new Tone.MembraneSynth({
      ...this.params,
      volume: globalControls.volumes.bass,
      polyphony: 1,
    });

    // Reconnect the new synth to the low-pass filter and then to the destination
    this.synth.connect(this.lowPassFilter);
    this.lowPassFilter.toDestination();
  }

  updateGlobalControls(newControls) {
    this.synth.dispose();
    Object.assign(globalControls, newControls);
    this.params = this.generateRandomBassParams();
    this.synth = new Tone.MembraneSynth({
      ...this.params,
      volume: globalControls.volumes.bass,
      polyphony: 1,
    });

    // Reconnect the updated synth to the low-pass filter and then to the destination
    this.synth.connect(this.lowPassFilter);
    this.lowPassFilter.toDestination();
  }

  adjustSynthParams() {
    // Add any specific adjustments you want for the bass synth
  }

  randomOscillatorType() {
    const oscillatorTypes = ["triangle", "sine", "sawtooth", "square"];
    return oscillatorTypes[Math.floor(Math.random() * oscillatorTypes.length)];
  }
}

// Create an instance of the Bass class
const bass = new Bass(globalControls.volumes.bass, `${globalControls.globalKey}1`);

// Bass pattern
const bassPattern = new Tone.Pattern((time, note) => {
  if (note !== null) {
    // Adjust synth parameters for more variety
    bass.triggerAttackRelease(time);
  }
}, generateRandomBassPattern()).start("16n");

// Function to generate a more interesting and groovy bass pattern
function generateRandomBassPattern() {
  const patternLength = globalControls.patternLength * 4;
  const randomBassPattern = [];

  for (let i = 0; i < patternLength; i++) {
    const shouldPlayBass = Math.random() < 0.7;

    if (shouldPlayBass) {
      const noteLengths = ["1n", "2n", "4n", "8n", "16n"];
      const randomNoteLength = noteLengths[Math.floor(Math.random() * noteLengths.length)];

      const pitchVariation = Math.floor(Math.random() * 5) - 2;
      const pitch = `${globalControls.globalKey}${pitchVariation}`;

      randomBassPattern.push(`${pitch}${randomNoteLength}`);
    } else {
      randomBassPattern.push(null);
    }
  }

  return randomBassPattern;
}
