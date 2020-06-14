const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const schemaFile = require('../bin/utils/config/schema');

const { schema } = schemaFile;

describe('config', () => {
  describe('schema', () => {
    it('should validate a correct config file', () => {
      const config = {
        projectId: 'TEST',
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

      expect(ajv.validate(schema, config)).toBe(true);
    });

    it('should validate a correct format with empty attributes as wrong', () => {
      const config = {
        projectId: 'TEST',
        commitTypes: {
          ticket: [],
          nonTicket: [],
        },
        branchTypes: {
          main: [],
          ticket: [],
          nonTicket: [],
        },
      };

      expect(ajv.validate(schema, config)).toBe(false);
    });

    it('should validate a correct config without projectId as wrong', () => {
      const config = {
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

      expect(ajv.validate(schema, config)).toBe(false);
    });

    it('should validate a config with extra attributes as wrong', () => {
      const config = {
        projectId: 'TEST',
        extraAttribute: {
          message: 'Hello world!',
        },
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

      expect(ajv.validate(schema, config)).toBe(false);
    });
  });
})
