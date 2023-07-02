import { Response } from 'express';

import { IRequest } from '../../../types/global';
import { handleResponse } from '../../../utils/helpers';
import { useWord } from '../../../utils/wordSheet';

export const getCategories = async (req: IRequest, res: Response) => {
  // take narketplace from params
  // /categories/all /categories/nigeria /categories/public
  // if params is all, just return all categories
  // return list of categories
  // leave out deletedAt
  try {
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const getInternalCategories = async (req: IRequest, res: Response) => {
  try {
    // simply return array of internal categories
    // leave out addedBy field
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const getUploadedCategoryIcons = async (
  req: IRequest,
  res: Response
) => {
  try {
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const removeUploadedCategoryIcons = async (
  req: IRequest,
  res: Response
) => {
  try {
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const addCategory = async (req: IRequest, res: Response) => {
  try {
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const editCategory = async (req: IRequest, res: Response) => {
  try {
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const removeCategory = async (req: IRequest, res: Response) => {
  // make sure no product is using it
  try {
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const addInternalCategory = async (req: IRequest, res: Response) => {
  try {
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const editInternalCategory = async (req: IRequest, res: Response) => {
  try {
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const removeInternalCategory = async (req: IRequest, res: Response) => {
  // make sure no product is using it before deleting it
  try {
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};
