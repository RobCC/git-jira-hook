const path = require('path');


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
    console.error(error);

    return null;
  }
}

module.exports = {
  getConfigFromJS,
};
