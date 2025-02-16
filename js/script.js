const $playVsPlayerButton = document.querySelector(
  ".main-menu-buttons__button--primary"
);
const $rulesButton = document.querySelector(
  ".main-menu-buttons__button--secondary"
);
const $rulesCloseButton = document.querySelector(".rules__close-button");

const $grid = document.querySelector(".game-screen-grid");

// créer la grille
for (let i = 0; i < 7; i++) {
  const $column = document.createElement("ul");
  $column.setAttribute("data-column-id", i);
  $column.classList.add("game-screen-grid-column");
  for (let j = 0; j < 6; j++) {
    const $cell = document.createElement("li");
    $cell.innerHTML =
      '<div class="game-screen-grid__cell-wrapper"><svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" > <g id="Oval Copy 43" filter="url(#filter0_i_5_6369)"> <circle cx="32" cy="32" r="32" /> </g> <defs> <filter id="filter0_i_5_6369" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB" > <feFlood flood-opacity="0" result="BackgroundImageFix" /> <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" /> <feOffset dy="5" /> <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" /> <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" /> <feBlend mode="normal" in2="shape" result="effect1_innerShadow_5_6369" /> </filter> </defs> </svg></div>';
    $cell.classList.add("game-screen-grid__cell");
    $column.appendChild($cell);
  }
  $grid.appendChild($column);
}
const $gridColumns = document.querySelectorAll(".game-screen-grid-column");

const $playerPointer = document.querySelector(".game-screen-player-pointer");
const $winnerIndicator = document.querySelector(
  ".game-screen-winner-indicator"
);
const $ingameMenuButton = document.querySelector(".game-screen-button__menu");
const $restartButton = document.querySelector(".game-screen-button__restart");

const $ingameMenuContinueButton = document.querySelector(
  ".ingame-menu-button__continue"
);
const $ingameMenuRestartButton = document.querySelector(
  ".ingame-menu-button__restart"
);
const $ingameMenuQuitButton = document.querySelector(
  ".ingame-menu-button__quit"
);
const $playAgainButton = document.querySelector(
  ".game-screen-winner__play-again"
);
const $playerClockContainer = document.querySelector(
  ".game-screen-player-clock-container"
);
const $playerClock = document.querySelector(
  ".game-screen-player-clock .game-screen-player-clock__clock"
);
const $playerClockPlayer = document.querySelector(
  ".game-screen-player-clock-player"
);

// console.log($playVsPlayerButton);
// console.log($rulesButton);
// console.log($rulesCloseButton);

// console.log($grid);
// console.log($playerPointer);
// console.log($ingameMenuButton);
// console.log($restartButton);

// console.log($ingameMenuContinueButton);
// console.log($ingameMenuRestartButton);
// console.log($ingameMenuQuitButton);
// console.log($playAgainButton);
// console.log($playerClockContainer);
// console.log($playerClock);

const defaultGrid = [[], [], [], [], [], [], []];
let gameGrid = structuredClone(defaultGrid);
let currentPlayer = 1;
let firstPlayer = 1;
let winner = 0;
const maxTurnTime = 30; // en secondes
let pointerColumn = 0;
let winnerDivs = [];
let gameTree = null;
let soloGame = false;

function redrawGrid(grid) {
  for (let i = 0; i < grid.length; i++) {
    drawColumn(grid, i);
  }
}

function drawColumn(grid, columnId) {
  const column = grid[columnId];
  const $columnCells = $gridColumns[columnId].querySelectorAll(
    ".game-screen-grid__cell"
  );
  $columnCells.forEach(($cell) => {
    $cell.classList.remove(
      "game-screen-grid__cell--red",
      "game-screen-grid__cell--yellow"
    );
  });
  for (let i = 0; i < column.length; i++) {
    $columnCells[5 - i].classList.add(
      {
        1: "game-screen-grid__cell--red",
        "-1": "game-screen-grid__cell--yellow",
      }[column[i]]
    );
  }
}

