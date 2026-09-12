const GRID_SIZE = 16;

class LevelManager {
  constructor() {
    this.levels = [];
    this.currentLevelIndex = 0;
    this.clicks = 0;
    this.steps = 0;
    this.isPlaying = false;
    this.playIntervalId = null;
  }

  addLevel(levels) {
    if (Array.isArray(levels)) {
      this.levels.push(...levels);
    } else {
      this.levels.push(levels);
    }
  }

  getCurrentLevel() {
    return this.levels[this.currentLevelIndex] || null;
  }

  nextLevel() {
    if (this.currentLevelIndex < this.levels.length - 1) {
      this.currentLevelIndex++;
    }
  }

  reset() {
    this.currentLevelIndex = 0;
    this.clicks = 0;
    this.steps = 0;
  }

  addClick() {
    this.clicks++;
  }

  addStep() {
    this.steps++;
  }

  getClicks() {
    return this.clicks;
  }

  getSteps() {
    return this.steps;
  }
}

const levelManager = new LevelManager();

function getCheckboxAt(coordinateX, coordinateY) {
  const row = document.querySelectorAll(".grid > div")[coordinateY];
  if (!row) {
    return null;
  }
  return row.querySelectorAll('input[type="checkbox"]')[coordinateX] || null;
}

function loadIntoGrid(dataArray) {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const checkbox = getCheckboxAt(x, y);
      if (checkbox) {
        checkbox.checked = !!dataArray[y][x];
      }
    }
  }
}

function loadOutOfGrid() {
  const dataArray = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const rowArray = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const checkbox = getCheckboxAt(x, y);
      rowArray.push(checkbox ? checkbox.checked : false);
    }
    dataArray.push(rowArray);
  }
  return dataArray;
}

function tick(dataArray) {
  const newDataArray = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const rowArray = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = dataArray[y][x];
      let liveNeighbors = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) {
            continue;
          }
          const ny = (y + dy + GRID_SIZE) % GRID_SIZE;
          const nx = (x + dx + GRID_SIZE) % GRID_SIZE;
          if (dataArray[ny][nx]) {
            liveNeighbors++;
          }
        }
      }

      let newCell = cell;
      if (cell && (liveNeighbors < 2 || liveNeighbors > 3)) {
        newCell = false;
      } else if (!cell && liveNeighbors === 3) {
        newCell = true;
      }
      rowArray.push(newCell);
    }
    newDataArray.push(rowArray);
  }
  return newDataArray;
}

function updatePB(levelIndex, clicks) {
  const currentPB = getPB(levelIndex);
  if (currentPB !== null && clicks >= currentPB) {
    return;
  }
  localStorage.setItem(`level${levelIndex}PB_Clicks`, clicks);
}

function getPB(levelIndex) {
  const rawPB = localStorage.getItem(`level${levelIndex}PB_Clicks`);
  return rawPB !== null ? parseInt(rawPB, 10) : null;
}

