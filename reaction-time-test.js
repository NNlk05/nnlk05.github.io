const testArea = document.getElementById("test-area");
const startButton = document.getElementById("start-button");
const resultsEl = document.getElementById("results");

const runs = 5;
let currentRun = 0;
const results = [];

function getRandomDelay() {
  return Math.random() * 2500 + 2500;
}

function getAvrg(arr) {
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
}

function start() {
  startButton.disabled = true;
  currentRun++;
  if (currentRun > runs) {
    resultsEl.textContent =
      "Test completed! Average reaction time: " +
      getAvrg(results).toFixed(2) +
      " ms.";
    startButton.disabled = false;
    startButton.textContent = "Restart";
    currentRun = 0;
    return;
  }
  let delay = getRandomDelay();
  setTimeout(() => {
    testArea.style.backgroundColor = "green";
    const startTime = performance.now();
    function clickHandler() {
      const reactionTime = performance.now() - startTime;
      results.push(reactionTime);
      resultsEl.textContent =
        "Run " +
        currentRun +
        ": " +
        reactionTime.toFixed(2) +
        " ms. Average: " +
        getAvrg(results).toFixed(2) +
        " ms.";
      testArea.style.backgroundColor = "";
      testArea.removeEventListener("click", clickHandler);
      start();
    }
    testArea.addEventListener("click", clickHandler);
  }, delay);
}

startButton.addEventListener("click", start);
