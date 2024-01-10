import type { JSONSchemaType } from 'ajv';

const NULLABLE_ARRAY = {
  nullable: true,
  type: 'array',
  minItems: 0,
  items: { type: 'string' },
} as const;

const schema: JSONSchemaType<Config> = {
  type: 'object',
  required: ['projectId'],
  additionalProperties: false,
  properties: {
    projectId: {
      type: ['string', 'array'],
      minItems: 1,
      items: { type: 'string' },
      oneOf: [
        {
          type: 'string',
        },
        {
          type: 'array',
          items: { type: 'string' },
        },
      ],
    },
    commitTypes: {
      nullable: true,
      type: 'object',
      maxProperties: 2,
      properties: {
        ticket: NULLABLE_ARRAY,
        nonTicket: NULLABLE_ARRAY,
      },
    },
    branchTypes: {
      nullable: true,
      type: 'object',
      maxProperties: 3,
      properties: {
        main: NULLABLE_ARRAY,
        ticket: NULLABLE_ARRAY,
        nonTicket: NULLABLE_ARRAY,
      },
    },
  },
};

export default schema;
