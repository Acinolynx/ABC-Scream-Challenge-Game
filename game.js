let micAccess = false;
let audioContext, meterElement, meterFull, meterEmpty;
let meterLevel = 0;
let screamThreshold = 0.01; // Adjust this to control scream sensitivity
let stream;
let countdownTimer;
let gameDuration = 20; // Set game duration
let bgm;
let countdownAudio; // New variable for countdown audio
let cheerAudio; // New variable for cheer audio
let countdownDisplay = document.getElementById("timerDisplay");
let startButton = document.getElementById("startButton");
let replayButton = document.getElementById("replayButton");
let countdownOverlay = document.getElementById("countdownOverlay"); // Countdown overlay div

// Reward thresholds for colors
const thresholds = {
  green: 0.25, // Up to 25% full: green
  lightGreen: 0.5, // 26% to 50%: light green
  yellow: 0.75, // 51% to 75%: yellow
  red: 1, // 76% to 100%: red
};

// Countdown numbers and index
let countdownNumbers = ["3", "2", "1", " "];
let countdownIndex = 0;

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
        console.log("Detected volume:", volume); // Debugging line
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

// Load countdown and cheer audio
function loadAudio() {
  countdownAudio = new Audio("Assets/Audio/countdown.mp3"); // Replace with your countdown audio file
  cheerAudio = new Audio("Assets/Audio/cheer.mp3"); // Replace with your cheer audio file
}

// Function to update the scream meter based on sound volume
function updateMeter(volume) {
  if (volume > screamThreshold) {
    meterLevel += 0.002; // Increase meter level for scream
    if (meterLevel > 1) meterLevel = 1; // Cap meter level at 1
  }

  // Update the clip-path for the full meter to create a filling effect
  const insetValue = 100 - meterLevel * 100; // Convert level to percentage for clip-path
  meterFull.style.clipPath = `inset(${insetValue}% 0 0 0)`; // Set clip-path based on meter level

  if (meterLevel >= 1) {
    gameOver(meterLevel); // Pass the final meter level to gameOver
  }
}

// Function to format seconds into MM:SS
function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${secs}`;
}

// Start the actual game
function startGame() {
  bgm.pause();
  gameDuration = 20; // Reset game duration for each new game
  countdownDisplay.innerText = formatTime(gameDuration);
  countdownDisplay.style.color = "red"; // Show initial timer in MM:SS format
  countdownDisplay.style.display = "block";
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
  // Stop the BGM and play the cheer audio
  bgm.pause();
  cheerAudio.play();

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

// Countdown animation function
function showCountdown() {
  if (countdownIndex < countdownNumbers.length) {
    countdownOverlay.innerText = countdownNumbers[countdownIndex];
    countdownOverlay.classList.add("countdown-show");
    countdownOverlay.classList.remove("countdown-hide");

    setTimeout(() => {
      countdownOverlay.classList.add("countdown-hide");
      countdownOverlay.classList.remove("countdown-show");
      countdownIndex++;
      setTimeout(showCountdown, 350); // Delay before showing the next number
    }, 500); // 1 second for each number
  } else {
    // Start the game after the countdown is finished
    countdownOverlay.style.display = "none"; // Hide countdown overlay after GO!
    countdownIndex = 0; // Reset index for next game

    accessMic(); // Access microphone after countdown
    playBGM(); // Restart BGM after countdown
    startGame(); // Start the game countdown immediately
  }
}

// Initialize the game when the player clicks the start button
startButton.addEventListener("click", function () {
  // Stop the BGM and play the countdown audio
  bgm.pause(); // Stop background music
  countdownAudio.play(); // Start countdown audio

  // Transition to the game page
  document.querySelector(".landing-page").style.display = "none"; // Hide landing page
  countdownDisplay.style.color = "red";
  document.querySelector(".game-page").style.display = "block"; // Show game page

  // Display the countdown overlay and start the countdown animation
  countdownDisplay.innerText = formatTime(gameDuration); // Show the timer
  countdownOverlay.style.display = "block";
  showCountdown(); // Start the number countdown from 3 to GO!
});

// Replay button to restart the game
replayButton.addEventListener("click", function () {
  document.querySelector(".game-over-screen").style.display = "none";
  document.querySelector(".landing-page").style.display = "block";
  meterLevel = 0; // Reset meter level
  meterFull.style.clipPath = `inset(100% 0 0 0)`; // Reset meter visuals

  // Reset the BGM
  bgm.pause(); // Pause current BGM
  bgm.currentTime = 0; // Reset BGM to start
  bgm.play(); // Play BGM again
});

// Get meter elements and load audio files
window.onload = function () {
  loadAudio(); // Load countdown and cheer audio
  playBGM(); // Start the BGM on page load
  meterFull = document.querySelector(".meter-full");
  meterEmpty = document.querySelector(".meter-empty");

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