function rleDecode(rleString) {
  const cleanedRLE = rleString.replace("!", "").trim();
  const tempGrid = [];
  let currentWord = "";
  let i = 0;
  let currentRow = [];

  while (i < cleanedRLE.length) {
    const char = cleanedRLE[i];
    if (/\d/.test(char)) {
      currentWord += char;
    } else if (char === "b") {
      const count = parseInt(currentWord, 10) || 1;
      currentRow.push(...Array(count).fill(false));
      currentWord = "";
    } else if (char === "o") {
      const count = parseInt(currentWord, 10) || 1;
      currentRow.push(...Array(count).fill(true));
      currentWord = "";
    } else if (char === "$") {
      const count = parseInt(currentWord, 10) || 1;
      tempGrid.push(currentRow);
      for (let k = 1; k < count; k++) {
        tempGrid.push([]);
      }
      currentRow = [];
      currentWord = "";
    }
    i++;
  }
  if (currentRow.length > 0) {
    tempGrid.push(currentRow);
  }

  let minX = GRID_SIZE;
  let maxX = -1;
  let minY = GRID_SIZE;
  let maxY = -1;

  for (let y = 0; y < tempGrid.length; y++) {
    for (let x = 0; x < tempGrid[y].length; x++) {
      if (tempGrid[y][x]) {
        if (x < minX) {
          minX = x;
        }
        if (x > maxX) {
          maxX = x;
        }
        if (y < minY) {
          minY = y;
        }
        if (y > maxY) {
          maxY = y;
        }
      }
    }
  }

  const centeredGrid = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false),
  );
  if (maxX === -1) {
    return centeredGrid;
  }

  const patternWidth = maxX - minX + 1;
  const patternHeight = maxY - minY + 1;
  const startY = Math.floor((GRID_SIZE - patternHeight) / 2);
  const startX = Math.floor((GRID_SIZE - patternWidth) / 2);

  for (let y = 0; y < patternHeight; y++) {
    for (let x = 0; x < patternWidth; x++) {
      const sourceY = minY + y;
      const sourceX = minX + x;
      if (tempGrid[sourceY] && tempGrid[sourceY][sourceX]) {
        const targetY = startY + y;
        const targetX = startX + x;
        if (
          targetY >= 0 &&
          targetY < GRID_SIZE &&
          targetX >= 0 &&
          targetX < GRID_SIZE
        ) {
          centeredGrid[targetY][targetX] = true;
        }
      }
    }
  }

  return centeredGrid;
}

function updateStatus() {
  let statusDiv = document.getElementById("game-status");
  if (!statusDiv) {
    statusDiv = document.createElement("div");
    statusDiv.id = "game-status";
    statusDiv.style.marginBottom = "16px";
    statusDiv.style.textAlign = "center";
    statusDiv.style.fontFamily =
      '"Inconsolata", "Courier New", Courier, monospace';
    const grid = document.querySelector(".grid");
    if (grid && grid.parentNode) {
      grid.parentNode.insertBefore(statusDiv, grid);
    }
  }

  const currentLevelIndex = levelManager.currentLevelIndex;
  const pb = getPB(currentLevelIndex);

  statusDiv.innerHTML = "";

  const headerContainer = document.createElement("div");
  headerContainer.style.display = "flex";
  headerContainer.style.alignItems = "center";
  headerContainer.style.justifyContent = "center";
  headerContainer.style.gap = "12px";
  headerContainer.style.fontSize = "1.1rem";
  headerContainer.style.fontWeight = "600";
  headerContainer.style.color = "#fff";

  const label = document.createElement("span");
  label.textContent = "Level:";
  headerContainer.appendChild(label);

  const select = document.createElement("select");
  select.style.padding = "4px 8px";
  select.style.border = "2px solid #192d05";
  select.style.backgroundColor = "#4a3b30";
  select.style.color = "white";
  select.style.fontFamily = '"Courier New", Courier, monospace';
  select.style.fontSize = "0.95rem";
  select.style.fontWeight = "600";
  select.style.cursor = "pointer";

  for (let i = 0; i < levelManager.levels.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `Level ${i + 1}`;
    if (i === currentLevelIndex) {
      option.selected = true;
    }
    select.appendChild(option);
  }

  select.addEventListener("change", (event) => {
    if (levelManager.isPlaying) {
      stopAutoplay();
    }
    loadLevel(parseInt(event.target.value, 10));
  });

  headerContainer.appendChild(select);
  statusDiv.appendChild(headerContainer);

  const stats = document.createElement("div");
  stats.style.fontSize = "1rem";
  stats.style.color = "white";
  stats.style.marginTop = "8px";
  stats.innerHTML = `
    Clicks: <span style="font-weight: bold; color: #227e00;">${levelManager.getClicks()}</span> | 
    Generations: <span style="font-weight: bold; color: #94cdff;">${levelManager.getSteps()}</span> | 
    Personal Best: <span style="font-weight: bold; color: #aaa37c;">${pb !== null ? pb + " clicks" : "None yet"}</span>
  `;
  statusDiv.appendChild(stats);
}

