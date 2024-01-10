export {};

declare global {
  type Config = {
    projectId: string;
    commitTypes: {
      ticket: string[];
      nonTicket: string[];
    };
    branchTypes: {
      main: string[];
      ticket: string[];
      nonTicket: string[];
    };
  };

  type UnknownObject = Record<string, unknown>;
}
