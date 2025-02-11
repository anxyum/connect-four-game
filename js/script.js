const $grid = document.querySelectorAll(".game-screen-grid-column");

console.log($grid);

let gameGrid = [[], [], [], [], [], [], []];
let currentPlayer = 1;

function redrawGrid(grid) {
  for (let i = 0; i < gameGrid.length; i++) {
    const column = gameGrid[i];
    const $columnCells = $grid[i].querySelectorAll(".game-screen-grid__cell");
    for (let j = 0; j < column.length; j++) {
      console.log($columnCells);
      console.log($columnCells[5 - j]);
      $columnCells[5 - j].classList.add(
        {
          1: "game-screen-grid__cell--red",
          "-1": "game-screen-grid__cell--yellow",
        }[column[j]]
      );
    }
  }
}

$grid.forEach(($column) => {
  $column.addEventListener("click", () => {
    const column = $column.getAttribute("data-column-id");
    console.log(column);

    if (gameGrid[column].length < 6) {
      gameGrid[column].push(currentPlayer);
      console.log(gameGrid);
      currentPlayer = -currentPlayer;
    }
    redrawGrid(gameGrid);
  });
});
