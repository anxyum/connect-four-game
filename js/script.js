const $playVsPlayerButton = document.querySelector(
  ".main-menu-buttons__button--primary"
);
const $rulesButton = document.querySelector(
  ".main-menu-buttons__button--secondary"
);
const $rulesCloseButton = document.querySelector(".rules__close-button");

const $grid = document.querySelectorAll(".game-screen-grid-column");
const $playerPointer = document.querySelector(".game-screen-player-pointer");

// console.log($playVsPlayerButton);
// console.log($rulesButton);
// console.log($rulesCloseButton);
// console.log($grid);
// console.log($playerPointer);

const defaultGrid = [[], [], [], [], [], [], []];
let gameGrid = structuredClone(defaultGrid);
let currentPlayer = 1;

function redrawGrid(grid) {
  for (let i = 0; i < grid.length; i++) {
    drawColumn(grid, i);
  }
}

function drawColumn(grid, columnId) {
  const column = grid[columnId];
  const $columnCells = $grid[columnId].querySelectorAll(
    ".game-screen-grid__cell"
  );
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
    const line = [
      grid[0][i] || 0,
      grid[1][i] || 0,
      grid[2][i] || 0,
      grid[3][i] || 0,
      grid[4][i] || 0,
      grid[5][i] || 0,
      grid[6][i] || 0,
    ];

    for (let j = 0; j < 4; j++) {
      perfCounter++;
      if (
        line[j] === line[j + 1] &&
        line[j + 1] === line[j + 2] &&
        line[j + 2] === line[j + 3]
      ) {
        return line[j] + 2;
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

function updatePlayerPointer(player) {
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
}

function resetGame() {
  gameGrid = structuredClone(defaultGrid);
  redrawGrid(gameGrid);
  updatePlayerPointer(currentPlayer);
}

$playVsPlayerButton.addEventListener("click", () => {
  document.querySelector(".main-menu-screen").classList.add("hidden");
  document.querySelector(".game-screen").classList.remove("hidden");
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

$grid.forEach(($column) => {
  $column.addEventListener("click", () => {
    const columnId = $column.getAttribute("data-column-id");

    if (gameGrid[columnId].length < 6) {
      gameGrid[columnId].push(currentPlayer);
      currentPlayer = -currentPlayer;
    }
    drawColumn(gameGrid, columnId);
    console.log(checkWin(gameGrid));
    updatePlayerPointer(currentPlayer);
  });

  $column.addEventListener("mouseenter", () => {
    $playerPointer.style.left = `${
      $column.offsetLeft +
      $column.clientWidth / 2 -
      $playerPointer.clientWidth / 2
    }px`;
  });
});
