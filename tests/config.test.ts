import Ajv from 'ajv';
import SCHEMA from '../bin/utils/config/schema';

const ajv = new Ajv({ allErrors: true });

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

      expect(ajv.validate(SCHEMA, config)).toBe(true);
    });

    it('should validate a correct format with empty attributes as correct', () => {
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

      expect(ajv.validate(SCHEMA, config)).toBe(true);
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

      expect(ajv.validate(SCHEMA, config)).toBe(false);
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

      expect(ajv.validate(SCHEMA, config)).toBe(false);
    });
  });
});
