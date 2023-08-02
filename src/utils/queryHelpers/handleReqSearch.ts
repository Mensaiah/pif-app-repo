import { Request } from 'express';
import { ParsedQs } from 'qs';
import validator from 'validator';

import { ValueType, QueryMap, QueryResult } from './queryHelperTypes';

const parseType = <
  T extends 'number' | 'positive' | 'string' | 'email' | 'boolean'
>(
  value: ParsedQs | ParsedQs[] | string | string[],
  type: T
): ValueType<T> => {
  if (Array.isArray(value)) {
    value = value[0];
  }

  if (typeof value === 'object') {
    return null;
  }

  let parsedValue: number | string | boolean = value as string;

  switch (type) {
    case 'number':
    case 'positive':
      parsedValue = parseInt(parsedValue as string);
      if (type === 'positive') {
        return (
          (parsedValue as number) >= 0 ? parsedValue : null
        ) as ValueType<T>;
      }
      return (
        isNaN(parsedValue as number) ? null : parsedValue
      ) as ValueType<T>;
    case 'string':
    case 'email':
      parsedValue = validator.blacklist(
        (parsedValue as string) || '',
        '<>[]\\/{}="'
      );
      if (type === 'email') {
        return (
          validator.isEmail(parsedValue as string) ? parsedValue : null
        ) as ValueType<T>;
      }
      return (parsedValue || null) as ValueType<T>;
    case 'boolean':
      parsedValue =
        parsedValue === 'true' ? true : parsedValue === 'false' ? false : null;
      return parsedValue as ValueType<T>;
    default:
      return null;
  }
};

export const handleReqSearch = <T extends QueryMap>(
  req: Request,
  keys: T
): QueryResult<T> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};

  for (const [field, type] of Object.entries(keys)) {
    const value = req.query[field];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result[field] = parseType(value, type as any);
  }

  return result;
};
