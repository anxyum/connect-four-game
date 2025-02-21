self.checkWin = function (grid) {
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
};

self.EstimationNode = class {
  constructor(grid, player, currentPlayer, depth, parent, play) {
    this.parent = parent;
    this.grid = grid;
    this.currentPlayer = currentPlayer;
    this.player = player;
    this.play = play;
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
      reCalculateValue(this.parent);
    }
  }
};

self.initializeEstimation = function (grid, player, currentPlayer, maxTime) {
  const startTime = Date.now();
  const root = new EstimationNode(grid, player, currentPlayer, 0, null, null);
  const queue = [root];

  while (queue.length > 0 && Date.now() - startTime < maxTime) {
    const node = queue.shift();
    if (node.value === null) {
      for (let i = 0; i < 7; i++) {
        const childGrid = structuredClone(node.grid);
        if (childGrid[i].length < 6) {
          childGrid[i].push(node.currentPlayer);
          const childNode = new EstimationNode(
            childGrid,
            node.player,
            -node.currentPlayer,
            node.depth + 1,
            node,
            i
          );
          node.children.push(childNode);
          queue.push(childNode);
        }
      }
    }
  }
  return root;
};

self.continueEstimation = function (root, maxTime) {
  const startTime = Date.now();
  const queue = [];

  function enqueue(node) {
    if (node.children.length === 0) {
      queue.push(node);
    } else {
      node.children.forEach((child) => {
        enqueue(child);
      });
    }
  }

  enqueue(root);
  queue.sort((a, b) => a.depth - b.depth);

  while (queue.length > 0 && Date.now() - startTime < maxTime) {
    const node = queue.shift();
    if (node.value === null) {
      for (let i = 0; i < 7; i++) {
        const childGrid = structuredClone(node.grid);
        if (childGrid[i].length < 6) {
          childGrid[i].push(node.currentPlayer);
          const childNode = new EstimationNode(
            childGrid,
            node.player,
            -node.currentPlayer,
            node.depth + 1,
            node,
            i
          );
          node.children.push(childNode);
          queue.push(childNode);
        }
      }
    }
  }
};

self.chooseBestMove = function (node) {
  if (node.currentPlayer === 1) {
    return node.children.reduce((bestChild, child) => {
      return child.value > bestChild.value ? child : bestChild;
    }).play;
  } else {
    return node.children.reduce((bestChild, child) => {
      return child.value < bestChild.value ? child : bestChild;
    }).play;
  }
};

self.reCalculateValue = function (node) {
  const childValues = node.children.map((child) =>
    child.value === null ? 0 : child.value
  );
  if (childValues.length === 0) return;

  const average =
    childValues.reduce((sum, value) => sum + value, 0) / childValues.length;

  let bestValue;
  if (node.player === 1) {
    bestValue = Math.max(...childValues);
  } else {
    bestValue = Math.min(...childValues);
  }

  const weight = node.currentPlayer === node.player ? 0.9 : 0;
  const newValue = weight * bestValue + (1 - weight) * average;

  if (node.value !== newValue) {
    node.value = newValue;
    if (node.parent) {
      reCalculateValue(node.parent);
    }
  }
};
