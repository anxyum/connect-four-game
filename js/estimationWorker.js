class EstimationNode {
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
      this.parent.reCalculateValue();
    }
  }

  reCalculateValue() {
    const currentValue = this.value;
    const childValues = this.children.map((child) => child.value || 0);

    if (childValues.length === 0) {
      return;
    }

    if (this.currentPlayer === this.player) {
      if (this.currentPlayer === 1) {
        this.value = Math.max(...childValues);
      } else {
        this.value = Math.min(...childValues);
      }
    } else {
      if (this.currentPlayer === 1) {
        this.value = Math.min(...childValues);
      } else {
        this.value = Math.max(...childValues);
      }
    }

    if (this.value === Infinity) {
      console.log("Infinity");
      console.log(childValues);
      console.log(this);
      return;
    }

    if (this.parent !== null && this.value !== currentValue) {
      this.parent.reCalculateValue();
    }
  }

  continueEstimation(maxTime) {
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

    enqueue(this);
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
  }

  chooseBestMove() {
    if (this.currentPlayer === 1) {
      return this.children.reduce((bestChild, child) => {
        return child.value > bestChild.value ? child : bestChild;
      }).play;
    } else {
      return this.children.reduce((bestChild, child) => {
        return child.value < bestChild.value ? child : bestChild;
      }).play;
    }
  }
}

function initializeEstimations(grid, player, currentPlayer, maxTime) {
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
}

self.onmessage = function (event) {
  try {
    const [func, ...args] = event.data;
    console.log(func);
    console.log(args);
    switch (func) {
      case "initializeEstimation":
        const result = initializeEstimations(...args);
        self.postMessage(result);
        break;
    }
  } catch (error) {
    console.log(error);
  }
};
