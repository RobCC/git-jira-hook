export default {
  type: 'object',
  required: ['projectId'],
  additionalProperties: false,
  properties: {
    projectId: {
      type: ['string', 'array'],
      minItems: 1,
      items: { type: 'string' },
    },
    commitTypes: {
      type: 'object',
      maxProperties: 2,
      properties: {
        ticket: {
          type: 'array',
          minItems: 0,
          items: { type: 'string' },
        },
        nonTicket: {
          type: 'array',
          minItems: 0,
          items: { type: 'string' },
        },
      },
    },
    branchTypes: {
      type: 'object',
      maxProperties: 3,
      properties: {
        main: {
          type: 'array',
          minItems: 0,
          items: { type: 'string' },
        },
        ticket: {
          type: 'array',
          minItems: 0,
          items: { type: 'string' },
        },
        nonTicket: {
          type: 'array',
          minItems: 0,
          items: { type: 'string' },
        },
      },
    },
  },
};
