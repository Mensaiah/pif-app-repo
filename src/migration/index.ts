// import appConfig from '../config';

import { closeMongoDb, connectMongoDb } from '../config/persistence/database';
import { createSqlConnection } from '../config/persistence/mysqlClient';
import { consoleLog } from '../utils/helpers';

import { doCategoryMigrations } from './migrateCategories';
import { doCityMigrations } from './migrateCities';
import { doPartnersMigrations } from './migratePartners';
import { doUsersPifContactsMigrations } from './migratePifContacts';
import { doPifPurchasesMigrations } from './migratePifPurchases';
import { doPlatformAccountsMigrations } from './migratePlatformAccounts';

const doMigration = async () => {
  try {
    await connectMongoDb();
    const sql = await createSqlConnection();

    consoleLog('DB connections established. Migration in progress');

    await doCategoryMigrations(sql);
    await doCityMigrations(sql);
    await doPartnersMigrations(sql);
    await doPlatformAccountsMigrations(sql);
    // await doAppUserAccountsMigrations(sql);
    // await doPifPurchasesMigrations(sql);
    // await doUsersPifContactsMigrations(sql);
    // await doPifRequestsMigrations(sql);
  } catch (err) {
    consoleLog('some error occured' + err, 'error');
  } finally {
    closeMongoDb();
    consoleLog('we are done here');
    process.exit(0);
  }
};

doMigration();
