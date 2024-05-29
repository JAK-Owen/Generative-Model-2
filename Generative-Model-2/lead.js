class Lead {
  constructor(volume, globalKey) {
    this.rootNote = globalKey + '3';
    this.scale = this.generateMinorTriad(globalKey);
    this.synth = new Tone.PolySynth().toDestination();
    this.synth.volume.value = volume + globalControls.volumes.lead;
    this.addEffectsRack();
    this.randomizeSynthParams();
    this.generateRandomRhythm(); // Generate rhythmic pattern when instantiated
    this.playRhythm();
  }
 
  addEffectsRack() {
    // Define effects with default parameters
    this.delay = new Tone.Delay({
        wet: 0.01,
        delayTime: '8n.',
        feedback: 0.5
    });

    this.reverb = new Tone.Reverb({
        wet: 0.2,
        decay: 2
    });

    this.lowpassFilter = new Tone.Filter({
        type: 'lowpass', // Default to lowpass filter type
        frequency: 20000, // Default frequency
        rolloff: -12 // Default rolloff
    });

    // Add an LFO (Low Frequency Oscillator)
    const lfo = new Tone.LFO({
        type: "sine", // You can change the type of the LFO waveform as needed
        min: 0.0001, // Minimum value for the modulation (40% of 1000)
        max: 20000, // Maximum value for the modulation (100% of 1000)
        frequency: 1 / 100 // Frequency of the LFO (full cycle in 30 seconds)
    }).start();


    // Connect the LFO to modulate the filter frequency
    lfo.connect(this.lowpassFilter.frequency);

    // Connect effects
    this.synth.connect(this.delay); // Connect synth to delay
    this.delay.connect(this.reverb); // Connect delay to reverb
    this.reverb.connect(this.lowpassFilter); // Connect reverb to lowpass filter
    this.lowpassFilter.toDestination(); // Connect lowpass filter to destination

    // Connect delay output to the destination
    this.delay.toDestination();
}



  

  generateMinorTriad(rootNote) {
    const octaves = [ '3', '4']; // Choose appropriate octave range
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = notes.indexOf(rootNote.charAt(0).toUpperCase() + rootNote.slice(1));
    const minorTriad = [
        notes[(rootIndex) % 12] + octaves[Math.floor(Math.random() * octaves.length)],
        notes[(rootIndex + 3) % 12] + octaves[Math.floor(Math.random() * octaves.length)],
        notes[(rootIndex + 7) % 12] + octaves[Math.floor(Math.random() * octaves.length)]
    ];
    return minorTriad;
}


  generateRandomRhythm() {
    const rhythmLength = globalControls.patternLength * 4; // Adjust length as needed
    const rhythmPattern = [];

    for (let i = 0; i < rhythmLength; i++) {
      const shouldPlayNote = Math.random() < 0.7; // Adjust probability as needed

      if (shouldPlayNote) {
        const randomIndex = Math.floor(Math.random() * this.scale.length);
        const note = this.scale[randomIndex];
        rhythmPattern.push(note);
      } else {
        rhythmPattern.push(null);
      }
    }

    this.rhythmPattern = rhythmPattern;
}


  playRhythm() {
    const loopLength = globalControls.patternLength * this.rhythmPattern.length;
    const tempo = Tone.Transport.bpm.value;
    const noteDuration = (60 / tempo) / 1; // Convert to seconds
    const noteSpacing = 0.5; // Adjust spacing between notes as needed

    const filteredPattern = this.rhythmPattern.filter(note => note !== null);

    const sequence = new Tone.Sequence((time, note) => {
      this.synth.triggerAttackRelease(note, '16n', time);
    }, filteredPattern).start(0);

    sequence.loop = true;
    sequence.loopEnd = loopLength;
    sequence.interval = noteDuration + noteSpacing;

    Tone.Transport.start();
  }

  randomizeSynthParams() {
    const oscillatorTypes = ['sine', 'triangle', 'sawtooth', 'square'];
    const randomOscillatorType = oscillatorTypes[Math.floor(Math.random() * oscillatorTypes.length)];

    const minHarmonicity = 0.5;
    const maxHarmonicity = 2.5;
    const randomHarmonicity = Math.random() * (maxHarmonicity - minHarmonicity) + minHarmonicity;

    const minFrequency = 200;
    const maxFrequency = 2000;
    const randomFrequency = Math.random() * (maxFrequency - minFrequency) + minFrequency;

    const minDecay = 0.5;
    const maxDecay = 10;
    const randomDecay = Math.random() * (maxDecay - minDecay) + minDecay;

    const minDelayTime = 0.1;
    const maxDelayTime = 0.6;
    const randomDelayTime = Math.random() * (maxDelayTime - minDelayTime) + minDelayTime;

    const minFeedback = 0.1;
    const maxFeedback = 0.5;
    const randomFeedback = Math.random() * (maxFeedback - minFeedback) + minFeedback;

    this.synth.set({
      oscillator: {
        type: randomOscillatorType,
        harmonicity: randomHarmonicity,
      },
      filter: {
        frequency: randomFrequency,
      },
      envelope: {
        decay: randomDecay,
      },
      delayTime: randomDelayTime,
      feedback: randomFeedback,
    });
  }
}
