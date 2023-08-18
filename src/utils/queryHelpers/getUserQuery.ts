import { Document, FilterQuery } from 'mongoose';

import { isPlatformAdminWithMarketplaceAccess } from '../../components/v1/auth/authUtils';
import { UserModel } from '../../components/v1/user/user.model';
import { IRequest } from '../../types/global';

export const getUserQuery = async <T extends Document>(
  req: IRequest,
  user_id: string
): Promise<FilterQuery<T & Document>> => {
  const query: FilterQuery<T & Document & { user_id?: string }> = {};

  const { userAccess } = req;

  if (!user_id) return query;
  try {
    const queriedUser = await UserModel.findById(user_id);

    if (!queriedUser) {
      req.sendEmptyData = true;
      return query;
    }

    if (queriedUser.userType !== 'customer') {
      req.sendEmptyData = true;
      return query;
    }

    if (
      isPlatformAdminWithMarketplaceAccess(req, queriedUser.currentMarketplace)
    ) {
      query.user_id = user_id;
    }

    if (userAccess.marketplaces?.includes(queriedUser.currentMarketplace)) {
      query.user_id = user_id;
    }

    return query;
  } catch (err) {
    return query;
  }
};
