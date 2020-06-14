const merge = require('lodash.merge');

const schema = require('./schema');

const DEFAULT_VALUES = {
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
  return config && schema.isValid(config)
    ? merge(DEFAULT_VALUES, config)
    : DEFAULT_VALUES;
}

module.exports = {
  getConstants,
};
