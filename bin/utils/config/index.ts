import appRoot from 'app-root-path';
import path from 'path';
import fs from 'fs';

import argv from '../argv';
import logger from '../logger';
import getConfigValues, { DEFAULT_VALUES } from './getConfigValues';
import getFileContent from './getFileContent';

const CONFIG_DEFAULT_NAME_JSON = 'hooks.config.json';
const CONFIG_DEFAULT_NAME_JS = 'hooks.config.js';

function fileExists(path: string) {
  return fs.existsSync(path);
}

function getPath(configName: string) {
  return path.join(appRoot.path, configName);
}

/** Gets the full config path by checking both args and default names. */
function getConfigPath() {
  const ARG_CONFIG_NAME = argv.config;

  const argPath = getPath(ARG_CONFIG_NAME);

  if (ARG_CONFIG_NAME && fileExists(argPath)) {
    return argPath;
  }

  logger.debug('Searching for config file using default names');

  const jsonPath = getPath(CONFIG_DEFAULT_NAME_JSON);
  const jsPath = getPath(CONFIG_DEFAULT_NAME_JS);

  if (fileExists(jsonPath)) {
    return jsonPath;
  }

  if (fileExists(jsPath)) {
    return jsPath;
  }
}

/** Retrieves the configuration. */
async function getConfigConstants() {
  const configPath = getConfigPath();

  // if no config was provided, we use the default values
  if (!configPath) {
    logger.info('Config file not found. Using default values');

    return DEFAULT_VALUES;
  }

  logger.debug('Getting config on:', configPath);

  const config = await getFileContent(configPath);

  return getConfigValues(config);
}

getConfigConstants();

export default {
  getConfigConstants,
};
