const branchName = require('current-git-branch');
const fs = require('fs');

const dbugger = require('./debugger');

function getCommitMessage(commitFile) {
  let message;

  try {
    message = fs.readFileSync(commitFile, 'utf8').trim();
  } catch (e) {
    console.error('Cannot read commit message file', commitFile);
  }

  dbugger.log('Commit message:', message);

  return [ message.split('\n')[0], message ];
}

function modifyCommitMessage(commitFile, newContent) {
  fs.writeFileSync(commitFile, newContent);
}

function getCurrentBranch() {
  const currentBranch = branchName();

  dbugger.log('Current branch:', currentBranch);

  return currentBranch;
};

module.exports = {
  getCurrentBranch,
  getCommitMessage,
  modifyCommitMessage,
};
