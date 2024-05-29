class Kick {
  constructor(volume) {
    this.params = this.generateRandomKickParams();
    this.synth = new Tone.MembraneSynth({
      ...this.params,
      volume: volume,
      pitch: `${globalControls.globalKey}1`, // Initialize pitch with globalKey
    }).toDestination();
  }

  generateRandomKickParams() {
    const minPitch = Tone.Frequency(`${globalControls.globalKey}1`).toMidi();
    const maxPitch = Tone.Frequency(`${globalControls.globalKey}2`).toMidi();
 
    return {
      pitchDecay: Math.random() * 0.1 + 0.01,
      octaves: Math.floor(Math.random() * 3) + 4,
      oscillator: { type: this.randomOscillatorType() }, // Randomize oscillator type
      envelope: {
        attack: Math.random() * 0.01 + 0.001,
        decay: Math.random() * 0.2 + 0.2,
        sustain: 0,
        release: Math.random() * 0.1 + 0.01,
      },
      pitch: {
        min: minPitch,
        max: maxPitch,
      },
    };
  }

  triggerAttackRelease(time) {
    const note = Tone.Frequency(this.params.pitch.min, "midi").toNote();
    this.synth.triggerAttackRelease(note, "8n", time);
  }

  createNewKick(volume, key) {
    this.synth.dispose();
    this.params = this.generateRandomKickParams();
    this.synth = new Tone.MembraneSynth({
      ...this.params,
      volume: volume,
      pitch: key, // Use the provided key
    }).toDestination();
  }

  randomOscillatorType() {
    const oscillatorTypes = ["sine", "triangle"];
    return oscillatorTypes[Math.floor(Math.random() * oscillatorTypes.length)];
  }

  updateVolume(volume) {
    this.synth.volume.value = volume;
  }

  updateKey(key) {
    this.synth.set({
      pitch: key
    });
  }
}

// Create an instance of the Kick class
const kick = new Kick(globalControls.volumes.kick);

// Drum beat pattern for kick
const kickPattern = new Tone.Pattern((time, note) => {
  if (note !== null) {
    kick.triggerAttackRelease(time);
  }
}, ["C1"]).start(0);

// Export the kick instance for use in other files
window.kick = kick;
