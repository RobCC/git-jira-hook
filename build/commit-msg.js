#!/usr/bin/env node
import yargs from 'yargs';
import child_process from 'child_process';
import util from 'util';
import fs from 'fs';
import appRootPath from 'app-root-path';
import path from 'path';
import lodash from 'lodash.merge';
import ajv$1 from 'ajv';

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
}

function error(message, note, isFinal) {
  log('error', message, note, isFinal);
}

function warn(message, note, isFinal) {
  log('warn', message, note, isFinal);
}

function info(message, note, isFinal) {
  log('info', message, note, isFinal);
}

var logger = {
  loading: loading,
  success: success,
  error: error,
  warn: warn,
  info: info
};

const childProcessExec = child_process.exec;



function getCommitMessage(commitFile) {
  const message = fs.readFileSync(commitFile, 'utf8').trim();

  return [ message.split('\n')[0], message ];
}

function modifyCommitMessage(commitFile, newContent) {
  fs.writeFileSync(commitFile, newContent);
}

async function getCurrentBranch() {
  const exec = util.promisify(childProcessExec);
  const cmd = await exec('git branch');

  if (!cmd.stdout) {
    return '';
  }

  return cmd.stdout.split('\n').find(b => b.charAt(0) === '*').trim().substring(2);
}
var git = {
  getCurrentBranch: getCurrentBranch,
  getCommitMessage: getCommitMessage,
  modifyCommitMessage: modifyCommitMessage
};

/**
 * @typedef {Object} FormatResponse
 * @property {boolean} hasFormat - If the format is correct
 * @property {string} commitType - The commit tytpe of the message
 * @property {string} messageTicket - The JIRA ticket of the message (if available)
 */

/**
 * Checks if the message is a special / automated one
 * @param {string} message - Commit message
 * @returns {boolean}
 */
function isSpecialCommit(message) {
  const mergeCommitRegex = new RegExp('^Merge(d)?.*?$');
  const versionCommitRegex = new RegExp('^[0-9]*\\.[0-9]*\\.[0-9].*$');
  const breakingChangeRegex = new RegExp('^BREAKING CHANGE: .*$');

  return !!(
    message.match(mergeCommitRegex) ||
    message.match(versionCommitRegex) ||
    message.match(breakingChangeRegex)
  );
}

/**
 * Validates that the message has a fully correct format
 * @param {string} message - Commit message
 * @returns {FormatResponse}
 */
function isFormatCorrect(message) {
  const regex = new RegExp('^([a-z]+?)(?:\\((.*?-[0-9]+?)+\\))?: .*?$');
  const [
    hasFormat = false,
    commitType = '',
    messageTicket = ''
  ] = message.match(regex) || [];

  return {
    hasFormat,
    commitType,
    messageTicket
  };
}

/**
 * Validates that the commit message ticket matches the one provided
 * @param {string} commitTicket - Commit message
 * @param {string} projectId - Project id
 * @returns {boolean}
 */
function isTicketValid(commitTicket, projectId) {
  const regex = new RegExp(`^${projectId}(-)([0-9])+?$`);

  return !!commitTicket.match(regex);
}

/**
 * Checks whether the commit type on the message should have a ticker or not
 * @param {string} type - Commit type of the message
 * @param {string[]} ticketTypes - List of commit types that should have ticket
 * @param {string[]} nonTicketTypes - List of commit types that should not have ticket
 * @returns {boolean[]} A tuple defining if the commit type is on the ticket and non-ticket group
 */
function getCommitType(type, ticketTypes, nonTicketTypes) {
  const ticketRegex = new RegExp(`^${ticketTypes.join('|')}$`);
  const nonTicketRegex = new RegExp(`^${nonTicketTypes.join('|')}$`);

  return [!!type.match(ticketRegex), !!type.match(nonTicketRegex)]
}

/**
 * Checks if the branch is a non ticket branch type
 * @param {string} branch - Current branch name
 * @param {string[]} nonTicketBranches - List of branch types that should have ticket
 * @returns {boolean}
 */
function isOtherBranch(branch, nonTicketBranches) {
  const regex = new RegExp(`^(${nonTicketBranches.join('|')})\\/.+?$`);

  return !!branch.match(regex);
}

/**
 * Checks if the branch is a main branch type
 * @param {string} branch - Current branch name
 * @param {string[]} mainBranches - List of main branch types
 * @returns {boolean}
 */
function isMainBranch(branch, mainBranches) {
  const regex = new RegExp(`^${mainBranches.join('|')}$`);

  return !!branch.match(regex);
}

/**
 * Checks if the branch is a non ticket branch type
 * @param {string} branch - Current branch name
 * @param {string} projectId - Project id
 * @param {string[]} ticketBranches - List of branch types that should have ticket
 * @returns {boolean | string} If it's not valid return false, else return the ticket on the branch (if it's there)
 */
