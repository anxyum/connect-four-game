const $playVsPlayerButton = document.querySelector(
  ".main-menu-buttons__button--primary"
);
const $playVsCpuButton = document.querySelector(
  ".main-menu-buttons__button--tertiary"
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
      '<div class="game-screen-grid__cell-wrapper"><svg style="z-index: -1" width="64" height="64" viewBox="0 0 64 64" fill="#7945FF" xmlns="http://www.w3.org/2000/svg" > <g id="Oval Copy 43" filter="url(#filter0_i_5_6370)"> <circle cx="32" cy="32" r="32" /> </g> <defs> <filter id="filter0_i_5_6370" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB" > <feFlood flood-opacity="0" result="BackgroundImageFix" /> <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" /> <feOffset dy="10" /> <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" /> <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" /> <feBlend mode="normal" in2="shape" result="effect1_innerShadow_5_6369" /> </filter> </defs> </svg></div>' +
      '<div class="game-screen-grid__cell-wrapper"><svg style="z-index: 1" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" > <g id="Oval Copy 43" filter="url(#filter0_i_5_6369)"> <circle cx="32" cy="32" r="32" /> </g> <defs> <filter id="filter0_i_5_6369" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB" > <feFlood flood-opacity="0" result="BackgroundImageFix" /> <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" /> <feOffset dy="5" /> <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" /> <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" /> <feBlend mode="normal" in2="shape" result="effect1_innerShadow_5_6369" /> </filter> </defs> </svg></div>';
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
// console.log($playVsCpuButton);
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
// console.log($playerClockPlayer);

const defaultGrid = [[], [], [], [], [], [], []];
let gameGrid = structuredClone(defaultGrid);
let currentPlayer = 1;
let firstPlayer = 1;
let winner = 0;
const maxTurnTime = 60; // en secondes
let pointerColumn = 0;
let winnerDivs = [];
let gameTree = null;
let soloGame = false;
let paused = false;

let requestId = 0;
const pendingRequests = new Map();

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
  if (soloGame) {
    $playerClockPlayer.textContent = {
      1: "YOUR TURN",
      "-1": "CPU’S TURN",
    }[player];
  } else {
    $playerClockPlayer.textContent = {
      1: "PLAYER 1’S TURN",
      "-1": "PLAYER 2’S TURN",
    }[player];
  }
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
  if (soloGame) {
    if (currentPlayer === -1) {
      placeInGrid(3);
    }
    initializeEstimation(gameGrid, -1, 1, 1000);
  }
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
  paused = false;
}

