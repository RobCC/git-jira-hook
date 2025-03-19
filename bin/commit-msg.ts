import { COMMIT_MSG_FILE } from './utils/argv';
import logger from './utils/logger';
import git from './utils/git';
import validator from './utils/validator';
import configUtils from './utils/config';

const {
  isSpecialCommit,
  isMainBranch,
  hasCorrectFormat,
  isTicketValid,
  getCommitType,
  isNonTicketBranch,
  getTicketFromBranch,
  addTicketToCommit,
} = validator;

async function commitMsg() {
  if (!COMMIT_MSG_FILE) {
    logger.error('Commit message file not passed.', '', true);
  }

  const { firstLine, fullMessage } = git.getCommitMessage();
  const branch = git.getBranch();
  const config = await configUtils.getConfigConstants();
  const { projectId, branchTypes } = config;

  if (!projectId) {
    logger.error(
      'projectId not provided. Either add it on the config file or pass it as an argument',
      '',
      true
    );
  }

  logger.debug('Config values:', config);
  logger.debug('Commit data: ', {
    projectId,
    fullMessage,
    firstLine,
    branch,
  });

  logger.loading('Checking commit message');

  if (isSpecialCommit(firstLine)) {
    logger.success('No need to add ticket', '', true);
  }

  if (isMainBranch(branch, branchTypes.main)) {
    logger.error(
      'Cannot commit directly to the following branches',
      branchTypes.main.join(', '),
      true
    );
  }

  const { hasFormat, ticket, commitType } = hasCorrectFormat(firstLine);

  logger.debug('Format data: ', {
    hasFormat,
    ticket,
    commitType,
  });

  if (!hasFormat) {
    logger.error(
      'The commit message has an incorrect format',
      `e.g. "feat(${projectId}-0): Description"`,
      true
    );
  }

  const [isTicketType, isNonTicketType] = getCommitType(
    commitType,
    config.commitTypes.ticket,
    config.commitTypes.nonTicket
  );

  logger.debug('Type data: ', { isTicketType, isNonTicketType });

  if (isNonTicketType) {
    logger.success('Non JIRA related commit. No need to add ticket', '', true);
  }

  if (!isTicketType) {
    logger.error(
      'The commit message has an incorrect commit type',
      `Commit types available are ${[
        ...config.commitTypes.ticket,
        ...config.commitTypes.nonTicket,
      ].join(', ')}`,
      true
    );
  }

  if (ticket) {
    if (isTicketValid(ticket, projectId)) {
      logger.success('Ticket already in place', '', true);
    } else {
      logger.error(
        `The ticket in the commit message does not match the provided projectId ${projectId}`,
        `e.g. "feat(${projectId}-0): Description"`,
        true
      );
    }
  }

  logger.warn('Jira ticket is not on the commit message');

  if (isNonTicketBranch(branch, branchTypes.nonTicket)) {
    logger.success(
      'Working on a non JIRA related branch, no need to add ticket',
      '',
      true
    );
  }

  const { isValid, branchTicket } = getTicketFromBranch(
    branch,
    projectId,
    branchTypes.ticket
  );

  logger.debug('Branch data: ', { isValid, branchTicket });

  if (!isValid) {
    logger.error(
      'Branch does not have a ticket. The following branch types require an assigned ticket',
      branchTypes.ticket.join(', ')
    );
    logger.info(
      'For a non-ticket branch, rename the branch prefix to one of the following',
      branchTypes.nonTicket.join(', ')
    );
    logger.info(
      'Branches may include an optional description after the ticket',
      `${branchTypes.ticket[0] || 'feature'}/${projectId}-description`
    );
    logger.error('Ticket name not found on branch. Please add one', '', true);
  }

  logger.loading('Adding ticket to commit message', branchTicket);

  const newFullMessage = addTicketToCommit(
    firstLine,
    fullMessage,
    branchTicket,
    config.commitTypes.ticket
  );

  git.modifyCommitMessage(newFullMessage);
  logger.success('Success!', newFullMessage, true);
}

commitMsg();
