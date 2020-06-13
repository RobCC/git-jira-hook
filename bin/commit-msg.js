#!/usr/bin/env node

const argv = require('yargs').argv;

const logger = require('./utils/logger');
const git = require('./utils/git');
const validator = require('./utils/validator');
const config = require('./utils/config/config');

const {
  isSpecialCommit,
  isFormatCorrect,
  isTicketValid,
  getCommitType,
  isOtherBranch,
  getTicketFromBranch,
  addTicketToCommit
} = validator;

const [,, COMMIT_FILE] = process.argv;
const PROJECT_ID = argv.projectId;
const CONFIG_PATH = argv.config;

async function commitMsg() {
  const [firstLine, fullMessage] = git.getCommitMessage(COMMIT_FILE);

  logger.loading('Checking commit message');

  const {
    projectId,
    commitTypes,
    branchTypes
  } = config.getConfigConstants(PROJECT_ID, CONFIG_PATH);

  if (isSpecialCommit(firstLine)) {
    logger.success('No need to add ticket', '', true);
    process.exit(0);
  }

  const { hasFormat, messageTicket, commitType } = isFormatCorrect(firstLine);

  if (!hasFormat) {
    logger.error(
      'The commit message has an incorrect format',
      `e.g. "feat(${projectId}-0): Description"`,
      true
    );
    process.exit(1);
  }

  if (messageTicket) {
    if (isTicketValid(messageTicket, projectId)) {
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

  const [isTicketType, isNonTicketType] = getCommitType(
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

  if (isOtherBranch(branch, branchTypes.nonTicket)) {
    logger.success('Working on a non JIRA related branch', branchTypes.nonTicket.join(', '));
    logger.success('No need to add ticket', '', true);
    process.exit(0);
  }

  const branchTicket = getTicketFromBranch(branch, projectId, branchTypes.ticket);

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

  const newFullMessage = addTicketToCommit(
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
