import PlatformModel from 'src/components/v1/platform/platform.model';
import { PlatformAttributes } from 'src/components/v1/platform/platform.types';
import { UserModel } from 'src/components/v1/user/user.model';
import { UserAttributes } from 'src/components/v1/user/user.types';
import { consoleLog } from 'src/utils/helpers';
import appConfig from '..';
import { UserAccessModel } from 'src/components/v1/auth/auth.models';

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
          currencyCode: 'kr',
          language: 'danish',
          languageCode: 'da',
        },
        {
          name: 'sweden',
          code: 'se',
          currency: 'Swedish krona',
          currencyCode: 'kr',
          language: 'swedish',
          languageCode: 'sv',
        },
        {
          name: 'spain',
          code: 'es',
          currency: 'Euro',
          currencyCode: '€',
          language: 'spanish',
          languageCode: 'es',
        },
        {
          name: 'nigeria',
          code: 'ng',
          currency: 'Nigerian naira',
          currencyCode: '₦',
          language: 'english',
          languageCode: 'en',
        },
        {
          name: 'united kingdom',
          code: 'gb',
          language: 'english',
          languageCode: 'en',
          currency: 'British pound',
          currencyCode: '£',
        },
      ],
    }).save();
    // .save({ session })
    const seeduser = new UserModel<UserAttributes>({
      name: seedData.name,
      email: seedData.email,
      userType: 'admin',
      contact: seedData.contact,
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
