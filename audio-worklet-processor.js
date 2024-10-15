class VolumeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs) {
    // Check if there's any input
    if (inputs.length > 0) {
      const input = inputs[0]; // Get the first channel input
      if (input.length > 0) {
        const channelData = input[0]; // Get the first channel data

        let sum = 0;
        // Calculate the sum of squares for RMS calculation
        for (let i = 0; i < channelData.length; i++) {
          sum += channelData[i] * channelData[i];
        }
        // Calculate RMS
        const rms = Math.sqrt(sum / channelData.length);
        // Send the volume level back to the main thread
        this.port.postMessage({ volume: rms });
      }
    }

    // Return true to keep the processor alive
    return true;
  }
}

// Register the processor with a unique name
registerProcessor("volume-processor", VolumeProcessor);
