import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import logger from '../logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getContentFromJS(configPath: string) {
  try {
    const relativePath = path.relative(__dirname, configPath);
    const { default: jsFile } = await import(relativePath);

    if (jsFile && typeof jsFile === 'object') {
      logger.debug('Config is JS file exporting an object');

      return jsFile;
    } else if (jsFile && typeof jsFile === 'function') {
      logger.debug('Config is JS file exporting a function');

      return jsFile();
    }
  } catch (error) {
    logger.error('Error reading config js file');
    console.error(error);

    return null;
  }
}

function getContentFromJSON(configPath: string) {
  logger.debug('Config is JSON');

  try {
    const fileString = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(fileString);

    if (config && typeof config === 'object') {
      return config;
    }
  } catch (error) {
    logger.error('Error reading config json file');
    console.error(error);

    return null;
  }
}

async function getFileContent(configPath: string) {
  const isJSON = path.extname(configPath) === '.json';

  if (isJSON) {
    return getContentFromJSON(configPath);
  }

  return getContentFromJS(configPath);
}

export default getFileContent;
