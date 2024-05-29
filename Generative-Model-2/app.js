document.addEventListener("DOMContentLoaded", function () {
  let isAudioStarted = false;
  let bassLoopCount = 0;
  const maxBassLoops = 4;

  // Initialize Tone.js
  Tone.start(); 

  // Create instances of kick, hi-hat, snare, bass, pad, and lead
  const kick = new Kick(
    globalControls.volumes.kick,
    `${globalControls.globalKey}1`
  );
  const hiHat = new HiHat();
  const snare = new Snare();
  const bass = new Bass(globalControls.volumes.bass, `${globalControls.globalKey}1`);
  const pad = new Pad(
    globalControls.volumes.pad,
    globalControls.globalKey
  );
  const lead = new Lead(
    globalControls.volumes.lead,
    globalControls.globalKey
  );

  // Drum beat patterns
  const kickPattern = new Tone.Pattern((time, note) => {
    if (note !== null) {
      kick.triggerAttackRelease(time);
    }
  }, ["C1", null, null, "C1"]).start(0);

  const snarePattern = new Tone.Pattern((time, note) => {
    if (note !== null) {
      snare.triggerAttackRelease(time);
    }
  }, [null, null, "C2", null]).start(0);

  const hiHatPattern = new Tone.Pattern((time, note) => {
    if (note !== null) {
      hiHat.triggerAttackRelease(time);
    }
  }, ["C2", null, "C2", null]).start(0);

  const bassPattern = new Tone.Pattern((time, note) => {
    if (note !== null) {
      bass.triggerAttackRelease(time);
    }
  }, ["C1", null, null, "C1"]).start(0);

  // Start playing the constant minor chord for pad
  pad.initialize();

  // Main loop to control the number of bass loops
  Tone.Transport.scheduleRepeat((time) => {
    if (bassLoopCount < maxBassLoops) {
      bassPattern.index = 0; // Reset the bass pattern index
      bassLoopCount++;
    }
  }, "4n");

  // Connect everything and set BPM
  Tone.Transport.bpm.value = globalControls.bpm;

  // Start and stop buttons
  const toggleBtn = document.getElementById("toggleBtn");

  toggleBtn.addEventListener("click", () => {
    if (!isAudioStarted) {
      // Start audio playback and trigger lead melody
      Tone.start();
      isAudioStarted = true;
      Tone.Transport.start();
      toggleBtn.textContent = "Play/Stop";
      lead.playMelody(); // Trigger lead melody
    } else {
      // Stop audio playback and lead melody
      Tone.Transport.stop();
      pad.stopPad();
      lead.synth.triggerRelease(); // Stop the lead synthesizer
      toggleBtn.textContent = "Play";
      isAudioStarted = false;
    }
  });

  // Refresh event to create new drum and bass synths with random parameters on each page reload
  window.addEventListener("beforeunload", () => {
    kick.createNewKick(globalControls.volumes.kick, `${globalControls.globalKey}1`);
    hiHat.createNewHiHat(globalControls.volumes.hiHat, `${globalControls.globalKey}1`);
    snare.createNewSnare(globalControls.volumes.snare, `${globalControls.globalKey}1`);
    bass.createNewRandomBass(globalControls.volumes.bass, `${globalControls.globalKey}1`);
    pad.createNewRandomPad();
    lead.updateGlobalControls({ volumes: { lead: globalControls.volumes.lead } }); // Update lead synth volume
    bassLoopCount = 0; // Reset the bass loop count on refresh
  });

  // Export the pad and lead instances for use in other files
  window.pad = pad;
  window.lead = lead;
});
