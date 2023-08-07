import fs from 'fs';
import path from 'path';

import { Connection } from 'mysql2/promise';
import mysql from 'mysql2/promise';

import { consoleLog } from '../utils/helpers';

export const doUsersPifContactsMigrations = async (sql: Connection) => {
  consoleLog('Users Contacts Migration in progress');

  const sqlQuery = `
  SELECT
    *
    FROM users_pif_contacts
  `;

  const [rows] = (await sql.query(sqlQuery)) as unknown as [
    mysql.RowDataPacket[],
    mysql.FieldPacket[]
  ];

  consoleLog('users contacts: ' + JSON.stringify(rows.slice(0, 5), null, 2));
  consoleLog('users contacts length: ' + rows.length);

  fs.writeFileSync(
    path.join(__dirname, './data/userContacts.json'),
    JSON.stringify(rows, null, 2)
  );
};