function checkWin(grid) {
  let perfCounter = 0;

  // verifie les lignes
  for (let i = 0; i < grid[3].length; i++) {
    for (let j = 0; j < 4; j++) {
      perfCounter++;
      if (
        grid[j][i] === grid[j + 1][i] &&
        grid[j + 1][i] === grid[j + 2][i] &&
        grid[j + 2][i] === grid[j + 3][i]
      ) {
        return grid[j][i] + 2;
      }
    }
  }

  const gridHeight = Math.max(...grid.map((column) => column.length));
  if (gridHeight < 4) return -1;

  // verifie les colonnes
  for (let i = 0; i < grid.length; i++) {
    const column = grid[i];
    if (column.length < 4) continue;
    for (let j = 0; j < column.length - 3; j++) {
      perfCounter++;
      if (
        column[j] === column[j + 1] &&
        column[j + 1] === column[j + 2] &&
        column[j + 2] === column[j + 3]
      )
        return column[j] + 2;
    }
  }

  // verifie les diagonales
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < gridHeight - 3; j++) {
      perfCounter++;
      if (
        grid[i][j] &&
        grid[i][j] === grid[i + 1][j + 1] &&
        grid[i + 1][j + 1] === grid[i + 2][j + 2] &&
        grid[i + 2][j + 2] === grid[i + 3][j + 3]
      ) {
        return grid[i][j] + 2;
      }
    }
  }
  for (let i = 0; i < 4; i++) {
    for (let j = 3; j < gridHeight; j++) {
      perfCounter++;
      if (
        grid[i][j] &&
        grid[i][j] === grid[i + 1][j - 1] &&
        grid[i + 1][j - 1] === grid[i + 2][j - 2] &&
        grid[i + 2][j - 2] === grid[i + 3][j - 3]
      ) {
        return grid[i][j] + 2;
      }
    }
  }

  if (grid.flat().length === 42) return 0;

  return -1;
}

function findWin(grid) {
  let perfCounter = 0;

  // verifie les lignes
  for (let i = 0; i < grid[3].length; i++) {
    for (let j = 0; j < 4; j++) {
      perfCounter++;
      if (
        grid[j][i] === grid[j + 1][i] &&
        grid[j + 1][i] === grid[j + 2][i] &&
        grid[j + 2][i] === grid[j + 3][i]
      ) {
        return [
          { x: j, y: i },
          { x: j + 1, y: i },
          { x: j + 2, y: i },
          { x: j + 3, y: i },
        ];
      }
    }
  }

  // verifie les colonnes
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].length < 4) continue;
    for (let j = 0; j < grid[i].length - 3; j++) {
      perfCounter++;
      if (
        grid[i][j] === grid[i][j + 1] &&
        grid[i][j + 1] === grid[i][j + 2] &&
        grid[i][j + 2] === grid[i][j + 3]
      )
        return [
          { x: i, y: j },
          { x: i, y: j + 1 },
          { x: i, y: j + 2 },
          { x: i, y: j + 3 },
        ];
    }
  }

  // verifie les diagonales
  const gridHeight = Math.max(...grid.map((column) => column.length));
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < gridHeight - 3; j++) {
      perfCounter++;
      if (
        grid[i][j] &&
        grid[i][j] === grid[i + 1][j + 1] &&
        grid[i + 1][j + 1] === grid[i + 2][j + 2] &&
        grid[i + 2][j + 2] === grid[i + 3][j + 3]
      ) {
        return [
          { x: i, y: j },
          { x: i + 1, y: j + 1 },
          { x: i + 2, y: j + 2 },
          { x: i + 3, y: j + 3 },
        ];
      }
    }
  }
  for (let i = 0; i < 4; i++) {
    for (let j = 3; j < gridHeight; j++) {
      perfCounter++;
      if (
        grid[i][j] &&
        grid[i][j] === grid[i + 1][j - 1] &&
        grid[i + 1][j - 1] === grid[i + 2][j - 2] &&
        grid[i + 2][j - 2] === grid[i + 3][j - 3]
      ) {
        return [
          { x: i, y: j },
          { x: i + 1, y: j - 1 },
          { x: i + 2, y: j - 2 },
          { x: i + 3, y: j - 3 },
        ];
      }
    }
  }

  return [];
}

function updatePlayerPointer(player, columnId) {
  const $column = $gridColumns[columnId];
  $playerPointer.classList.remove(
    {
      1: "game-screen-player-pointer--yellow",
      "-1": "game-screen-player-pointer--red",
    }[player]
  );
  $playerPointer.classList.add(
    {
      1: "game-screen-player-pointer--red",
      "-1": "game-screen-player-pointer--yellow",
    }[player]
  );

  $playerPointer.style.left = `${
    $column.offsetLeft +
    $column.clientWidth / 2 -
    $playerPointer.clientWidth / 2
  }px`;
}

