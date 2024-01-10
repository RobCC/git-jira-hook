export {};

declare global {
  type CommitTypes = {
    ticket?: string[];
    nonTicket?: string[];
  };

  type BranchTypes = CommitTypes & {
    main?: string[];
  };

  type Config = {
    projectId: string | string[];
    commitTypes?: CommitTypes;
    branchTypes?: BranchTypes;
  };

  type ConfigValues = {
    projectId: string | string[];
    commitTypes: Required<CommitTypes>;
    branchTypes: Required<BranchTypes>;
  };

  type UnknownObject = Record<string, unknown>;
}
