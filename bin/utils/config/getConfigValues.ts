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
export const DEFAULT_VALUES: ConfigValues = {
  projectId: argv.projectId ?? '',
  commitTypes: {
    ticket: ['feat', 'feature', 'fix'],
    nonTicket: ['chore', 'refactor'],
  },
  branchTypes: {
    main: ['master'],
    ticket: ['feat', 'feature', 'bugfix'],
    nonTicket: ['release', 'support', 'chore'],
  },
};

function displayErrors(errors: ErrorObject[]) {
  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];

    logger.error('Config error:', `${error.instancePath} ${error.message}`);
  }
}

function isValid(config: UnknownObject): config is Config {
  const isValid = ajv.validate(schema, config);

  if (ajv.errors) {
    displayErrors(ajv.errors);
  }

  return isValid;
}

function getConfigValues(config: UnknownObject): ConfigValues {
  if (config && isValid(config)) {
    return merge(DEFAULT_VALUES, config);
  }

  logger.error('Configuration is not valid. Using default values.');

  return DEFAULT_VALUES;
}

export default getConfigValues;
