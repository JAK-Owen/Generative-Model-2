// Ccreate the control panel UI
function createControlPanel() {
    const controlPanel = document.createElement('div');
    controlPanel.classList.add('control-panel');
  
    // Create input fields for each global control parameter
    for (let control in globalControls) {
      if (typeof globalControls[control] === 'object') {
        // Handle nested objects (volumes)
        for (let subControl in globalControls[control]) {
          const input = createInput(subControl, control, globalControls[control][subControl], controlPanel);
          controlPanel.appendChild(input);
        }
      } else {
        const input = createInput(control, null, globalControls[control], controlPanel);
        controlPanel.appendChild(input);
      }
    } 
  
    // Append the control panel to the body
    document.body.appendChild(controlPanel);
  
    // Create hi-hat controls after control panel is created
    createHiHatControls(controlPanel);
  }
  
  // Call the function to create the control panel UI
  createControlPanel();
  
  // Function to create input fields for hi-hat controls
  function createHiHatControls(container) {
    const hiHatControls = document.createElement('div');
    hiHatControls.classList.add('hihat-controls');
  
    // Create input fields for hi-hat volume
    const hiHatVolumeInput = createInput('Volume', 'volumes', globalControls.volumes.hiHat, hiHatControls, 'hiHatVolume');
    hiHatControls.appendChild(hiHatVolumeInput);
  
    // Append hi-hat controls to the container
    container.appendChild(hiHatControls);
  }
  
  // Function to create input fields
  function createInput(name, parentControl, value, container, id) {
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');
  
    const label = document.createElement('label');
    label.textContent = name;
    inputContainer.appendChild(label);
  
    const input = document.createElement('input');
    input.type = 'number';
    input.value = typeof value === 'number' ? value : 0; // Set value to 0 if not a number
    if (id) input.id = id; // Set input id if provided
  
    input.addEventListener('input', function () {
      // Update the globalControls object in real-time
      const floatValue = parseFloat(this.value);
      if (!isNaN(floatValue)) {
        if (parentControl) {
          globalControls[parentControl][name] = floatValue;
        } else {
          globalControls[name] = floatValue;
        }
        updateToneInstruments(parentControl, name, floatValue);
      }
    });
  
    inputContainer.appendChild(input);
  
    return inputContainer;
  }
  
  // Function to listen for changes in hi-hat controls
  function listenForHiHatControlChanges() {
    const hiHatVolumeInput = document.getElementById('hiHatVolume');
    hiHatVolumeInput.addEventListener('input', function () {
      const floatValue = parseFloat(this.value);
      if (!isNaN(floatValue)) {
        globalControls.volumes.hiHat = floatValue;
        if (typeof window.updateHatVolumeControl === 'function') {
          window.updateHatVolumeControl(floatValue);
        }
      }
    });
  }
  
  // Call the function to listen for changes in hi-hat controls
  listenForHiHatControlChanges();
  
  // Function to update hi-hat controls in the control panel UI
  function updateHiHatControls(newControls) {
    if (newControls.volumes && newControls.volumes.hiHat) {
      const hiHatVolumeInput = document.getElementById('hiHatVolume');
      hiHatVolumeInput.value = newControls.volumes.hiHat;
    }
  }
  
  // Call the function to create hi-hat controls
  createHiHatControls(document.querySelector('.control-panel'));
  
  // Function to update hi-hat controls when global controls are updated
  window.updateHiHatControls = updateHiHatControls;
  
  // Function to update Tone.js instruments based on global controls
  function updateToneInstruments(parentControl, controlName, value) {
    switch (parentControl) {
      case 'volumes':
        switch (controlName) {
          case 'kick':
            // Example: Update volume of the kick instrument
            kick.updateVolume(value);
            break;
          case 'snare':
            // Example: Update volume of the snare instrument
            snare.updateVolume(value);
            break;
          case 'hiHat':
            // Example: Update volume of the hi-hat instrument
            hiHat.updateVolume(value);
            break;
          // Add cases for other instruments if needed
        }
        break;
      case null:
        switch (controlName) {
          case 'globalKey':
            // Example: Update key of all instruments based on the global key
            const key = `${globalControls.globalKey}1`; // Use globalKey to set the new key
            kick.updateKey(key);
            hiHat.updateKey(key);
            snare.updateKey(key);
            bass.updateKey(key);
            pad.updateKey(globalControls.globalKey);
            lead.updateKey(globalControls.globalKey);
            break;
          case 'bpm':
            // Example: Update BPM of the Transport
            Tone.Transport.bpm.value = value;
            break;
          // Add cases for other global controls if needed
        }
        break;
      // Add cases for other parent controls if needed
    }
  }
  