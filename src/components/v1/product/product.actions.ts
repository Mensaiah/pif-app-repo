import { Response } from 'express';

import { IRequest } from '../../../types/global';
import { handleResponse } from '../../../utils/helpers';
import { useWord } from '../../../utils/wordSheet';

export const addProduct = async (req: IRequest, res: Response) => {
  try {
    // a product is active by default
    // a product needs approval so isApproved should be false
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const approveProduct = async (req: IRequest, res: Response) => {
  try {
    // only update isApproved and approvedBy
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const disapproveProduct = async (req: IRequest, res: Response) => {
  try {
    // only update isApproved
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const updateProduct = async (req: IRequest, res: Response) => {
  try {
    // only update isApproved and approvedBy
    // you can't add or remove split price from this endpoint
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const addProductSplitPrice = async (req: IRequest, res: Response) => {
  try {
    //
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const updateProductSplitPrice = async (req: IRequest, res: Response) => {
  try {
    // only update if useCount is zero
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const removeProductSplitPrice = async (req: IRequest, res: Response) => {
  try {
    // only remove if useCount is zero
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const setProductActive = async (req: IRequest, res: Response) => {
  try {
    // only update isActive
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const setProductInactive = async (req: IRequest, res: Response) => {
  try {
    // only update isActive
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};
