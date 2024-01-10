/* eslint-disable no-console */
import argv from './argv';

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
const PREFIX_DEBUG = BLUE + '[debug]   ' + RESET;

function genMessage(type: string, message: string, exit = false) {
  let fullMessage = exit ? NEW_LINE : '';

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
    case 'debug':
      fullMessage += PREFIX_DEBUG;
      break;
    default:
      fullMessage += BOLD + message + RESET;
  }

  if (exit) {
    fullMessage += BOLD;
  }

  fullMessage += message + RESET;

  return fullMessage;
}

function genNote(note?: string) {
  if (!note) {
    return '';
  }

  return GRAY + note + RESET;
}

function log(type: string, message: string, note?: string, exit?: boolean) {
  console.log(genMessage(type, message, exit), genNote(note));
}

function loading(message: string, note?: string, exit?: boolean) {
  log('loading', message, note, exit);
}

function success(message: string, note?: string, exit?: boolean) {
  log('success', message, note, exit);

  if (exit) {
    process.exit();
  }
}

function error(message: string, note?: string, exit?: boolean) {
  log('error', message, note, exit);

  if (exit) {
    process.exit(1);
  }
}

function warn(message: string, note?: string) {
  log('warn', message, note);
}

function info(message: string, note?: string) {
  log('info', message, note);
}

function debug(...message: unknown[]) {
  if (argv.debug) {
    console.log(PREFIX_DEBUG, ...message);
  }
}

export default {
  loading,
  success,
  error,
  warn,
  info,
  debug,
};
