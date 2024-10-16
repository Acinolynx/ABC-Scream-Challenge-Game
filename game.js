let micAccess = false;
let audioContext, meterElement, meterFull, meterEmpty;
let meterLevel = 0;
let screamThreshold = 0.09; // Adjust this to control scream sensitivity
let stream;
let countdownTimer;
let gameDuration = 15; // Set game duration
let bgm;
let isMuted = false;
let countdownDisplay = document.getElementById("timerDisplay");
let startButton = document.getElementById("startButton");
let replayButton = document.getElementById("replayButton");

// Reward thresholds for colors
const thresholds = {
  green: 0.25, // Up to 25% full: green
  lightGreen: 0.5, // 26% to 50%: light green
  yellow: 0.75, // 51% to 75%: yellow
  red: 1, // 76% to 100%: red
};

// Access microphone and handle audio
async function accessMic() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      micAccess = true;
      stream = micStream;
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.audioWorklet.addModule("audio-worklet-processor.js"); // Load the Audio Worklet
      const volumeProcessorNode = new AudioWorkletNode(
        audioContext,
        "volume-processor"
      );

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(volumeProcessorNode);
      volumeProcessorNode.connect(audioContext.destination);

      // Handle messages from the processor
      volumeProcessorNode.port.onmessage = (event) => {
        const volume = event.data.volume;
        updateMeter(volume);
      };
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Please enable microphone access to play this game.");
    }
  } else {
    alert("Your browser doesn't support microphone access.");
  }
}

// Function to initialize BGM
function playBGM() {
  bgm = new Audio("Assets/Audio/bgm.mp3");
  bgm.loop = true; // Loop the music continuously
  bgm.volume = 0.15; // Set volume
  bgm.play().catch((error) => {
    console.log(
      "Autoplay failed due to browser restrictions, user interaction required"
    );
  });
}

// Mute/Unmute toggle function
function toggleMute() {
  if (isMuted) {
    bgm.muted = false; // Unmute the BGM
    document.getElementById("muteButton").textContent = "🔊"; // Change button icon to audio playing
  } else {
    bgm.muted = true; // Mute the BGM
    document.getElementById("muteButton").textContent = "🔇"; // Change button icon to muted
  }
  isMuted = !isMuted; // Toggle the mute state
}

// Function to update the scream meter based on sound volume
function updateMeter(volume) {
  if (volume > screamThreshold) {
    meterLevel += 0.05; // Increase meter level for scream
    if (meterLevel > 1) meterLevel = 1; // Cap meter level at 1
  } else {
    meterLevel -= 0.05; // Decrease meter level for silence
    if (meterLevel < 0) meterLevel = 0; // Prevent meter from going negative
  }

  // Update the clip-path for the full meter to create a filling effect
  const insetValue = 100 - meterLevel * 100; // Convert level to percentage for clip-path
  meterFull.style.clipPath = `inset(${insetValue}% 0 0 0)`; // Set clip-path based on meter level
}

// Function to format seconds into MM:SS
function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${secs}`;
}

// Start the actual game
function startGame() {
  gameDuration = 15; // Reset game duration for each new game
  countdownDisplay.innerText = formatTime(gameDuration);
  countdownDisplay.style.color = "red"; // Show initial timer in MM:SS format
  countdownTimer = setInterval(() => {
    gameDuration--;
    countdownDisplay.innerText = formatTime(gameDuration); // Update timer text in MM:SS format
    if (gameDuration <= 0) {
      clearInterval(countdownTimer);
      gameOver(meterLevel); // Send the final meter level to check the reward
    }
  }, 1000);
}

// Function to handle game over logic and show rewards
function gameOver(finalMeterLevel) {
  clearInterval(countdownTimer);
  // Hide game page and show game over screen
  document.querySelector(".game-page").style.display = "none";
  document.querySelector(".game-over-screen").style.display = "block";

  // Check which reward to give based on finalMeterLevel
  checkReward(finalMeterLevel);
}

// Function to check which reward image to show based on the meter level
function checkReward(finalMeterLevel) {
  let rewardImage;

  if (finalMeterLevel <= thresholds.green) {
    rewardImage = "./Assets/Asset_Png/green.png";
  } else if (finalMeterLevel <= thresholds.lightGreen) {
    rewardImage = "./Assets/Asset_Png/lgreen.png";
  } else if (finalMeterLevel <= thresholds.yellow) {
    rewardImage = "./Assets/Asset_Png/yellow.png";
  } else if (finalMeterLevel <= thresholds.red) {
    rewardImage = "./Assets/Asset_Png/red.png";
  }

  // Display the reward image on the game-over screen
  document.querySelector(
    ".reward"
  ).style.backgroundImage = `url(${rewardImage})`;
}

// Initialize the game when the player clicks the start button
startButton.addEventListener("click", function () {
  document.querySelector(".landing-page").style.display = "none";
  document.querySelector(".game-page").style.display = "block";
  startGame(); // Start the game countdown immediately
});

// Replay button to restart the game
replayButton.addEventListener("click", function () {
  document.querySelector(".game-over-screen").style.display = "none";
  document.querySelector(".landing-page").style.display = "block";
  meterLevel = 0; // Reset meter level
  meterFull.style.height = "0%"; // Reset meter visuals
});

// Get meter elements
window.onload = function () {
  accessMic(); // Access microphone
  playBGM(); // Start the BGM on page load
  meterFull = document.querySelector(".meter-full");
  meterEmpty = document.querySelector(".meter-empty");

  const muteButton = document.getElementById("muteButton");
  muteButton.addEventListener("click", toggleMute);

  // Autoplay after user interaction
  window.addEventListener(
    "click",
    function () {
      if (bgm.paused) {
        bgm.play();
      }
    },
    { once: true }
  ); // Ensures the play function is only triggered once
};