function resetCurrentLevel() {
  const startingPattern = levelManager.getCurrentLevel();
  if (startingPattern) {
    loadIntoGrid(startingPattern);
  } else {
    const blankGrid = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(false),
    );
    loadIntoGrid(blankGrid);
  }
  levelManager.clicks = 0;
  levelManager.steps = 0;
  updateStatus();
}

function showSuccessModal() {
  let modal = document.getElementById("success-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "success-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(21, 33, 151, 0.8)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";

    const content = document.createElement("div");
    content.style.backgroundColor = "#182498";
    content.style.border = "4px solid #227e00";
    content.style.padding = "24px";
    content.style.textAlign = "center";
    content.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.6)";
    content.style.maxWidth = "360px";
    content.style.width = "90%";

    const title = document.createElement("h2");
    title.textContent = "Life Extinguished!";
    title.style.margin = "0 0 12px 0";
    title.style.color = "white";
    title.style.fontFamily = '"Inconsolata", "Courier New", Courier, monospace';

    const message = document.createElement("p");
    message.id = "success-modal-message";
    message.style.margin = "0 0 20px 0";
    message.style.color = "white";
    message.style.fontFamily =
      '"Inconsolata", "Courier New", Courier, monospace';
    message.style.lineHeight = "1.5";

    const nextBtn = document.createElement("button");
    nextBtn.id = "modal-next-button";
    nextBtn.textContent = "Next Level";
    nextBtn.style.padding = "8px 16px";
    nextBtn.style.backgroundColor = "#4a3b30";
    nextBtn.style.color = "white";
    nextBtn.style.border = "2px solid #192d05";
    nextBtn.style.cursor = "pointer";
    nextBtn.style.fontFamily = '"Courier New", Courier, monospace';
    nextBtn.style.fontSize = "1rem";
    nextBtn.style.margin = "2.5px";

    nextBtn.addEventListener("mouseover", () => {
      nextBtn.style.transform = "scale(1.05)";
    });
    nextBtn.addEventListener("mouseout", () => {
      nextBtn.style.transform = "scale(1)";
    });

    nextBtn.addEventListener("click", () => {
      modal.style.display = "none";
      loadNextLevel();
    });

    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(nextBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  const currentLevelIndex = levelManager.currentLevelIndex;
  const pb = getPB(currentLevelIndex);
  const msg = document.getElementById("success-modal-message");
  if (msg) {
    msg.textContent = `You successfully killed all life on Level ${currentLevelIndex + 1} using ${levelManager.getClicks()} clicks and ${levelManager.getSteps()} generations! Your personal best is ${pb} clicks.`;
  }

  modal.style.display = "flex";
}

function showGameCompletedModal() {
  let modal = document.getElementById("game-completed-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "game-completed-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(21, 33, 151, 0.8)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";

    const content = document.createElement("div");
    content.style.backgroundColor = "#182498";
    content.style.border = "4px solid #227e00";
    content.style.padding = "32px";
    content.style.textAlign = "center";
    content.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.6)";
    content.style.maxWidth = "360px";
    content.style.width = "90%";

    const title = document.createElement("h2");
    title.textContent = "🏆 Puzzle Master Completed! 🏆";
    title.style.margin = "0 0 16px 0";
    title.style.color = "#aaa37c";
    title.style.fontFamily = '"Inconsolata", "Courier New", Courier, monospace';

    const message = document.createElement("p");
    message.textContent =
      "Incredible job, Master! You have solved all levels in the Key to Life puzzle set.";
    message.style.margin = "0 0 24px 0";
    message.style.color = "white";
    message.style.fontFamily =
      '"Inconsolata", "Courier New", Courier, monospace';
    message.style.lineHeight = "1.5";

    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Play Again";
    restartBtn.style.padding = "10px 20px";
    restartBtn.style.backgroundColor = "#4a3b30";
    restartBtn.style.color = "white";
    restartBtn.style.border = "2px solid #192d05";
    restartBtn.style.cursor = "pointer";
    restartBtn.style.fontFamily = '"Courier New", Courier, monospace';
    restartBtn.style.fontSize = "1rem";
    restartBtn.style.margin = "2.5px";

    restartBtn.addEventListener("mouseover", () => {
      restartBtn.style.transform = "scale(1.05)";
    });
    restartBtn.addEventListener("mouseout", () => {
      restartBtn.style.transform = "scale(1)";
    });

    restartBtn.addEventListener("click", () => {
      modal.style.display = "none";
      levelManager.reset();
      loadLevel(0);
    });

    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(restartBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }
  modal.style.display = "flex";
}

function checkMatch() {
  const currentData = loadOutOfGrid();
  let hasLife = false;
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (currentData[y][x]) {
        hasLife = true;
        break;
      }
    }
    if (hasLife) {
      break;
    }
  }

  if (!hasLife) {
    if (levelManager.isPlaying) {
      stopAutoplay();
    }
    updatePB(levelManager.currentLevelIndex, levelManager.getClicks());
    showSuccessModal();
  }
}

