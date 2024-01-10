const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });

const logger = require("../logger");

const schema = {
  type: "object",
  required: ["projectId"],
  additionalProperties: false,
  properties: {
    projectId: {
      type: "string",
    },
    commitTypes: {
      type: "object",
      maxProperties: 2,
      properties: {
        ticket: {
          type: "array",
          minItems: 1,
          items: { type: "string" },
        },
        nonTicket: {
          type: "array",
          minItems: 1,
          items: { type: "string" },
        },
      },
    },
    branchTypes: {
      type: "object",
      maxProperties: 3,
      properties: {
        main: {
          type: "array",
          minItems: 1,
          items: { type: "string" },
        },
        ticket: {
          type: "array",
          minItems: 1,
          items: { type: "string" },
        },
        nonTicket: {
          type: "array",
          minItems: 1,
          items: { type: "string" },
        },
      },
    },
  },
};

function displayErrors(errors) {
  logger.error("Configuration is not valid. Using default values.");

  for (var i = 0; i < errors.length; i++) {
    const error = errors[i];

    console.log(error.dataPath, error.message);
  }
}

function isValid(config) {
  const isValid = ajv.validate(schema, config);

  if (isValid) {
    return true;
  } else {
    displayErrors(ajv.errors);
    return false;
  }
}

module.exports = {
  schema,
  isValid,
};
