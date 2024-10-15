document.getElementById("start-button").addEventListener("click", function () {
  // Hide the landing page
  document.getElementById("landing-page").style.display = "none";

  // Start the scream detection game logic here (e.g., microphone input)
  startGame();
});

function startGame() {
  // Insert logic for scream detection, thresholds, and game state changes

  // Example for game over logic:
  let isWin = true; // Set this based on game outcome

  document.getElementById("game-over-screen").style.display = "flex";
  document.getElementById("game-over-message").textContent = isWin
    ? "Kamu Menang!"
    : "Kamu Kalah!";
  document.getElementById("prize-image").src = isWin
    ? "path-to-win-image.png"
    : "path-to-lose-image.png";
}