function loadLevel(index) {
  levelManager.currentLevelIndex = index;
  levelManager.clicks = 0;
  levelManager.steps = 0;

  const targetPattern = levelManager.getCurrentLevel();
  if (targetPattern) {
    resetCurrentLevel();
  }
}

function loadNextLevel() {
  if (levelManager.currentLevelIndex < levelManager.levels.length - 1) {
    levelManager.nextLevel();
    loadLevel(levelManager.currentLevelIndex);
  } else {
    let modal = document.getElementById("success-modal");
    if (modal) {
      modal.style.display = "none";
    }
    showGameCompletedModal();
  }
}

function handleStep() {
  const currentData = loadOutOfGrid();
  const nextData = tick(currentData);
  loadIntoGrid(nextData);
  levelManager.addStep();
  updateStatus();
  checkMatch();
}

function styleCheckbox(checkbox) {
  checkbox.style.appearance = "none";
  checkbox.style.webkitAppearance = "none";
  checkbox.style.width = "22px";
  checkbox.style.height = "22px";
  checkbox.style.margin = "0";
  checkbox.style.backgroundColor = "#000000";
  checkbox.style.border = "1px solid #004444";
  checkbox.style.borderRadius = "4px";
  checkbox.style.cursor = "pointer";
  checkbox.style.transition = "all 0.15s ease-in-out";

  const updateStyle = () => {
    if (checkbox.checked) {
      checkbox.style.backgroundColor = "#00f0ff";
      checkbox.style.borderColor = "#00ffff";
      checkbox.style.boxShadow =
        "0 0 8px rgba(0, 240, 255, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.6)";
    } else {
      checkbox.style.backgroundColor = "#000000";
      checkbox.style.borderColor = "#004444";
      checkbox.style.boxShadow = "none";
    }
  };

  checkbox.addEventListener("change", updateStyle);

  const observer = new MutationObserver(() => {
    updateStyle();
  });
  observer.observe(checkbox, {
    attributes: true,
    attributeFilter: ["checked"],
  });

  const originalCheckedDescriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "checked",
  );
  Object.defineProperty(checkbox, "checked", {
    get() {
      return originalCheckedDescriptor.get.call(this);
    },
    set(value) {
      originalCheckedDescriptor.set.call(this, value);
      updateStyle();
    },
  });

  updateStyle();
}

