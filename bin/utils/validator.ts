type FormatResponse = {
  /** If the format is correct. */
  hasFormat: boolean;
  /** The commit type of the message. */
  commitType: string;
  /** The JIRA ticket of the message (if available). */
  ticket?: string;
};

/**
 * Checks if the message is a special / automated one.
 *
 * These include:
 * - Merges - `Merge: `
 * - Reverts - `Revert `
 * - Version - `v1.0.0`
 * - Breaking Changes: `BREAKING CHANGE: `
 */
function isSpecialCommit(message: string) {
  const mergeCommitRegex = new RegExp('^Merge(d)?.*?$');
  const revertCommitRegex = new RegExp('^Revert.*?$');
  const versionCommitRegex = new RegExp('^v??[0-9]*\\.[0-9]*\\.[0-9]*.*$');
  const breakingChangeRegex = new RegExp('^BREAKING CHANGE: .*$');

  return !!(
    message.match(mergeCommitRegex) ||
    message.match(revertCommitRegex) ||
    message.match(versionCommitRegex) ||
    message.match(breakingChangeRegex)
  );
}

/** Validates that the message has a fully correct format. */
function hasCorrectFormat(message: string): FormatResponse {
  const regex = new RegExp('^([a-z]+?)(?:\\((.*?-[0-9]+?)+\\))?: .*?$');
  const [hasFormat = false, commitType = '', ticket = ''] =
    message.match(regex) || [];

  return {
    hasFormat: !!hasFormat,
    commitType,
    ticket,
  };
}

/** Validates that the commit message ticket matches the one provided. */
function isTicketValid(commitTicket: string, projectId: string) {
  const regex = new RegExp(`^${projectId}(-)([0-9])+?$`);

  return !!commitTicket.match(regex);
}

/**
 * Checks whether the commit type on the message should have a ticker or not.
 * @param type - Commit type of the message.
 * @param ticketTypes - List of commit types that should have ticket.
 * @param nonTicketTypes - List of commit types that should not have ticket.
 * @returns A tuple defining if the commit type is on the ticket and non-ticket group.
 */
function getCommitType(
  type: string,
  ticketTypes: string[],
  nonTicketTypes: string[]
) {
  const ticketRegex = new RegExp(`^\\b(${ticketTypes.join('|')})\\b$`);
  const nonTicketRegex = new RegExp(`^\\b(${nonTicketTypes.join('|')})\\b$`);

  return [!!type.match(ticketRegex), !!type.match(nonTicketRegex)];
}

/**
 * Checks if the branch is a non ticket branch type.
 * @param branch - Current branch name.
 * @param nonTicketBranches - List of branch types that should have ticket.
 */
function isNonTicketBranch(branch: string, nonTicketBranches: string[]) {
  const regex = new RegExp(`^\\b(${nonTicketBranches.join('|')})\\b\\/.+?$`);

  return !!branch.match(regex);
}

/**
 * Checks if the branch is a main branch type.
 * @param branch - Current branch name.
 * @param mainBranches - List of main branch types.
 */
function isMainBranch(branch: string, mainBranches: string[]) {
  const regex = new RegExp(`^\\b(${mainBranches.join('|')})\\b$`);

  return !!branch.match(regex);
}

/**
 * Checks if the branch is a non ticket branch type. If it is,
 * and if it has the ticket, returns it.
 * @param branch - Current branch name.
 * @param projectId - Project id.
 * @param ticketBranches - List of branch types that should have ticket.
 * @returns If it's not valid return false, else return the ticket on the branch (if it's there).
 */
function getTicketFromBranch(
  branch: string,
  projectId = '',
  ticketBranches: string[] = []
) {
  const regex = new RegExp(
    `^(?:${ticketBranches.join('|')})\\/(${projectId}-[0-9]+)(?:-(.*?))?$`
  );
  const [isValid = false, branchTicket = ''] = branch.match(regex) || [];

  return {
    isValid: !!isValid,
    branchTicket,
  };
}

/**
 * Adds the ticket to the commit message.
 * @param firstLine - First line of the commit message.
 * @param fullMessage - Full string of the commit message.
 * @param ticket - Ticket id.
 * @param ticketCommitTypes - List of ticket commit types.
 */
function addTicketToCommit(
  firstLine: string,
  fullMessage: string,
  ticket: string,
  ticketCommitTypes: string[]
) {
  const regex = new RegExp(`^(${ticketCommitTypes.join('|')}): (.*?)$`);
  const lineSplittedMessage = fullMessage.split('\n');
  const [, type, description] = firstLine.match(regex) || [];

  lineSplittedMessage[0] = `${type}(${ticket}): ${description}`;

  return lineSplittedMessage.join('\n');
}

export default {
  isSpecialCommit,
  hasCorrectFormat,
  isTicketValid,
  getCommitType,
  isNonTicketBranch,
  isMainBranch,
  getTicketFromBranch,
  addTicketToCommit,
};
