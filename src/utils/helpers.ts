/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Request, Response } from 'express';
import { isArray, isObject } from './validators';
import appConfig from '../config';
import { v4 as uuidv4 } from 'uuid';
import { IRequest, IPaginationData, LanguageValuePair } from '../types/global';
import normalizeLang from './normalizeLang';

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

export const uid = (): string => uuidv4();

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
    langObj[item.language] = item.value;
  });

  return langObj;
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
    .filter((arr) => appConfig.supportedLanguages.includes(arr.language));
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
          language: key as (typeof appConfig.supportedLanguages)[number],
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

// export const generateOrderNo = async () => {
//   const count = await Order.count();
//   const twoDigitRandom = generateNos(2);
//   return `HK${twoDigitRandom}${count.toString().padStart(6, '0')}`;
// };