function ensureGridExists() {
  let gridContainer = document.querySelector(".grid");
  if (!gridContainer) {
    gridContainer = document.createElement("div");
    gridContainer.className = "grid";
    gridContainer.style.display = "flex";
    gridContainer.style.flexDirection = "column";
    gridContainer.style.gap = "2px";
    gridContainer.style.width = "fit-content";
    gridContainer.style.margin = "20px auto";
    gridContainer.style.padding = "8px";
    gridContainer.style.background = "#000000";
    gridContainer.style.border = "2px solid #00ffff";

    const stepBtn = document.getElementById("step-button");
    if (stepBtn && stepBtn.parentNode) {
      stepBtn.parentNode.insertBefore(gridContainer, stepBtn);
    } else {
      document.body.appendChild(gridContainer);
    }
  }

  if (gridContainer.children.length === 0) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.gap = "2px";
      for (let x = 0; x < GRID_SIZE; x++) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        styleCheckbox(checkbox);
        checkbox.addEventListener("change", () => {
          levelManager.addClick();
          updateStatus();
          checkMatch();
        });
        row.appendChild(checkbox);
      }
      gridContainer.appendChild(row);
    }
  } else {
    for (let y = 0; y < GRID_SIZE; y++) {
      const row = gridContainer.children[y];
      if (row) {
        const checkboxes = row.querySelectorAll('input[type="checkbox"]');
        for (let x = 0; x < GRID_SIZE; x++) {
          const checkbox = checkboxes[x];
          if (checkbox) {
            const newCheckbox = checkbox.cloneNode(true);
            styleCheckbox(newCheckbox);
            newCheckbox.addEventListener("change", () => {
              levelManager.addClick();
              updateStatus();
              checkMatch();
            });
            checkbox.parentNode.replaceChild(newCheckbox, checkbox);
          }
        }
      }
    }
  }
}

function startAutoplay() {
  if (levelManager.isPlaying) {
    return;
  }
  levelManager.isPlaying = true;
  const playBtn = document.getElementById("play-button");
  if (playBtn) {
    playBtn.textContent = "⏸️ Pause";
    playBtn.style.backgroundColor = "#aaa37c";
    playBtn.style.color = "black";
  }
  levelManager.playIntervalId = setInterval(() => {
    handleStep();
  }, 150);
}

function stopAutoplay() {
  if (!levelManager.isPlaying) {
    return;
  }
  levelManager.isPlaying = false;
  if (levelManager.playIntervalId) {
    clearInterval(levelManager.playIntervalId);
    levelManager.playIntervalId = null;
  }
  const playBtn = document.getElementById("play-button");
  if (playBtn) {
    playBtn.textContent = "▶️ Play";
    playBtn.style.backgroundColor = "#4a3b30";
    playBtn.style.color = "white";
  }
}

function toggleAutoplay() {
  if (levelManager.isPlaying) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
}

