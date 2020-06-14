const RESET = '\u001b[0m';
const BOLD = '\u001b[1m';
const GRAY = '\u001b[0;90m';
const GREEN = '\u001b[1;92m';
const RED = '\u001b[1;31m';
const YELLOW = '\u001b[1;33m';
const BLUE = '\u001b[1;34m';

const NEW_LINE = '\n';
const PREFIX_LOADING = GRAY + '⧗   ' + RESET;
const PREFIX_SUCCESS = GREEN + '✔   ' + RESET;
const PREFIX_ERROR = RED + '✖   ' + RESET;
const PREFIX_WARN = YELLOW + '⚠   ' + RESET;
const PREFIX_INFO = BLUE + 'ⓘ   ' + RESET;

function genMessage(type, message, isFinal = false) {
  let fullMessage = (isFinal ? NEW_LINE : '');
  switch (type) {
    case 'loading':
      fullMessage += PREFIX_LOADING;
      break;
    case 'success':
      fullMessage += PREFIX_SUCCESS;
      break;
    case 'error':
      fullMessage += PREFIX_ERROR;
      break;
    case 'warn':
      fullMessage += PREFIX_WARN;
      break;
    case 'info':
      fullMessage += PREFIX_INFO;
      break;
    default:
      fullMessage += BOLD + message + RESET;
  }

  if (isFinal) {
    fullMessage += BOLD;
  }

  fullMessage += message + RESET;

  return fullMessage;
}

function genNote(note) {
  return GRAY + note + RESET;
}

function log(type, message, note, isFinal) {
  console.log(
    genMessage(type, message, isFinal),
    note ? genNote(note) : ''
  );
}

function loading(message, note, isFinal) {
  log('loading', message, note, isFinal);
}

function success(message, note, isFinal) {
  log('success', message, note, isFinal);

  if (isFinal) {
    process.exit();
  }
}

function error(message, note, isFinal) {
  log('error', message, note, isFinal);

  if (isFinal) {
    process.exit(1);
  }
}

function warn(message, note, isFinal) {
  log('warn', message, note, isFinal);
}

function info(message, note, isFinal) {
  log('info', message, note, isFinal);
}

module.exports = {
  loading,
  success,
  error,
  warn,
  info,
};
