class VolumeProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];

    if (input.length > 0) {
      const channelData = input[0]; // Get the first channel
      let sum = 0;

      for (let i = 0; i < channelData.length; i++) {
        sum += Math.abs(channelData[i]); // Calculate the absolute value for volume
      }

      const volume = sum / channelData.length; // Average the values for volume
      this.port.postMessage({ volume: volume }); // Send the volume back
    }

    return true; // Keep the processor alive
  }
}

registerProcessor("volume-processor", VolumeProcessor);
