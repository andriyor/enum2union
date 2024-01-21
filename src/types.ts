export type StringObject = Record<string, string>;

export type VarMeta = {
  name: string;
  object: StringObject;
};

export type Config = {
  projectFiles: string;
  helperDir?: string;
};
