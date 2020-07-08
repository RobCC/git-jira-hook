const validator = require('../bin/utils/validator');

const {
  isSpecialCommit,
  hasCorrectFormat,
  isTicketValid,
  getCommitType,
  isOtherBranch,
  isMainBranch,
  getTicketFromBranch,
  addTicketToCommit
} = validator;

describe('validator', () => {
  const PROJECT_ID = 'TEST';

  describe('isSpecialCommit', () => {
    it('should validate a Merge commit message', () => {
      const message = "Merge branch 'master' into dev";

      expect(isSpecialCommit(message)).toBe(true);
    });

    it('should validate a Merged commit message', () => {
      const message = 'Merged in feature/TICKET-123';

      expect(isSpecialCommit(message)).toBe(true);
    });

    it('should validate a version commit message', () => {
      const message = '2.1.0';

      expect(isSpecialCommit(message)).toBe(true);
    });

    it('should validate a BREAKING CHANGE commit message', () => {
      const message = 'BREAKING CHANGE: environment variables now take precedence over config files';

      expect(isSpecialCommit(message)).toBe(true);
    });
  });

  describe('hasCorrectFormat', () => {
    it('should reject a message without format', () => {
      const message = 'hello world';
      const { hasFormat } = hasCorrectFormat(message);

      expect(hasFormat).toBe(false);
    });

    it('should reject a message with an almost correct format', () => {
      const message = 'feat(TEST): Messsage';
      const { hasFormat } = hasCorrectFormat(message);

      expect(hasFormat).toBe(false);
    });

    it('should get the type and ticket of a correct message', () => {
      const message = 'feat(TEST-50): Messsage';
      const { hasFormat, commitType, messageTicket } = hasCorrectFormat(message);

      expect(hasFormat).toBe(true);
      expect(commitType).toBe('feat');
      expect(messageTicket).toBe('TEST-50');
    });

    it('should validate a message with a correct format and without ticket', () => {
      const message = 'randomtype: Messsage';
      const { hasFormat, commitType, messageTicket } = hasCorrectFormat(message);

      expect(hasFormat).toBe(true);
      expect(commitType).toBe('randomtype');
      expect(messageTicket).toBe('');
    });
  });

  describe('isTicketValid', () => {
    it('should validate for an incorrect ticket', () => {
      const ticket = `DUMMY-123`;

      expect(isTicketValid(ticket, PROJECT_ID)).toBe(false);
    });

    it('should validate for a correct ticket, based on the project id provided', () => {
      const ticket = `${PROJECT_ID}-123`;

      expect(isTicketValid(ticket, PROJECT_ID)).toBe(true);
    });
  });

  describe('getCommitType', () => {
    const ticketTypes = ['feat'];
    const nonTicketTypes = ['other'];

    it('should return a commit ticket type', () => {
      const type = 'feat';
      const [isTicketType, isNonTicketType] = getCommitType(
        type,
        ticketTypes,
        nonTicketTypes
      );

      expect(isTicketType).toBe(true);
      expect(isNonTicketType).toBe(false);
    });

    it('should return a wrong commit ticket type', () => {
      const type = 'feature';
      const [isTicketType, isNonTicketType] = getCommitType(
        type,
        ticketTypes,
        nonTicketTypes
      );

      expect(isTicketType).toBe(false);
      expect(isNonTicketType).toBe(false);
    });

    it('should return a non commit ticket type', () => {
      const type = 'other';
      const [isTicketType, isNonTicketType] = getCommitType(
        type,
        ticketTypes,
        nonTicketTypes
      );

      expect(isTicketType).toBe(false);
      expect(isNonTicketType).toBe(true);
    });
  });

  describe('isOtherBranch', () => {
    const nonTicketBranches = ['other'];

    it('should validate for a other branch correctly', () => {
      const branch = 'other/hello';
      expect(isOtherBranch(branch, nonTicketBranches)).toBe(true);
    });

    it('should validate for a non other branch correctly', () => {
      const branch = 'feature/hello';
      const isValid = isOtherBranch(branch, nonTicketBranches);

      expect(isValid).toBe(false);
    });

    it('should validate for a branch without format', () => {
      const branch = 'hello';
      const isValid = isOtherBranch(branch, nonTicketBranches);

      expect(isValid).toBe(false);
    });
  });

  describe('isMainBranch', () => {
    const mainBranches = ['master', 'develop'];

    it('should validate for a develop branch', () => {
      const branch = 'develop';
      const isValid = isMainBranch(branch, mainBranches);

      expect(isValid).toBe(true);
    });

    it('should validate for a master branch', () => {
      const branch = 'master';
      const isValid = isMainBranch(branch, mainBranches);

      expect(isValid).toBe(true);
    });

    it('should validate for a non-main branch', () => {
      const branch = 'final';
      const isValid = isMainBranch(branch, mainBranches);

      expect(isValid).toBe(false);
    });
  });

  describe('getTicketFromBranch', () => {
    const ticketBranches = ['feature', 'bugfix', 'hotfix'];
    const ticket = 'TEST-123';

    it('should return the ticket of a valid branch', () => {
      const branch = `feature/${ticket}`;
      const { isValid, branchTicket } = getTicketFromBranch(
        branch,
        PROJECT_ID,
        ticketBranches
      );

      expect(isValid).toBe(true);
      expect(branchTicket).toBe(ticket);
    });

    it('should validate a branch with a non-valid ticket branch', () => {
      const branch = `quickfix/${ticket}`;
      const { isValid, branchTicket } = getTicketFromBranch(
        branch,
        PROJECT_ID,
        ticketBranches
      );

      expect(isValid).toBe(false);
      expect(branchTicket).toBe('');
    });

    it('should validate a branch without ticket number', () => {
      const branch = `bugfix/${PROJECT_ID}`;
      const { isValid, branchTicket } = getTicketFromBranch(
        branch,
        PROJECT_ID,
        ticketBranches
      );

      expect(isValid).toBe(false);
      expect(branchTicket).toBe('');
    });

    it('should validate a branch without format', () => {
      const branch = 'fix-config';
      const { isValid, branchTicket } = getTicketFromBranch(
        branch,
        PROJECT_ID,
        ticketBranches
      );

      expect(isValid).toBe(false);
      expect(branchTicket).toBe('');
    });
  });

  describe('addTicketToCommit', () => {
    const ticket = 'TEST-123';
    const ticketCommitTypes = ['feat', 'fix', 'chore'];

    it('should add the ticket to a single line commit', () => {
      const fullMessage = `chore: Sonar config`;
      const firstLine = fullMessage.split('\n')[0];
      const modifiedMessage = addTicketToCommit(
        firstLine,
        fullMessage,
        ticket,
        ticketCommitTypes
      );

      const modifiedFirstLine = modifiedMessage.split('\n')[0];

      expect(modifiedFirstLine).toBe(`chore(${ticket}): Sonar config`);
    });

    it('should add the ticket to a multiline commit', () => {
      const fullMessage = `feat: First commit
      This is the first commit of the repo.`;
      const firstLine = fullMessage.split('\n')[0];
      const modifiedMessage = addTicketToCommit(
        firstLine,
        fullMessage,
        ticket,
        ticketCommitTypes
      );

      const modifiedFirstLine = modifiedMessage.split('\n')[0];

      expect(modifiedFirstLine).toBe(`feat(${ticket}): First commit`);
    });
  });
})
