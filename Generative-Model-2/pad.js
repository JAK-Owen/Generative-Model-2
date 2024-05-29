class Pad {
  constructor(volume, globalKey) {
    this.effectRack = new Tone.Filter({
      type: 'lowpass',
      frequency: 400,
      rolloff: -12,
    }).toDestination();

    const highPassFilter = new Tone.Filter({
      type: 'highpass',
      frequency: 600,
      rolloff: -12,
    }); 

    const reverb = new Tone.Reverb({
      decay: Math.random() * 10 + 1,
      wet: 1,
    }).toDestination();

    const delay = new Tone.FeedbackDelay({
      wet: 1,
      delayTime: Math.random() * 0.5 + 0.1,
      feedback: Math.random() * 0.5,
    }).toDestination();

    this.effectRack.chain(reverb, delay, highPassFilter);

    this.synth = new Tone.PolySynth().connect(this.effectRack);
    this.synth.volume.value = volume + globalControls.volumes.pad;
    this.globalKey = globalKey;
    this.note = [this.globalKey + '2', this.globalKey + '3', this.globalKey + '4'];
    this.params = this.generateRandomPadParams();

    this.synthUp = new Tone.PolySynth().connect(this.effectRack);
    this.synthUp.volume.value = volume + globalControls.volumes.pad;
    this.noteUp = [this.globalKey + '3', this.globalKey + '4', this.globalKey + '5'];

    this.synthDown = new Tone.PolySynth().connect(this.effectRack);
    this.synthDown.volume.value = volume + globalControls.volumes.pad;
    this.noteDown = [this.globalKey + '1', this.globalKey + '2', this.globalKey + '3'];

    this.setupSynthesizer();
    this.playConstantMinorChord();
    this.setupLFO();
    this.automateParameterChanges();
  }

  playConstantMinorChord() {
    if (this.note.every((note) => note !== null)) {
      this.synth.triggerAttack(this.note);
    }

    if (this.synthUp && this.noteUp.every((note) => note !== null)) {
      this.synthUp.triggerAttack(this.noteUp.map(note => Tone.Frequency(note).transpose(7).toNote()));
    }

    if (this.synthDown && this.noteDown.every((note) => note !== null)) {
      this.synthDown.triggerAttack(this.noteDown.map(note => Tone.Frequency(note).transpose(-12).toNote()));
    }
  }

  stopPad() {
    this.synth.triggerRelease(this.note);
    this.synthUp.triggerRelease(this.noteUp);
    this.synthDown.triggerRelease(this.noteDown);
  }

  initialize() {
    this.playConstantMinorChord();

    if (this.synthUp) {
      this.synthUp.triggerAttack(this.noteUp.map(note => Tone.Frequency(note).transpose(7).toNote()));
    }

    if (this.synthDown) {
      this.synthDown.triggerAttack(this.noteDown.map(note => Tone.Frequency(note).transpose(-12).toNote()));
    }

    // Adjust start times to avoid conflicts
    this.lfo.sync().start();
    this.automateParameterChanges();
  }

  generateRandomPadParams() {
    const octave = 2;

    return {
      oscillator: {
        type: this.randomOscillatorType(),
        harmonicity: Math.random() * 3 + 1,
        detune: Math.random() * 10 - 5,
      },
      filter: {
        type: 'lowpass',
        frequency: Math.random() * 500 + 200,
        rolloff: -12,
      },
      octave,
    };
  }

  updateSynthParams() {
    this.synth.set(this.params);
    this.synthUp.set(this.params);
    this.synthDown.set(this.params);
  }

  setupSynthesizer() {
    this.updateSynthParams();
  }

  createNewRandomPad() {
    this.synth.dispose();
    this.synth = new Tone.PolySynth().connect(this.effectRack);
    this.synth.volume.value = globalControls.volumes.pad;
    this.params = this.generateRandomPadParams();
    this.setupSynthesizer();
    this.playConstantMinorChord();
  }

  updateGlobalControls(newControls) {
    this.synth.dispose();
    this.synthUp.dispose();
    this.synthDown.dispose();

    Object.assign(globalControls, newControls);

    this.synth = new Tone.PolySynth().connect(this.effectRack);
    this.synthUp = new Tone.PolySynth().connect(this.effectRack);
    this.synthDown = new Tone.PolySynth().connect(this.effectRack);

    this.synth.volume.value = globalControls.volumes.pad;
    this.synthUp.volume.value = globalControls.volumes.pad;
    this.synthDown.volume.value = globalControls.volumes.pad;

    this.params = this.generateRandomPadParams();
    this.setupSynthesizer();
    this.playConstantMinorChord();
  }

  adjustSynthParams() {
    // Add any specific adjustments you want for the pad
  }

  randomOscillatorType() {
    const oscillatorTypes = ['triangle', 'sine', 'sawtooth', 'square'];
    return oscillatorTypes[Math.floor(Math.random() * oscillatorTypes.length)];
  }

  setupLFO() {
    // Create an LFO for the filter frequency
    this.lfo = new Tone.LFO({
      type: 'sine',
      frequency: Math.random() * 0.05 + 0.01, // Randomize frequency for each instance
      min: 400, // Set the minimum frequency (closed position)
      max: 2000, // Set the maximum frequency (open position)
      phase: Math.random() * 360, // Randomize phase
    }).start();

    // Connect the LFO to the filter frequency
    this.lfo.connect(this.effectRack.frequency);
  }

  automateParameterChanges() {
    const automationTime = 60;

    // Ensure the LFO is stopped before starting it again
    this.lfo.stop();

    // Start the LFO at a random phase
    this.lfo.phase = Math.random() * 360;

    // Start the LFO
    this.lfo.start();

    // Schedule a stop event after the automation time
    setTimeout(() => {
      this.lfo.stop();
    }, automationTime * 1000); // Convert automationTime to milliseconds

    // Start the Transport to trigger the scheduled changes
    Tone.Transport.start();
  }
}

// Instantiate the Pad class
const pad1 = new Pad(globalControls.volumes.pad, globalControls.globalKey);
const pad2 = new Pad(globalControls.volumes.pad, globalControls.globalKey);
const pad3 = new Pad(globalControls.volumes.pad, globalControls.globalKey);

// Export the pad instances for use in other files
window.pad1 = pad1;
window.pad2 = pad2;
window.pad3 = pad3;