function getTicketFromBranch(branch, projectId, ticketBranches) {
  const regex = new RegExp(`^(?:${ticketBranches.join('|')})\\/(${projectId}-[0-9]+)(?:-(.*?))?$`);
  const [isValid, ticket] = branch.match(regex) || [];

  if (!isValid) {
    return false;
  }

  // logger.success('Ticket found on branch name');

  return ticket;
}

/**
 * Adds the ticket to the commit message
 * @param {string} firstLine - First line of the commit message
 * @param {string} fullMessage - Full string of the commit message
 * @param {string} ticket - Ticket id
 * @param {string[]} ticketCommitTypes - List of ticket commit types
 * @returns {string} Full message modified
 */
function addTicketToCommit(firstLine, fullMessage, ticket, ticketCommitTypes) {
  const regex = new RegExp(`^(${ticketCommitTypes.join('|')}): (.*?)$`);
  const lineSplittedMessage = fullMessage.split('\n');
  const [, type, description] = firstLine.match(regex) || [];

  lineSplittedMessage[0] = `${type}(${ticket}): ${description}`;

  return lineSplittedMessage.join('\n');
}

var validator = {
  isSpecialCommit,
  isFormatCorrect,
  isTicketValid,
  getCommitType,
  isOtherBranch,
  isMainBranch,
  getTicketFromBranch,
  addTicketToCommit
};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

const ajv = new ajv$1({ allErrors: true });



