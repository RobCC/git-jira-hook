#!/usr/bin/env node

const argv = require('yargs').argv;

const logger = require('./utils/logger');
const git = require('./utils/git');
const validator = require('./utils/validator');
const config = require('./utils/config/config');
const dbugger = require('./utils/debugger');

const {
  isSpecialCommit,
  isMainBranch,
  hasCorrectFormat,
  isTicketValid,
  getCommitType,
  isOtherBranch,
  getTicketFromBranch,
  addTicketToCommit
} = validator;

const [,, COMMIT_FILE] = process.argv;
const PROJECT_ID = argv.projectId;
const CONFIG_PATH = argv.config;
const DEBUG_MODE = argv.debug || false;

async function commitMsg() {
  dbugger.setDebugMode(DEBUG_MODE);

  const [firstLine, fullMessage] = git.getCommitMessage(COMMIT_FILE);
  const branch = git.getCurrentBranch();

  logger.loading('Checking commit message');
  dbugger.log('(firstLine, branch)', firstLine, branch);

  const {
    projectId,
    commitTypes,
    branchTypes
  } = config.getConfigConstants(PROJECT_ID, CONFIG_PATH);

  dbugger.log('(config)', projectId, commitTypes, branchTypes);

  if (isMainBranch(branch, branchTypes.main)) {
    logger.error(
      'Cannot commit directly to the following branches',
      branchTypes.main.join(', '),
      true
    );
  }

  if (isSpecialCommit(firstLine)) {
    logger.success('No need to add ticket', '', true);
  }

  const { hasFormat, messageTicket, commitType } = hasCorrectFormat(firstLine);

  dbugger.log('(hasFormat, messageTicket, commitType)', hasFormat, messageTicket, commitType);

  if (!hasFormat) {
    logger.error(
      'The commit message has an incorrect format',
      `e.g. "feat(${projectId}-0): Description"`,
      true
    );
  }

  if (messageTicket) {
    if (isTicketValid(messageTicket, projectId)) {
      logger.success('Ticket already in place', '', true);
    } else {
      logger.error(`Ticket's project id does not match project id provided. Should be ${projectId}`,
        `e.g. "feat(${projectId}-0): Description"`,
        true
      );
    }
  }

  const [isTicketType, isNonTicketType] = getCommitType(
    commitType,
    commitTypes.ticket,
    commitTypes.nonTicket
  );

  dbugger.log('(isTicketType, isNonTicketType)', isTicketType, isNonTicketType);

  if (isNonTicketType) {
    logger.success('Non JIRA related commit. No need to add ticket', '', true);
  }

  if (!isTicketType) {
    logger.error(
      'The commit message has an incorrect commit type',
      `Commit types available are ${[...commitTypes.ticket, ...commitTypes.nonTicket].join(', ')}`,
      true
    );
  }

  logger.warn('Jira ticket is not on the commit message');

  if (isOtherBranch(branch, branchTypes.nonTicket)) {
    logger.success('Working on a non JIRA related branch', branchTypes.nonTicket.join(', '));
    logger.success('No need to add ticket', '', true);
  }

  const { isValid, branchTicket } = getTicketFromBranch(branch, projectId, branchTypes.ticket);

  dbugger.log('(isValid, branchTicket)', isValid, branchTicket);

  if (!isValid) {
    logger.error(
      'Branch does not have a ticket. The following branch types require an assigned ticket',
      branchTypes.ticket.join(', ')
    );
    logger.info(
      'For a non-ticket branch, rename the branch (git branch -m) with one of the following prefixes',
      branchTypes.nonTicket.join(', ')
    );
    logger.info(
      'Git branches may include an optional description after the ticket',
      `${branchTypes.ticket[0] || 'feature'}/${projectId}-Description`
    );
    logger.error('Ticket name not found on branch. Please add one', '', true);
  }

  logger.loading('Adding ticket to commit message', branchTicket);

  const newFullMessage = addTicketToCommit(
    firstLine,
    fullMessage,
    branchTicket,
    commitTypes.ticket
  );

  git.modifyCommitMessage(COMMIT_FILE, newFullMessage);
  logger.success('Success!', newFullMessage, true);
}

commitMsg();
