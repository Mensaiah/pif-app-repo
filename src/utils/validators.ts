/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'bson';
import mongoose from 'mongoose';

export const isString = (value: any) =>
  typeof value === 'string' || value instanceof String;

export const isNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value);

export const isArray = (value: any) => Array.isArray(value);

export const isFunction = (value: any) => typeof value === 'function';

export const isObject = (value: { constructor: ObjectConstructor }) =>
  value && typeof value === 'object' && value.constructor === Object;

export const isNull = (value: null) => value === null;

export const isUndefined = (value: any) => typeof value === 'undefined';

export const isBoolean = (value: any) => typeof value === 'boolean';

export const isRegex = (value: { constructor: RegExpConstructor }) =>
  value && typeof value === 'object' && value.constructor === RegExp;

export const isError = (value: { message: any }) =>
  value instanceof Error && typeof value.message !== 'undefined';

export const isDate = (value: any) => value instanceof Date;

export const isSymbol = (value: any) => typeof value === 'symbol';

/**
 * Validates email
 * @param {string} email
 * @return {Boolean} true or false
 */
export const validateEmail = (email: string) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

/**
 * validates mongoose id
 * @param {string} id
 */
export const isValidId = (id: string | number | ObjectId) =>
  mongoose.Types.ObjectId.isValid(id);

export const isValidDate = (year: number, month: number, day: number) => {
  const date = new Date(year, +month - 1, day);
  // eslint-disable-next-line eqeqeq
  return Boolean(+date) && date.getDate() == day;
};