function game() {
  const levels = [
    "2o$2o!",
    "o$o$o!",
    "b2o$o2bo$b2o!",
    "bo$obo$o2bo$b2o!",
    "bo$obo$bo!",
    "2o$obo$bo!",
    "2o$obo$b2o!",
    "bo$2bo$3o!",
    "o2bo$4bo$o3bo$b4o!",
    "o$3o$obo$2bo!",
    "2bo$o2bo$o2bo$bo!",
    "2b2o$2b2o$2o$2o!",
    "2o$o$b3o$3bo!",
    "4b2o$3bobo$3b2o$b2o$obo$2o!",
    "2bo$bobo$bobo$2ob2o!",
    "3bo$2b3o$b5o$2o3b2o$b5o$2b3o$3bo!",
    "3o$o2bo!",
    "7bo$6bobo$5bobo$4bobo$3bobo$2bobo$bobo$obo$bo!",
    "2ob2ob2o$2ob2ob2o2$2ob2ob2o$2ob2ob2o2$2ob2ob2o$2ob2ob2o!",
    "3o2b3o$2bo2bo$3o2b3o!",
    "3o4b3o$2bo4bo$3o4b3o!",
    "3o2b3o$obo2bobo$3o2b3o!",
    "3o2b3o$obo2bobo$3o2b3o!",
    "3bo$o5bo$b2ob2o!",
    "2b2o5b2o$3b2o3b2o$o2bobobobo2bo$3ob2ob2ob3o$bobobobobobo$2b3o3b3o2$2b3o3b3o$bobobobobobo$3ob2ob2ob3o$o2bobobobo2bo$3b2o3b2o$2b2o5b2o!",
    "2o$o$b3o$3bo!",
    "3$3b2o$3b2o2$12bo$12bo$12bo2$3b2o$3b2o!",
    "14bo2$3o7b3o2$14bo$14bo$8bo5bo$7bobo$7bo2bo$8b2o5$14bo$14bo!",
    "$6b2o$6b2o4$5bo$4bobo$4bobo$5bo3$2o8bo$bo7bobo3bo$o8b2o!",
    "4$14bo$13bobo$14bo4$11bo$12b2o$11b2o!",
    "2$5bo$4bobo$4bo2bo$5b2o3$3b2o$2bo2bo$3b2o$8bo$8bo$8bo!",
  ];
  const decodedLevels = levels.map(rleDecode);
  levelManager.addLevel(decodedLevels);

  ensureGridExists();

  const stepBtn = document.getElementById("step-button");
  if (stepBtn) {
    stepBtn.textContent = "⏭️ Step";
    stepBtn.title = "Step board by one generation";
    stepBtn.style.padding = "8px 16px";
    stepBtn.style.backgroundColor = "#4a3b30";
    stepBtn.style.color = "white";
    stepBtn.style.border = "2px solid #192d05";
    stepBtn.style.cursor = "pointer";
    stepBtn.style.fontFamily = '"Courier New", Courier, monospace';
    stepBtn.style.fontSize = "1rem";
    stepBtn.style.margin = "2.5px";

    stepBtn.addEventListener("mouseover", () => {
      stepBtn.style.transform = "scale(1.05)";
    });
    stepBtn.addEventListener("mouseout", () => {
      stepBtn.style.transform = "scale(1)";
    });

    stepBtn.addEventListener("click", () => {
      if (levelManager.isPlaying) {
        stopAutoplay();
      }
      handleStep();
    });

    let playBtn = document.getElementById("play-button");
    if (!playBtn && stepBtn.parentNode) {
      playBtn = document.createElement("button");
      playBtn.id = "play-button";
      playBtn.textContent = "▶️ Play";
      playBtn.title = "Run generations continuously";
      playBtn.style.padding = "8px 16px";
      playBtn.style.backgroundColor = "#4a3b30";
      playBtn.style.color = "white";
      playBtn.style.border = "2px solid #192d05";
      playBtn.style.cursor = "pointer";
      playBtn.style.fontFamily = '"Courier New", Courier, monospace';
      playBtn.style.fontSize = "1rem";
      playBtn.style.margin = "2.5px";

      playBtn.addEventListener("mouseover", () => {
        playBtn.style.transform = "scale(1.05)";
      });
      playBtn.addEventListener("mouseout", () => {
        playBtn.style.transform = "scale(1)";
      });

      stepBtn.parentNode.insertBefore(playBtn, stepBtn.nextSibling);
      playBtn.addEventListener("click", () => {
        toggleAutoplay();
      });
    }

    let resetBtn = document.getElementById("reset-level-button");
    if (!resetBtn && stepBtn.parentNode) {
      resetBtn = document.createElement("button");
      resetBtn.id = "reset-level-button";
      resetBtn.textContent = "🔄 Reset Level";
      resetBtn.title = "Reset pattern to starting state";
      resetBtn.style.padding = "8px 16px";
      resetBtn.style.backgroundColor = "#4a3b30";
      resetBtn.style.color = "white";
      resetBtn.style.border = "2px solid #192d05";
      resetBtn.style.cursor = "pointer";
      resetBtn.style.fontFamily = '"Courier New", Courier, monospace';
      resetBtn.style.fontSize = "1rem";
      resetBtn.style.margin = "2.5px";

      resetBtn.addEventListener("mouseover", () => {
        resetBtn.style.transform = "scale(1.05)";
      });
      resetBtn.addEventListener("mouseout", () => {
        resetBtn.style.transform = "scale(1)";
      });

      const targetSibling = playBtn ? playBtn.nextSibling : stepBtn.nextSibling;
      stepBtn.parentNode.insertBefore(resetBtn, targetSibling);
      resetBtn.addEventListener("click", () => {
        if (levelManager.isPlaying) {
          stopAutoplay();
        }
        resetCurrentLevel();
      });
    }
  }

  loadLevel(0);
}

window.addEventListener("DOMContentLoaded", () => {
  game();
});