function updatePlayerTurn(player) {
  updatePlayerPointer(player, pointerColumn);
  $playerClockContainer.classList.remove(
    {
      "-1": "game-screen-player-clock-container--red",
      1: "game-screen-player-clock-container--yellow",
    }[player]
  );
  $playerClockContainer.classList.add(
    {
      1: "game-screen-player-clock-container--red",
      "-1": "game-screen-player-clock-container--yellow",
    }[player]
  );
  $playerClockPlayer.textContent = {
    1: "PLAYER 1’S TURN",
    "-1": "PLAYER 2’S TURN",
  }[player];
}

function resetGrid() {
  gameGrid = structuredClone(defaultGrid);
  redrawGrid(gameGrid);
  updatePlayerTurn(currentPlayer);
  winner = 0;
  $winnerIndicator.classList.remove("game-screen-winner-indicator--red");
  $winnerIndicator.classList.remove("game-screen-winner-indicator--yellow");
  document
    .querySelector(".game-screen-winner-container")
    .classList.add("hidden");
  $playerClockContainer.classList.remove("hidden");
  resetPlayerClock();
  winnerDivs.forEach((div) => {
    div.remove();
  });
  winnerDivs = [];
}

function resetGame() {
  resetGrid();
  firstPlayer = 1;
  currentPlayer = firstPlayer;
  updatePlayerTurn(currentPlayer);

  let $truc1 = document.querySelector(
    ".game-screen-player-points--player-two .game-screen-player-points-score"
  );
  $truc1.textContent = 0;

  let $truc2 = document.querySelector(
    ".game-screen-player-points--player-one .game-screen-player-points-score"
  );
  $truc2.textContent = 0;

  document
    .querySelector(".game-screen-winner-container")
    .classList.add("hidden");
}

function resetPlayerClock() {
  $playerClock.textContent = maxTurnTime;
  function countDown(s) {
    if (s == $playerClock.textContent) {
      if (s === 0) {
        winner = -currentPlayer + 2;
        updateWinner(winner);
      }
      setTimeout(countDown, 1000, s - 1);
      $playerClock.textContent = $playerClock.textContent - 1;
    }
  }
  setTimeout(countDown, 1000, maxTurnTime);
}

function updateWinner(winner) {
  if (winner > 0) {
    $winnerIndicator.classList.add(
      {
        1: "game-screen-winner-indicator--yellow",
        3: "game-screen-winner-indicator--red",
      }[winner]
    );

    document.querySelector(".game-screen-winner").textContent = {
      3: "PLAYER 1",
      1: "PLAYER 2",
    }[winner];

    truc1 = {
      1: () => {
        let $truc2 = document.querySelector(
          ".game-screen-player-points--player-two .game-screen-player-points-score"
        );
        $truc2.textContent = parseInt($truc2.textContent) + 1;
      },
      3: () => {
        let $truc2 = document.querySelector(
          ".game-screen-player-points--player-one .game-screen-player-points-score"
        );
        $truc2.textContent = parseInt($truc2.textContent) + 1;
      },
    };

    truc1[winner]();

    $playerClockContainer.classList.add("hidden");
    console.log("winner");
    document
      .querySelector(".game-screen-winner-container")
      .classList.remove("hidden");

    const cells = findWin(gameGrid);
    cells.forEach((cell) => {
      const $cell = $gridColumns[cell.x].querySelectorAll(
        ".game-screen-grid__cell"
      )[5 - cell.y];
      console.log($cell);
      const $div = document.createElement("div");
      $div.classList.add("game-screen-grid__cell-wrapper");
      $div.innerHTML = `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="17" cy="17" r="14" stroke="white" stroke-width="6" fill="none"/></svg>`;
      winnerDivs.push($div);
      $cell.appendChild($div);
    });
  } else if (winner === 0) {
    document.querySelector(".game-screen-winner").textContent = "NOBODY";
    $playerClockContainer.classList.add("hidden");

    document
      .querySelector(".game-screen-winner-container")
      .classList.remove("hidden");
  }

  if (winner >= 0) {
    firstPlayer = -firstPlayer;
    currentPlayer = firstPlayer;
    updatePlayerTurn(currentPlayer);
  }
}

function placeInGrid(column) {
  if (winner > 0) return;
  if (gameGrid[column].length < 6) {
    gameGrid[column].push(currentPlayer);
    currentPlayer = -currentPlayer;
    resetPlayerClock();
    drawColumn(gameGrid, column);
    updatePlayerTurn(currentPlayer);
    winner = checkWin(gameGrid);
    updateWinner(winner);
  }
}

