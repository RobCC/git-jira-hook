import { execSync } from 'child_process';

const commitMessage = {
  ticketWithoutTicket: 'fix: Description',
  ticketWithTicket: 'fix(TEST-JSON-123): Description',
  nonTicketWithoutTicket: 'other: description',
  nonTicketWithTicket: 'other(TEST-JSON-123): description',
  invalidWithTicket: 'invalid(TEST-JSON-123): description',
  invalidWithoutTicket: 'invalid: description',
  badFormat: 'description',
  special: 'Merge branch',
};

const branches = {
  main: 'master',

  ticketWithTicket: 'fix/TEST-JSON-123',
  ticketWithTicketAndDescription: 'fix/TEST-JSON-123-description',
  ticketWithoutTicket: 'fix/description',

  nonTicketWithTicket: 'other/TEST-JSON-123-description',
  nonTicketWithoutTicket: 'other/description',

  invalidWithTicket: 'invalid/TEST-JSON-123-description',
  invalidWithoutTicket: 'invalid/description',
};

function runScript(commitMessage: string, branch: string) {
  return () => {
    execSync(
      `node build/commit-msg.cjs commit-msg --debug --commitMessage="${commitMessage}" --branch="${branch}"`
    );
  };
}

describe('commit-msg', () => {
  it('1. For main branches and invalid branches, it should only pass special commit messages', async () => {
    for (const message of Object.values(commitMessage)) {
      if (message === commitMessage.special) {
        expect(runScript(message, branches.main)).not.toThrow();
        expect(runScript(message, branches.invalidWithTicket)).not.toThrow();
        expect(runScript(message, branches.invalidWithoutTicket)).not.toThrow();
      } else {
        expect(runScript(message, branches.main)).toThrow();
        expect(runScript(message, branches.invalidWithTicket)).toThrow();
        expect(runScript(message, branches.invalidWithoutTicket)).toThrow();
      }
    }
  });

  it('2. For ticket branches with ticket (and/or description), it should pass all valid scenarios', async () => {
    for (const message of Object.values(commitMessage)) {
      if (
        [
          commitMessage.invalidWithTicket,
          commitMessage.invalidWithoutTicket,
          commitMessage.badFormat,
        ].includes(message)
      ) {
        expect(runScript(message, branches.ticketWithTicket)).toThrow();
        expect(
          runScript(message, branches.ticketWithTicketAndDescription)
        ).toThrow();
      } else {
        expect(runScript(message, branches.ticketWithTicket)).not.toThrow();
        expect(
          runScript(message, branches.ticketWithTicketAndDescription)
        ).not.toThrow();
      }
    }
  });

  it('3. Almost same case for ticket branch without ticket. It should additionally throw on ticket messages without ticket', async () => {
    for (const message of Object.values(commitMessage)) {
      if (
        [
          commitMessage.invalidWithTicket,
          commitMessage.invalidWithoutTicket,
          commitMessage.badFormat,
          // should fail because it does not have a way to retrieve the ticket, when it should
          commitMessage.ticketWithoutTicket,
        ].includes(message)
      ) {
        expect(runScript(message, branches.ticketWithoutTicket)).toThrow();
      } else {
        expect(runScript(message, branches.ticketWithoutTicket)).not.toThrow();
      }
    }
  });

  it('4. For non ticket branches (either with or without ticket), it should pass all valid scenarios. Similar to test no. 2', async () => {
    for (const message of Object.values(commitMessage)) {
      if (
        [
          commitMessage.invalidWithTicket,
          commitMessage.invalidWithoutTicket,
          commitMessage.badFormat,
        ].includes(message)
      ) {
        expect(runScript(message, branches.nonTicketWithTicket)).toThrow();
        expect(runScript(message, branches.nonTicketWithoutTicket)).toThrow();
      } else {
        expect(runScript(message, branches.nonTicketWithTicket)).not.toThrow();
        expect(
          runScript(message, branches.nonTicketWithoutTicket)
        ).not.toThrow();
      }
    }
  });
});
