const childProcessExec = require('child_process').exec;
const util = require('util');
const fs = require('fs');

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
};

module.exports = {
  getCurrentBranch: getCurrentBranch,
  getCommitMessage: getCommitMessage,
  modifyCommitMessage: modifyCommitMessage
};
