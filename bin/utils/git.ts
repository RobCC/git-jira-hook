import branchName from 'current-git-branch';
import fs from 'fs';

import logger from './logger';
import args, { COMMIT_MSG_FILE } from './argv';

/** Writes new content onto the commit message file. */
function modifyCommitMessage(newContent: string) {
  fs.writeFileSync(COMMIT_MSG_FILE, newContent);
}

/** Returns the current git branch. */
function getBranch() {
  const currentBranch = branchName();

  if (args.debug && args.branch) {
    logger.debug('Passing arg branch for debugging:', args.branch);

    return args.branch;
  }

  logger.debug('Current branch:', currentBranch);

  return currentBranch;
}

/** Retrieves the content of the commit message file */
function getCommitMessage() {
  let fullMessage;

  try {
    if (args.debug && args.commitMessage) {
      logger.debug(
        'Passing arg commitMessage for debugging:',
        args.commitMessage
      );

      fullMessage = args.commitMessage;
    } else {
      fullMessage = fs.readFileSync(COMMIT_MSG_FILE, 'utf8').trim();
    }

    logger.debug('Commit message:', fullMessage);

    return {
      firstLine: fullMessage.split('\n')[0],
      fullMessage,
    };
  } catch (e) {
    logger.error('Cannot read commit message file', '', true);

    return {
      firstLine: '',
      fullMessage: '',
    };
  }
}

export default {
  modifyCommitMessage,
  getCommitMessage,
  getBranch,
};
