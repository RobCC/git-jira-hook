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

module.exports = {
  isSpecialCommit,
  isFormatCorrect,
  isTicketValid,
  getCommitType,
  isOtherBranch,
  isMainBranch,
  getTicketFromBranch,
  addTicketToCommit
};
