importScripts("./functions.js");
let root;

self.onmessage = function (event) {
  const { id, type, args } = event.data;
  switch (type) {
    case "initializeEstimation":
      root = initializeEstimation(...args);
      self.postMessage({ id });
      break;
    case "continueEstimation":
      continueEstimation(root, ...args);
      self.postMessage({ id });
      break;
    case "placeInGrid":
      root.children.forEach((child) => {
        if (child.play == args[0]) {
          root = child;
          root.parent = null;
        }
      });
      self.postMessage({ id });
      break;
    case "chooseBestMove":
      const bestMove = chooseBestMove(root, ...args);
      self.postMessage({ id, data: bestMove });
      break;
  }
};
