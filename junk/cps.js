const btn = document.getElementById("click-button");
const resultEl = document.getElementById("result");
const clickTimestamps = [];

let startTime = null;
let totalClicks = 0;
let isSessionActive = true;
let sessionEndTime = null;

btn.addEventListener("click", () => {
  const now = Date.now();

  if (!isSessionActive && sessionEndTime && now - sessionEndTime > 2000) {
    startTime = null;
    totalClicks = 0;
    isSessionActive = true;
    sessionEndTime = null;
    clickTimestamps.length = 0;
    resultEl.textContent = "New session started! Start clicking!";
  }

  if (!isSessionActive) {
    return;
  }

  if (startTime === null) {
    startTime = now;
  }

  const elapsedSeconds = (now - startTime) / 1000;

  if (elapsedSeconds >= 10) {
    isSessionActive = false;
    sessionEndTime = now;
    const finalAverageCps = (totalClicks / 10).toFixed(2);
    resultEl.textContent = `Time's up! Total Clicks: ${totalClicks}. Final Avg CPS: ${finalAverageCps} (Click after 2s to restart)`;
    return;
  }

  clickTimestamps.push(now);
  totalClicks++;

  while (clickTimestamps.length > 0 && clickTimestamps[0] <= now - 1000) {
    clickTimestamps.shift();
  }

  const instantCps = clickTimestamps.length;
  const averageCps =
    elapsedSeconds > 0 ? (totalClicks / elapsedSeconds).toFixed(2) : 0;

  resultEl.textContent = `Instant CPS: ${instantCps} | Avg CPS: ${averageCps} | Clicks: ${totalClicks}`;
});
