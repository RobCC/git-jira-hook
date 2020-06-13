const appRoot = require('app-root-path');
const path = require('path');
const fs = require('fs');

const logger = require('../logger');
const constants = require('./constants');

const ROOT = appRoot.toString();
const CONFIG_DEFAULT_NAME_JSON = 'hooks.config.json';
const CONFIG_DEFAULT_NAME_JS = 'hooks.config.js';

let CONFIG_PATH;

function setConfigPath(configPath) {
  CONFIG_PATH = configPath;
}

function getConfigPath() {
  return CONFIG_PATH;
}

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

  if (configPath) {
    setConfigPath(configPath);
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

    return null;
  }
}

function getConfigFromJS(configPath) {
  try {
    const relativePath = path.relative(__dirname, configPath);
    const jsFile = require(relativePath);

    if (jsFile && typeof jsFile === 'object') {
      return jsFile;
    } else if (jsFile && typeof jsFile === 'function') {
      return jsFile();
    }
  } catch (error) {
    logger.error('Error reading config file');

    return null;
  }
}

function getConfig(configPath, isJSON) {
  return isJSON
    ? getConfigFromJSON(configPath)
    : getConfigFromJS(configPath);
}

function getConfigConstants(projectId, argsConfigName) {
  const { hasConfig, configPath, isJSON } = configExists(argsConfigName);

  if (!hasConfig) {
    if (!projectId) {
      logger.error('Config file not found. No project ID provided');
      process.exit(1);
    }

    const defaultConstants = constants.getConstants();

    logger.info('Config file not found. Using default values');

    return {
      ...defaultConstants,
      projectId,
    };
  }

  const config = getConfig(configPath, isJSON);

  return constants.getConstants(config);
}

module.exports = {
  getConfigPath,
  getConfigConstants,
};
