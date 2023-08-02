type QueryMap = {
  [key: string]: 'number' | 'positive' | 'string' | 'email' | 'boolean';
};

type ValueType<T> = T extends 'number' | 'positive'
  ? number
  : T extends 'boolean'
  ? boolean
  : string | null;

type QueryResult<T extends QueryMap> = {
  [K in keyof T]: ValueType<T[K]>;
};

export type { QueryMap, ValueType, QueryResult };
