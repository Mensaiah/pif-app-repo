/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import appConfig from '../config';
import { IRequest, IPaginationData, LanguageValuePair } from '../types/global';

// import normalizeLang from './normalizeLang';
import { isArray, isObject } from './validators';

export const consoleLog = (
  data: any,
  type: 'info' | 'error' = 'info'
): void => {
  if (appConfig.environment !== 'dev') return; // handle logging with winston

  if (isObject(data)) {
    type === 'info'
      ? console.log(JSON.stringify(data, null, 2))
      : console.error(JSON.stringify(data, null, 2));
  } else {
    type === 'info' ? console.log(data) : console.error(data);
  }
};

export const handleResponse = (
  res: Response,
  data: any,
  status = 200,
  err?: any
): Response => {
  if (err && appConfig.environment === 'dev') consoleLog(err); // TODO: remove before deployments

  if (status >= 400) {
    if (err && err.name && err.name === 'MongoError') {
      if (err.code === 11000) return res.status(400).send('duplicate detected');
    }
  }

  if (typeof data === 'string') {
    return res.status(status).json({
      message: data,
    });
  }

  if (isObject(data) || isArray(data)) {
    return res.status(status).json(data);
  }

  return res.status(status).send(data);
};

export const uuid = (): string => uuidv4();

export const generateNos = (len = 6) => {
  const max = Math.pow(10, len) - 1;
  const min = Math.pow(10, len - 1);

  return BigInt(Math.floor(Math.random() * (max - min + 1) + min)).toString();
};

export const generateId = (length = 9): string =>
  Math.random().toString(36).substring(2, length);

export const _omit = (obj: any, blackList: any[]) => {
  if (isObject(obj)) {
    return Object.keys(obj)
      .filter((k) => !blackList.includes(k))
      .map((k) => Object.assign({}, { [k]: obj[k] }))
      .reduce((res, o) => Object.assign(res, o), {});
  } else if (isArray(obj)) {
    return obj.filter((k: any) => !blackList.includes(k));
  }

  return obj;
};

export const _pick = (obj: any, whiteList: any[]) => {
  if (isObject(obj)) {
    return Object.keys(obj)
      .filter((k) => whiteList.includes(k))
      .map((k) => Object.assign({}, { [k]: obj[k] }))
      .reduce((res, o) => Object.assign(res, o), {});
  } else if (isArray(obj)) {
    return obj.filter((k: any) => whiteList.includes(k));
  }

  return obj;
};

export const capitalize = (word: string) =>
  word
    .split(' ')
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

// export const userProfileOmitFields = (
//   _userType: IUserTypes = 'customer',
//   additionalFields: string[] | string = []
// ) => {
//   const list = ['otp', 'isBanned', 'access', '_id', '__v'];

//   return list.concat(additionalFields);
// };

// change back language data to db structure
export const langDbStructure = (
  langArray: LanguageValuePair[]
): Record<string, string> => {
  const langObj: Record<string, string> = {};

  langArray.forEach((item) => {
    langObj[item.lang] = item.value;
  });

  return langObj;
};

type DataInput = {
  [key: string]: any; // Can be number, string or LangObject array
};

export const normalizeLang = (data: DataInput | DataInput[]): any => {
  // Check if data is an array
  if (Array.isArray(data)) {
    // If it's an array, recursively call normalizeLang for each item in the array
    return data.map((item) => normalizeLang(item));
  } else {
    // If it's not an array, it's an individual object. Process it.
    const normalized: any = {};

    for (const key in data) {
      if (
        Array.isArray(data[key]) &&
        data[key].length > 0 &&
        data[key][0].hasOwnProperty('lang')
      ) {
        normalized[key] = {};
        for (const item of data[key]) {
          normalized[key][item.lang] = item.value;
        }
      } else {
        normalized[key] = data[key];
      }
    }

    return normalized;
  }
};

export const handlePaginate = (req: IRequest) => {
  let page = req.query.page || 1;
  let perPage = req.query.per_page || 15;

  if (req.query.per_page) {
    let q = req.query.per_page;
    if (Array.isArray(q)) q = q[0];
  }

  if (Array.isArray(page)) page = page[0];
  if (Array.isArray(perPage)) perPage = perPage[0];

  const currentPage = Number(page);
  perPage = Number(perPage);

  const paginationData: IPaginationData = {
    currentPage,
    perPage,
    paginationQueryOptions: {
      sort: { _id: -1 },
      skip: perPage * (currentPage - 1),
      limit: perPage,
    },
  };
  return {
    paginationData,
    queryOptions: paginationData.paginationQueryOptions,
    getMeta: (count: number) => {
      const totalPages: number = Math.ceil(count / paginationData.perPage);
      const nextPage = currentPage + 1 <= totalPages ? currentPage + 1 : null;
      const prevPage = currentPage > 1 ? currentPage - 1 : null;
      return {
        totalRows: count,
        totalPages,
        currentPage: page,
        perPage,
        nextPage,
        prevPage,
      };
    },
  };
};

export const handleReqSearch = (req: Request, keys: string[]) => {
  const searchQuery = (req.query.query as string) || '';
  if (searchQuery) {
    const query: {
      $or: { [x: string]: { $regex: string; $options: string } }[];
    } = {
      $or: [],
    };
    keys.forEach((key) => {
      query.$or.push({ [key]: { $regex: searchQuery, $options: 'i' } });
    });
    return query;
  }
  return {};
};

export const cleanLangArray = (arr: LanguageValuePair[]) => {
  return arr
    .filter((arr) => arr.value)
    .filter((arr) => appConfig.supportedLanguages.includes(arr.lang));
};

export const deNormalizeLangObject = (
  langObject: Record<string, string>,
  oldValues?: LanguageValuePair[]
) => {
  const values = {
    ...(normalizeLang(oldValues ?? []) ?? {}),
    ...(langObject ?? {}),
  };

  return values
    ? cleanLangArray(
        Object.keys(values).map((key) => ({
          lang: key as (typeof appConfig.supportedLanguages)[number],
          value: values[key],
        }))
      )
    : undefined;
};

export const translateWordObj = (data: Record<string, string>, lang = 'ar') => {
  return data[lang];
};

export const translateWordArray = (
  data: { language: string; value: string }[],
  lang = 'ar'
) => {
  return normalizeLang(data)[lang];
};

export function searchFiles(startPath: string, filter: string): string[] {
  // Initialize an array to store the found file paths
  const foundFiles: string[] = [];

  // Check if the start path directory exists
  if (!fs.existsSync(startPath)) {
    return foundFiles;
  }

  const queue: string[] = [startPath];

  while (queue.length > 0) {
    // Get the current directory path from the queue

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentPath = queue.shift()!;

    // Read the files in the current directory
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      // Get the full file path
      const filePath = path.join(currentPath, file);

      // Get the file's status (whether it's a directory or a file)
      const stat = fs.lstatSync(filePath);

      if (stat.isDirectory()) {
        // Add the directory path to the queue for further processing
        queue.push(filePath);
      } else if (file.endsWith(filter)) {
        // File with the desired extension found, add it to the foundFiles array
        foundFiles.push(filePath);
      }
    }
  }

  // Return the array of found file paths
  return foundFiles;
}

export const sanitizedField = (field: string) => {
  return field.replace(/\s/g, '-').toLowerCase();
};
