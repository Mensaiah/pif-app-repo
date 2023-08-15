import mongoose from 'mongoose';

import appConfig from '..';
import { UserAccessModel } from '../../components/v1/auth/auth.models';
import PlatformModel from '../../components/v1/platform/platform.model';
import {
  MarketplaceAttributes,
  PlatformAttributes,
} from '../../components/v1/platform/platform.types';
import { UserModel } from '../../components/v1/user/user.model';
import { UserAttributes } from '../../components/v1/user/user.types';
import WalletModel from '../../components/v1/wallet/wallet.model';
import { consoleLog } from '../../utils/helpers';
import defaultUserTypesRolesAndPermissions from '../defaultRolesAndPermissions';

const { seedData } = appConfig;

const defaultMarketplaces: MarketplaceAttributes[] = [
  {
    name: 'denmark',
    code: 'dk',
    currency: 'Danish krone',
    currencyCode: 'DKK',
    language: 'danish',
    languageCode: 'da',
    currencySymbol: 'kr ',
    paymentProcessors: ['mobilePay', 'nets'],
    socials: [],
  },
  {
    name: 'sweden',
    code: 'se',
    currency: 'Swedish krona',
    currencyCode: 'SEK',
    language: 'swedish',
    languageCode: 'sv',
    currencySymbol: 'kr ',
    paymentProcessors: ['nets'],
    socials: [],
  },
  {
    name: 'spain',
    code: 'es',
    currency: 'Euro',
    currencyCode: 'EUR',
    language: 'spanish',
    languageCode: 'es',
    currencySymbol: '€',
    paymentProcessors: ['stripe'],
    socials: [],
  },
  {
    name: 'nigeria',
    code: 'ng',
    currency: 'Nigerian naira',
    currencyCode: 'NGN',
    language: 'english',
    languageCode: 'en',
    currencySymbol: '₦',
    paymentProcessors: ['paystack'],
    socials: [],
  },
  {
    name: 'united kingdom',
    code: 'gb',
    language: 'english',
    languageCode: 'en',
    currency: 'British pound',
    currencyCode: 'GBP',
    currencySymbol: '£',
    paymentProcessors: ['stripe'],
    socials: [],
  },
  {
    name: 'canada',
    code: 'ca',
    language: 'english',
    languageCode: 'en',
    currency: 'Canadian dollar',
    currencyCode: 'CAD',
    currencySymbol: '$',
    paymentProcessors: ['stripe'],
    socials: [],
  },
  {
    name: 'united states',
    code: 'us',
    language: 'english',
    languageCode: 'en',
    currency: 'United States dollar',
    currencyCode: 'USD',
    currencySymbol: '$',
    paymentProcessors: ['stripe'],
    socials: [],
  },
  {
    name: 'italy',
    code: 'it',
    language: 'italian',
    languageCode: 'it',
    currency: 'Euro',
    currencyCode: 'EUR',
    currencySymbol: '€',
    paymentProcessors: ['stripe'],
    socials: [],
  },
  // {
  //   name: 'poland',
  //   code: 'pl',
  //   language: 'polish',
  //   languageCode: 'pl',
  //   currency: 'Polish złoty',
  //   currencyCode: 'PLN',
  //   currencySymbol: 'zł',
  //   paymentProcessors: ['stripe'],
  //   socials: [],
  // },
];

export const seedNow = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const platformDataExists = await PlatformModel.findOne().session(session);

    if (platformDataExists) {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    consoleLog('Seeding started ⚙️');

    // TODO: create seed user
    await new PlatformModel<PlatformAttributes>({
      version: '1.1.0',
      marketplaces: defaultMarketplaces,
      defaultUserTypesAndRoles: defaultUserTypesRolesAndPermissions,
      socials: [],
    }).save({ session });

    await Promise.all(
      defaultMarketplaces.map((marketplace) => {
        const marketplaceWallet = new WalletModel({
          currency: marketplace.currencyCode,
          marketplace: marketplace.code,
          walletType: 'system',
        });

        return marketplaceWallet.save({ session });
      })
    );

    const seeduser = new UserModel<UserAttributes>({
      name: seedData.name,
      email: seedData.email,
      userType: 'platform-admin',
      contact: seedData.contact,
      isConfirmed: true,
    });

    await seeduser.save({ session });

    await new UserAccessModel({
      User: seeduser._id,
      password: seedData.password,
      role: 'super-admin',
      permissions: ['supreme'],
      failedLoginAttempts: 0,
      sessions: [],
    }).save({ session });

    await session.commitTransaction();
    session.endSession();

    consoleLog('Seeding complete ✅');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    consoleLog(
      'error fetching info from DB: ' + JSON.stringify(err, null, 2),
      'error'
    );
  }
};

// create a funtion to seed the database
