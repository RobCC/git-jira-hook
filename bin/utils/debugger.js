let DEBUG_MODE = false;

function setDebugMode(on) {
  DEBUG_MODE = on;
}

function log(...messages) {
  if (!DEBUG_MODE) {
    return;
  }

  console.log('[DEBUG]', ...messages)
}

module.exports = {
  setDebugMode: setDebugMode,
  log: log
};
