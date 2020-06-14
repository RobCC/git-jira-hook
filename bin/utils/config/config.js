const appRoot = require('app-root-path');
const path = require('path');
const fs = require('fs');

const logger = require('../logger');
const dbugger = require('../debugger');
const constants = require('./constants');
const reader = require('./reader');

const { getConstants } = constants;
const ROOT = appRoot.toString();
const CONFIG_DEFAULT_NAME_JSON = 'hooks.config.json';
const CONFIG_DEFAULT_NAME_JS = 'hooks.config.js';

function useDefaultConfigNames(argsConfigName) {
  return !fs.existsSync(path.join(ROOT, argsConfigName));
}

function configExists(argsConfigName) {
  let configPath;
  let hasConfig;

  if (argsConfigName && !useDefaultConfigNames(argsConfigName)) {
    hasConfig = true;
    configPath = path.join(ROOT, argsConfigName);
  } else {
    const jsonPath = path.join(ROOT, CONFIG_DEFAULT_NAME_JSON);
    const jsPath = path.join(ROOT, CONFIG_DEFAULT_NAME_JS);
    const jsonExists = fs.existsSync(jsonPath);
    const jsExists = fs.existsSync(jsPath);

    if (jsonExists) {
      configPath = jsonPath;
    } else if (jsExists) {
      configPath = jsPath;
    }

    hasConfig = jsonExists || jsExists;
  }

  return {
    hasConfig,
    configPath,
    isJSON: hasConfig
      ? path.extname(configPath) === '.json'
      : false,
  };
}

function getConfigFromJSON(configPath) {
  try {
    const fileString = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(fileString);

    if (config && typeof config === 'object') {
      return config;
    }
  } catch (error) {
    logger.error('Error reading config file');
    console.error(error);

    return null;
  }
}

function getConfig(configPath, isJSON) {
  return isJSON
    ? getConfigFromJSON(configPath)
    : reader.getConfigFromJS(configPath);
}

function getConfigConstants(projectId, argsConfigName) {
  const { hasConfig, configPath, isJSON } = configExists(argsConfigName);

  if (!hasConfig) {
    if (!projectId) {
      logger.error('Config file not found. No project ID provided', '', true);
    }

    const defaultConstants = getConstants();

    logger.info('Config file not found. Using default values');

    return {
      ...defaultConstants,
      projectId,
    };
  }

  dbugger.log('Getting config on:', configPath, isJSON ? 'as JSON' : 'as JS');

  const config = getConfig(configPath, isJSON);

  return getConstants(config);
}

module.exports = {
  getConfigConstants,
};
