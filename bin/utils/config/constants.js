const merge = require('lodash.merge');

const schema = require('./schema');

const DEFAULT_CONSTANTS = {
  projectId: '',
  commitTypes: {
    ticket: ['feat', 'fix', 'chore'],
    nonTicket: ['other'],
  },
  branchTypes: {
    main: ['master', 'develop'],
    ticket: ['feature', 'bugfix', 'hotfix'],
    nonTicket: ['other', 'release', 'support'],
  }
};

function getConstants(config) {
  return config && schema.isConfigValid(config)
    ? merge(DEFAULT_CONSTANTS, config)
    : DEFAULT_CONSTANTS;
}

module.exports = {
  getConstants,
};
