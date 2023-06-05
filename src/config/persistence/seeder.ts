import appConfig from '..';
import { UserAccessModel } from '../../components/v1/auth/auth.models';
import PlatformModel from '../../components/v1/platform/platform.model';
import { PlatformAttributes } from '../../components/v1/platform/platform.types';
import { UserModel } from '../../components/v1/user/user.model';
import { UserAttributes } from '../../components/v1/user/user.types';
import { consoleLog } from '../../utils/helpers';

const { seedData } = appConfig;

export const seedNow = async () => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const platformDataExists = await PlatformModel.findOne();
    // .session(session);
    if (platformDataExists) {
      // await session.abortTransaction();
      // session.endSession();
      return;
    }

    consoleLog('Seeding started ⚙️');
    // TODO: create seed user
    await new PlatformModel<PlatformAttributes>({
      version: '1.1.0',
      marketplaces: [
        {
          name: 'denmark',
          code: 'dk',
          currency: 'Danish krone',
          currencyCode: 'DKK',
          language: 'danish',
          languageCode: 'da',
          currencySymbol: 'kr ',
        },
        {
          name: 'sweden',
          code: 'se',
          currency: 'Swedish krona',
          currencyCode: 'SEK',
          language: 'swedish',
          languageCode: 'sv',
          currencySymbol: 'kr ',
        },
        {
          name: 'spain',
          code: 'es',
          currency: 'Euro',
          currencyCode: 'EUR',
          language: 'spanish',
          languageCode: 'es',
          currencySymbol: '€',
        },
        {
          name: 'nigeria',
          code: 'ng',
          currency: 'Nigerian naira',
          currencyCode: 'NGN',
          language: 'english',
          languageCode: 'en',
          currencySymbol: '₦',
        },
        {
          name: 'united kingdom',
          code: 'gb',
          language: 'english',
          languageCode: 'en',
          currency: 'British pound',
          currencyCode: 'GBP',
          currencySymbol: '£',
        },
      ],
    }).save();
    // .save({ session })
    const seeduser = new UserModel<UserAttributes>({
      name: seedData.name,
      email: seedData.email,
      userType: 'admin',
      contact: seedData.contact,
      isConfirmed: true,
    });
    await seeduser.save();
    await new UserAccessModel({
      User: seeduser._id,
      password: seedData.password,
      rolesAndPermissions: [
        {
          role: 'super admin',
          permissions: ['supreme'],
        },
      ],
      failedLoginAttempts: 0,
      sessions: [],
    }).save();

    // await session.commitTransaction();
    // session.endSession();
    consoleLog('Seeding complete ✅');
  } catch (err) {
    // await session.abortTransaction();
    // session.endSession();
    consoleLog(
      'error fetching info from DB: ' + JSON.stringify(err, null, 2),
      'error'
    );
  }
};
