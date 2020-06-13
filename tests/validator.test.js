const validator = require('../bin/utils/validator');

const {
  isSpecialCommit,
  isFormatCorrect,
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
    it('should valite a Merge commit message', () => {
      const message = "Merge branch 'master' into dev";

      expect(isSpecialCommit(message)).toBe(true);
    });

    it('should valite a Merged commit message', () => {
      const message = 'Merged in feature/TICKET-123';

      expect(isSpecialCommit(message)).toBe(true);
    });

    it('should valite a version commit message', () => {
      const message = '2.1.0';

      expect(isSpecialCommit(message)).toBe(true);
    });

    it('should valite a BREAKING CHANGE commit message', () => {
      const message = 'BREAKING CHANGE: environment variables now take precedence over config files';

      expect(isSpecialCommit(message)).toBe(true);
    });
  })

  describe('isFormatCorrect', () => {
    it('should reject a message without format', () => {
      const message = 'hello world';
      const { hasFormat } = isFormatCorrect(message);

      expect(hasFormat).toBe(false);
    });

    it('should reject a message with an almost correct format', () => {
      const message = 'feat(TEST): Messsage';
      const { hasFormat } = isFormatCorrect(message);

      expect(hasFormat).toBe(false);
    });

    it('should get the type and ticket of a correct message', () => {
      const message = 'feat(TEST-50): Messsage';
      const { commitType, messageTicket } = isFormatCorrect(message);

      expect(commitType).toBe('feat');
      expect(messageTicket).toBe('TEST-50');
    });
  });

  describe('isTicketValid', () => {
    it('should validate for a correct ticket', () => {
      const ticket = `${PROJECT_ID}-123`;

      expect(isTicketValid(ticket, PROJECT_ID)).toBe(true);
    });

    it('should validate for an incorrect ticket', () => {
      const ticket = `DUMMY-123`;

      expect(isTicketValid(ticket, PROJECT_ID)).toBe(false);
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

    it('should validate for a incorrect branch', () => {
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
      const messageTicket = getTicketFromBranch(
        branch,
        PROJECT_ID,
        ticketBranches
      );

      expect(messageTicket).toBe(ticket);
    });

    it('should validate a branch with a non-valid prefix', () => {
      const branch = `quickfix/${ticket}`;
      const messageTicket = getTicketFromBranch(
        branch,
        PROJECT_ID,
        ticketBranches
      );

      expect(messageTicket).toBe(false);
    });

    it('should validate a branch without ticket', () => {
      const branch = `bugfix/${PROJECT_ID}`;
      const messageTicket = getTicketFromBranch(
        branch,
        PROJECT_ID,
        ticketBranches
      );

      expect(messageTicket).toBe(false);
    });

    it('should validate a branch without format', () => {
      const branch = 'fix-config';
      const messageTicket = getTicketFromBranch(
        branch,
        PROJECT_ID,
        ticketBranches
      );

      expect(messageTicket).toBe(false);
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
