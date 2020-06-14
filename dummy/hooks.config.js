module.exports = {
  projectId: 'TEST',
  commitTypes: {
    ticket: ['feat', 'fix', 'chore'],
    nonTicket: ['other'],
  },
  branchTypes: {
    main: ['master', 'develop'],
    ticket: ['feature', 'bugfix', 'hotfix'],
    nonTicket: ['other', 'release', 'support'],
  },
}
