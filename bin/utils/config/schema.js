const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const logger = require('../logger');

const schema = {
  required: ['projectId'],
  properties: {
    projectId: {
      type: 'string',
    },
    commitTypes: {
      type: 'object',
      maxProperties: 2,
      properties: {
        ticket: {
          type: 'array',
          items: { type: 'string' },
        },
        nonTicket: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    branchTypes: {
      type: 'object',
      maxProperties: 3,
      properties: {
        main: {
          type: 'array',
          items: { type: 'string' },
        },
        ticket: {
          type: 'array',
          items: { type: 'string' },
        },
        nonTicket: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  },
};

function displayErrors(errors) {
  logger.error('Configuration is not valid. Using default values.');

  for (var i = 0; i < errors.length; i++) {
    const error = errors[i];

    console.log(error.dataPath, error.message)
  }
}

function isConfigValid(config) {
  const isValid = ajv.validate(schema, config);

  if (isValid) {
    return true;
  } else {
    displayErrors(ajv.errors);
    return false;
  }
}

module.exports = {
  isConfigValid,
};
