const branchName = require("current-git-branch");
const fs = require("fs");

const logger = require("./logger");

function getCommitMessage(commitFile) {
  let message;

  try {
    message = fs.readFileSync(commitFile, "utf8").trim();

    logger.debug("Commit message:", message);

    return {
      firstLine: message.split("\n")[0],
      fullMessage: message,
    };
  } catch (e) {
    logger.error("Cannot read commit message file", "", true);
  }
}

function modifyCommitMessage(commitFile, newContent) {
  fs.writeFileSync(commitFile, newContent);
}

function getCurrentBranch() {
  const currentBranch = branchName();

  logger.debug("Current branch:", currentBranch);

  return currentBranch;
}

module.exports = {
  getCurrentBranch,
  getCommitMessage,
  modifyCommitMessage,
};