function resetPlayerClock() {
  $playerClock.textContent = maxTurnTime;
  function countDown(s) {
    if (s == $playerClock.textContent) {
      if (!paused) {
        if (s === 0) {
          winner = -currentPlayer + 2;
          updateWinner(winner);
        }
        $playerClock.textContent = $playerClock.textContent - 1;
        setTimeout(countDown, 1000, s - 1);
      } else {
        setTimeout(countDown, 1000, s);
      }
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

    if (soloGame) {
      document.querySelector(".game-screen-winner").textContent = {
        3: "YOU",
        1: "CPU",
      }[winner];
    } else {
      document.querySelector(".game-screen-winner").textContent = {
        3: "PLAYER 1",
        1: "PLAYER 2",
      }[winner];
    }

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
    document
      .querySelector(".game-screen-winner-container")
      .classList.remove("hidden");

    const cells = findWin(gameGrid);
    cells.forEach((cell) => {
      const $cell = $gridColumns[cell.x].querySelectorAll(
        ".game-screen-grid__cell"
      )[5 - cell.y];
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
    paused = true;
  }
}

function placeInGrid(column) {
  if (winner > 0) return false;
  if (gameGrid[column].length < 6) {
    gameGrid[column].push(currentPlayer);
    currentPlayer = -currentPlayer;
    resetPlayerClock();
    drawColumn(gameGrid, column);
    updatePlayerTurn(currentPlayer);
    winner = checkWin(gameGrid);
    updateWinner(winner);
    return true;
  }
  return false;
}

const estimationWorker = new Worker("js/estimationWorker.js");

estimationWorker.onmessage = (e) => {
  const { id, data } = e.data;
  if (pendingRequests.has(id)) {
    pendingRequests.get(id)(data);
    pendingRequests.delete(id);
  }
};

function postMessageWithPromise(type, args) {
  return new Promise((resolve) => {
    const id = requestId++;
    pendingRequests.set(id, resolve);
    estimationWorker.postMessage({ id, type, args });
  });
}

function initializeEstimation(...args) {
  return postMessageWithPromise("initializeEstimation", args);
}

function continueEstimation(...args) {
  return postMessageWithPromise("continueEstimation", args);
}

function getBestMove(...args) {
  return postMessageWithPromise("chooseBestMove", args);
}

function updateEstimation(...args) {
  return postMessageWithPromise("placeInGrid", args);
}

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

  document.querySelector(
    ".game-screen-player-points--player-one .game-screen-player-points-icon"
  ).innerHTML =
    '<svg width="54" height="59" viewBox="0 0 54 59" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="you"><circle id="Oval Copy 21" cx="27" cy="27" r="27" transform="matrix(-1 0 0 1 54 0)" fill="black"/><circle id="Oval Copy 40" cx="27" cy="27" r="27" transform="matrix(-1 0 0 1 54 5)" fill="black"/><circle id="Oval Copy 11" cx="24" cy="24" r="24" transform="matrix(-1 0 0 1 51 3)" fill="#FD6687"/><g id="Group 22"><path id="Oval Copy 11_2" d="M12.75 25.25C12.75 32.7058 18.7942 38.75 26.25 38.75C33.7058 38.75 39.75 32.7058 39.75 25.25H36.75C36.75 31.049 32.049 35.75 26.25 35.75C20.451 35.75 15.75 31.049 15.75 25.25H12.75Z" fill="black"/><g id="Group 7"><path id="Path" d="M30 17V22.9844H33V17H30Z" fill="black"/><path id="Path Copy" d="M20 17V22.9844H23V17H20Z" fill="black"/></g></g></g></svg>';
  document.querySelector(
    ".game-screen-player-points--player-two .game-screen-player-points-icon"
  ).innerHTML =
    '<svg width="54" height="59" viewBox="0 0 54 59" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="cpu"><circle id="Oval Copy 21" cx="27" cy="27" r="27" transform="matrix(-1 0 0 1 54 0)" fill="black"/><circle id="Oval Copy 40" cx="27" cy="27" r="27" transform="matrix(-1 0 0 1 54 5)" fill="black"/><circle id="Oval Copy 11" cx="24" cy="24" r="24" transform="matrix(-1 0 0 1 51 3)" fill="#FFCE67"/><g id="Group 8"><g id="Group 7"><g id="Group 9"><g id="Group 10"><path id="Path Copy" d="M35.5 17V20H29.5V17H35.5Z" fill="black"/><path id="Path Copy 2" d="M24.5 17V20H18.5V17H24.5Z" fill="black"/><path id="Path 2" d="M39 24V27H15V24H39Z" fill="black"/></g></g></g></g></g></svg>';
  document.querySelector(
    ".game-screen-player-points--player-one .game-screen-player-points-player"
  ).textContent = "YOU";
  document.querySelector(
    ".game-screen-player-points--player-two .game-screen-player-points-player"
  ).textContent = "CPU";

  soloGame = true;
  resetGame();
  initializeEstimation(gameGrid, -1, 1, 1000);
});

$playVsPlayerButton.addEventListener("click", () => {
  document.querySelector(".main-menu-screen").classList.add("hidden");
  document.querySelector(".game-screen").classList.remove("hidden");

  document.querySelector(
    ".game-screen-player-points--player-one .game-screen-player-points-icon"
  ).innerHTML =
    '<svg width="54" height="59" viewBox="0 0 54 59" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="player-one"><circle id="Oval Copy 21" cx="27" cy="27" r="27" fill="black"/><circle id="Oval Copy 40" cx="27" cy="32" r="27" fill="black"/><circle id="Oval Copy 11" cx="27" cy="27" r="24" fill="#FD6687"/><g id="Group 8"><path id="Oval Copy 11_2" d="M45.25 25C45.25 32.4558 39.2058 38.5 31.75 38.5C24.2942 38.5 18.25 32.4558 18.25 25H21.25C21.25 30.799 25.951 35.5 31.75 35.5C37.549 35.5 42.25 30.799 42.25 25H45.25Z" fill="black"/><g id="Group 7"><path id="Path" d="M30.75 17V22.9844H27.75V17H30.75Z" fill="black"/><path id="Path Copy" d="M40.75 17V22.9844H37.75V17H40.75Z" fill="black"/></g></g></g></svg>';
  document.querySelector(
    ".game-screen-player-points--player-two .game-screen-player-points-icon"
  ).innerHTML =
    '<svg width="54" height="59" viewBox="0 0 54 59" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="player-two"><circle id="Oval Copy 21" cx="27" cy="27" r="27" transform="matrix(-1 0 0 1 54 0)" fill="black"/><circle id="Oval Copy 40" cx="27" cy="27" r="27" transform="matrix(-1 0 0 1 54 5)" fill="black"/><circle id="Oval Copy 11" cx="24" cy="24" r="24" transform="matrix(-1 0 0 1 51 3)" fill="#FFCE67"/><g id="Group 8"><path id="Oval Copy 11_2" d="M8.75 25C8.75 32.4558 14.7942 38.5 22.25 38.5C29.7058 38.5 35.75 32.4558 35.75 25H32.75C32.75 30.799 28.049 35.5 22.25 35.5C16.451 35.5 11.75 30.799 11.75 25H8.75Z" fill="black"/><g id="Group 7"><path id="Path" d="M23.25 17V22.9844H26.25V17H23.25Z" fill="black"/><path id="Path Copy" d="M13.25 17V22.9844H16.25V17H13.25Z" fill="black"/></g></g></g></svg>';
  document.querySelector(
    ".game-screen-player-points--player-one .game-screen-player-points-player"
  ).textContent = "PLAYER 1";
  document.querySelector(
    ".game-screen-player-points--player-two .game-screen-player-points-player"
  ).textContent = "PLAYER 2";

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
  paused = true;
});

$restartButton.addEventListener("click", () => {
  resetGrid();
  currentPlayer = firstPlayer;
  updatePlayerTurn(currentPlayer);
});

$ingameMenuContinueButton.addEventListener("click", () => {
  document.querySelector(".ingame-menu-screen").classList.add("hidden");
  paused = false;
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
  paused = false;
});

$gridColumns.forEach(($column) => {
  $column.addEventListener("click", () => {
    let columnId = $column.getAttribute("data-column-id");
    if (soloGame && currentPlayer === 1) {
      if (placeInGrid(columnId) && winner === -1) {
        updateEstimation(columnId)
          .then(() => continueEstimation(3000))
          .then(() => getBestMove())
          .then((columnId) => {
            placeInGrid(columnId);
            return updateEstimation(columnId);
          });
      }
    } else if (!soloGame) {
      placeInGrid(columnId);
    }
  });

  $column.addEventListener("mouseenter", () => {
    const columnId = $column.getAttribute("data-column-id");
    pointerColumn = parseInt(columnId);
    updatePlayerPointer(currentPlayer, pointerColumn);
  });
});