const schema = {
  required: ['projectId'],
  properties: {
    projectId: {
      type: 'string',
    },
    commitTypes: {
      type: 'object',
      maxProperties: 2,
      properties: {
        ticket: {
          type: 'array',
          items: { type: 'string' },
        },
        nonTicket: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    branchTypes: {
      type: 'object',
      maxProperties: 3,
      properties: {
        main: {
          type: 'array',
          items: { type: 'string' },
        },
        ticket: {
          type: 'array',
          items: { type: 'string' },
        },
        nonTicket: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  },
};

function displayErrors(errors) {
  logger.error('Configuration is not valid. Using default values.');

  for (var i = 0; i < errors.length; i++) {
    const error = errors[i];

    console.log(error.dataPath, error.message);
  }
}

function isConfigValid(config) {
  const isValid = ajv.validate(schema, config);

  if (isValid) {
    return true;
  } else {
    displayErrors(ajv.errors);
    return false;
  }
}

var schema_1 = {
  isConfigValid,
};

const DEFAULT_CONSTANTS = {
  projectId: '',
  commitTypes: {
    ticket: ['feat', 'fix', 'chore'],
    nonTicket: ['other'],
  },
  branchTypes: {
    main: ['master', 'develop'],
    ticket: ['feature', 'bugfix', 'hotfix'],
    nonTicket: ['other', 'release', 'support'],
  }
};

function getConstants(config) {
  return config && schema_1.isConfigValid(config)
    ? lodash(DEFAULT_CONSTANTS, config)
    : DEFAULT_CONSTANTS;
}

var constants = {
  getConstants,
};

const ROOT = appRootPath.toString();
const CONFIG_DEFAULT_NAME_JSON = 'hooks.config.json';
const CONFIG_DEFAULT_NAME_JS = 'hooks.config.js';

let CONFIG_PATH;

function setConfigPath(configPath) {
  CONFIG_PATH = configPath;
}

function getConfigPath() {
  return CONFIG_PATH;
}

function useDefaultConfigNames(argsConfigName) {
  return !fs.existsSync(path.join(ROOT, argsConfigName));
}

function configExists(argsConfigName) {
  let configPath;
  let hasConfig;

  if (argsConfigName && !useDefaultConfigNames(argsConfigName)) {
    hasConfig = true;
    configPath = path.join(ROOT, argsConfigName);
  } else {
    const jsonPath = path.join(ROOT, CONFIG_DEFAULT_NAME_JSON);
    const jsPath = path.join(ROOT, CONFIG_DEFAULT_NAME_JS);
    const jsonExists = fs.existsSync(jsonPath);
    const jsExists = fs.existsSync(jsPath);

    if (jsonExists) {
      configPath = jsonPath;
    } else if (jsExists) {
      configPath = jsPath;
    }

    hasConfig = jsonExists || jsExists;
  }

  if (configPath) {
    setConfigPath(configPath);
  }

  return {
    hasConfig,
    configPath,
    isJSON: hasConfig
      ? path.extname(configPath) === '.json'
      : false,
  };
}

function getConfigFromJSON(configPath) {
  try {
    const fileString = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(fileString);

    if (config && typeof config === 'object') {
      return config;
    }
  } catch (error) {
    logger.error('Error reading config file');

    return null;
  }
}

function getConfigFromJS(configPath) {
  try {
    const relativePath = path.relative(__dirname, configPath);
    const jsFile = commonjsRequire(relativePath);

    if (jsFile && typeof jsFile === 'object') {
      return jsFile;
    } else if (jsFile && typeof jsFile === 'function') {
      return jsFile();
    }
  } catch (error) {
    logger.error('Error reading config file');

    return null;
  }
}

function getConfig(configPath, isJSON) {
  return isJSON
    ? getConfigFromJSON(configPath)
    : getConfigFromJS(configPath);
}

function getConfigConstants(projectId, argsConfigName) {
  const { hasConfig, configPath, isJSON } = configExists(argsConfigName);

  if (!hasConfig) {
    if (!projectId) {
      logger.error('Config file not found. No project ID provided');
      process.exit(1);
    }

    const defaultConstants = constants.getConstants();

    logger.info('Config file not found. Using default values');

    return {
      ...defaultConstants,
      projectId,
    };
  }

  const config = getConfig(configPath, isJSON);

  return constants.getConstants(config);
}

var config = {
  getConfigPath,
  getConfigConstants,
};

const argv = yargs.argv;






const {
  isSpecialCommit: isSpecialCommit$1,
  isFormatCorrect: isFormatCorrect$1,
  isTicketValid: isTicketValid$1,
  getCommitType: getCommitType$1,
  isOtherBranch: isOtherBranch$1,
  getTicketFromBranch: getTicketFromBranch$1,
  addTicketToCommit: addTicketToCommit$1
} = validator;

const [,, COMMIT_FILE] = process.argv;
const PROJECT_ID = argv.projectId;
const CONFIG_PATH$1 = argv.config;

async function commitMsg() {
  const [firstLine, fullMessage] = git.getCommitMessage(COMMIT_FILE);

  logger.loading('Checking commit message');

  const {
    projectId,
    commitTypes,
    branchTypes
  } = config.getConfigConstants(PROJECT_ID, CONFIG_PATH$1);

  if (isSpecialCommit$1(firstLine)) {
    logger.success('No need to add ticket', '', true);
    process.exit(0);
  }

  const { hasFormat, messageTicket, commitType } = isFormatCorrect$1(firstLine);

  if (!hasFormat) {
    logger.error(
      'The commit message has an incorrect format',
      `e.g. "feat(${projectId}-0): Description"`,
      true
    );
    process.exit(1);
  }

  if (messageTicket) {
    if (isTicketValid$1(messageTicket, projectId)) {
      logger.success('Ticket already in place', '', true);
      process.exit(0);
    } else {
      logger.error(`Ticket's project id does not match project's. Should be ${projectId}`,
        `e.g. "feat(${projectId}-0): Description"`,
        true
      );
      process.exit(1);
    }
  }

  const [isTicketType, isNonTicketType] = getCommitType$1(
    commitType,
    commitTypes.ticket,
    commitTypes.nonTicket
  );

  if (isNonTicketType) {
    logger.success('Non JIRA related commit. No need to add ticket', '', true);
    process.exit(0);
  }

  if (!isTicketType) {
    logger.error(
      'The commit message has an incorrect commit type',
      `Commit types available are ${[...commitTypes.ticket, ...commitTypes.nonTicket].join(', ')}`,
      true
    );
    process.exit(1);
  }

  logger.warn('Jira ticket is not on the commit message');

  const branch = await git.getCurrentBranch();

  if (isOtherBranch$1(branch, branchTypes.nonTicket)) {
    logger.success('Working on a non JIRA related branch', branchTypes.nonTicket.join(', '));
    logger.success('No need to add ticket', '', true);
    process.exit(0);
  }

  const branchTicket = getTicketFromBranch$1(branch, projectId, branchTypes.ticket);

  if (!branchTicket) {
    logger.error(
      'Branch does not have a ticket. The following branch types require an assigned ticket',
      branchTypes.ticket.join(', ')
    );
    logger.info(
      'For a non-ticket branch, rename the branch (git branch -m) with one of the following prefixes',
      branchTypes.nonTicket.join(', ')
    );
    logger.info('Branch types must always follow the following structure', '[branch-type]/[description]');
    logger.error('Ticket name not found on branch. Please add one', '', true);
    process.exit(1);
  }

  logger.loading('Adding ticket to commit message', branchTicket);

  console.log('Commit message', firstLine, fullMessage, branchTicket);

  const newFullMessage = addTicketToCommit$1(
    firstLine,
    fullMessage,
    branchTicket,
    commitTypes.ticket
  );

  git.modifyCommitMessage(COMMIT_FILE, newFullMessage);
  logger.success('Success!', newFullMessage, true);
  process.exit(0);
}

commitMsg();
