import type { ErrorObject } from 'ajv';
import Ajv from 'ajv';
import merge from 'lodash.merge';

import logger from '../logger';
import argv from '../argv';
import schema from './schema';

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });

/**
 * Default values if a config was not provided.
 *
 * Here we set `projectId` from the argument passed.
 * We later check if it exists.
 */
export const DEFAULT_VALUES: Config = {
  projectId: argv.projectId ?? '',
  commitTypes: {
    ticket: ['feat', 'fix', 'chore'],
    nonTicket: ['other'],
  },
  branchTypes: {
    main: ['master', 'develop'],
    ticket: ['feature', 'bugfix', 'hotfix'],
    nonTicket: ['other', 'release', 'support'],
  },
};

function displayErrors(errors: ErrorObject[]) {
  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];

    logger.error('Config error:', `${error.instancePath} ${error.message}`);
  }
}

function isValid(config: UnknownObject) {
  const isValid = ajv.validate(schema, config);

  if (ajv.errors) {
    displayErrors(ajv.errors);
  }

  return isValid;
}

function getConfigValues(config: UnknownObject): Config {
  if (config && isValid(config)) {
    return merge(DEFAULT_VALUES, config);
  }

  logger.error('Configuration is not valid. Using default values.');

  return DEFAULT_VALUES;
}

export default getConfigValues;