class Node {
  constructor(grid, player, depth, parent) {
    this.parent = parent;
    this.grid = grid;
    this.player = player;
    this.depth = depth;
    this.children = [];
    this.value = null;
    const gridValue = checkWin(grid);
    if (gridValue === 0) {
      this.value = 0;
    } else if (gridValue > 0) {
      this.value = gridValue - 2;
    }
    if (this.value !== null && this.parent !== null) {
      this.parent.reCalculateValue();
    }
  }

  reCalculateValue() {
    if (checkWin(this.grid) !== -1) {
      return;
    }

    const childValues = this.children.map((child) => child.value);
    if (this.player === 1) {
      this.value = Math.max(...childValues);
    } else {
      this.value = Math.min(...childValues);
    }
    if (this.parent !== null) {
      this.parent.reCalculateValue();
    }
    return this.value;
  }
}

function estimateBoardValue(grid, player, maxTime, maxDepth) {
  const root = new Node(grid, player, 0, null);
  const queue = [root];
  const startTime = Date.now();
  let currentNode = root;
  while (queue.length > 0) {
    currentNode = queue.shift();
    if (currentNode.value !== null) {
      continue;
    }
    if (Date.now() - startTime > maxTime || currentNode.depth >= maxDepth) {
      break;
    }
    for (let i = 0; i < 7; i++) {
      if (currentNode.grid[i].length < 6) {
        const childGrid = structuredClone(currentNode.grid);
        childGrid[i].push(currentNode.player);
        const childNode = new Node(
          childGrid,
          -currentNode.player,
          currentNode.depth + 1,
          currentNode
        );
        currentNode.children.push(childNode);
        queue.push(childNode);
      }
    }
  }
  return root;
}

// console.log(estimateBoardValue(gameGrid, 1, 2000, 100));

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      pointerColumn = Math.max(pointerColumn - 1, 0);
      updatePlayerPointer(currentPlayer, pointerColumn);
    } else if (e.key === "ArrowRight") {
      pointerColumn = Math.min(pointerColumn + 1, 6);
      updatePlayerPointer(currentPlayer, pointerColumn);
    } else if (e.key === "Enter") {
      placeInGrid(pointerColumn);
    }
  });

  $playVsCpuButton.addEventListener("click", () => {
    document.querySelector(".main-menu-screen").classList.add("hidden");
    document.querySelector(".game-screen").classList.remove("hidden");
    soloGame = true;
    resetGame();
  });

  $playVsPlayerButton.addEventListener("click", () => {
    document.querySelector(".main-menu-screen").classList.add("hidden");
    document.querySelector(".game-screen").classList.remove("hidden");
    soloGame = false;
    resetGame();
  });

  $rulesButton.addEventListener("click", () => {
    document.querySelector(".main-menu-screen").classList.add("hidden");
    document.querySelector(".rules-screen").classList.remove("hidden");
  });

  $rulesCloseButton.addEventListener("click", () => {
    document.querySelector(".rules-screen").classList.add("hidden");
    document.querySelector(".main-menu-screen").classList.remove("hidden");
  });

  $ingameMenuButton.addEventListener("click", () => {
    document.querySelector(".ingame-menu-screen").classList.remove("hidden");
  });

  $restartButton.addEventListener("click", () => {
    resetGrid();
    currentPlayer = firstPlayer;
    updatePlayerTurn(currentPlayer);
  });

  $ingameMenuContinueButton.addEventListener("click", () => {
    document.querySelector(".ingame-menu-screen").classList.add("hidden");
  });

  $ingameMenuRestartButton.addEventListener("click", () => {
    resetGame();
    currentPlayer = firstPlayer;
    updatePlayerTurn(currentPlayer);
    document.querySelector(".ingame-menu-screen").classList.add("hidden");
  });

  $ingameMenuQuitButton.addEventListener("click", () => {
    document.querySelector(".ingame-menu-screen").classList.add("hidden");
    document.querySelector(".game-screen").classList.add("hidden");
    document.querySelector(".main-menu-screen").classList.remove("hidden");
  });

  $playAgainButton.addEventListener("click", () => {
    document
      .querySelector(".game-screen-winner-container")
      .classList.add("hidden");
    resetGrid();
  });

  $gridColumns.forEach(($column) => {
    $column.addEventListener("click", () => {
      const columnId = $column.getAttribute("data-column-id");
      placeInGrid(columnId);
    });

    $column.addEventListener("mouseenter", () => {
      const columnId = $column.getAttribute("data-column-id");
      pointerColumn = parseInt(columnId);
      updatePlayerPointer(currentPlayer, pointerColumn);
    });
  });
});
