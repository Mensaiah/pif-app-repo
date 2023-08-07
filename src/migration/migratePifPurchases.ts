import fs from 'fs';
import path from 'path';

import { Connection } from 'mysql2/promise';
import mysql from 'mysql2/promise';

import { consoleLog } from '../utils/helpers';

export const doPifPurchasesMigrations = async (sql: Connection) => {
  consoleLog('Partners Migration in progress');

  const sqlQuery = `
  SELECT
    *
    FROM users_pif_purchase
  `;

  const [rows] = (await sql.query(sqlQuery)) as unknown as [
    mysql.RowDataPacket[],
    mysql.FieldPacket[]
  ];

  consoleLog('users: ' + JSON.stringify(rows.slice(0, 5), null, 2));
  consoleLog('users length: ' + rows.length);

  fs.writeFileSync(
    path.join(__dirname, './data/pifPurchases.json'),
    JSON.stringify(rows, null, 2)
  );
};
