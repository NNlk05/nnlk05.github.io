function updateTime() {
  const timeEl = document.getElementById("current-time");
  timeEl.textContent = new Date().toLocaleTimeString("en-US", {
    timeZone: "America/Halifax",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  setTimeout(updateTime, 1000);
}

updateTime();
