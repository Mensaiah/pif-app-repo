import fs from 'fs';
import path from 'path';

import { Connection } from 'mysql2/promise';
import mysql from 'mysql2/promise';

import { consoleLog } from '../utils/helpers';

export const doPifRequestsMigrations = async (sql: Connection) => {
  consoleLog('Users Pif Requests Migration in progress');

  const sqlQuery = `
  SELECT
    *
    FROM users_pif_request
  `;

  const [rows] = (await sql.query(sqlQuery)) as unknown as [
    mysql.RowDataPacket[],
    mysql.FieldPacket[]
  ];

  consoleLog('data: ' + JSON.stringify(rows.slice(0, 5), null, 2));
  consoleLog('data length: ' + rows.length);

  fs.writeFileSync(
    path.join(__dirname, './data/usersPifRequests.json'),
    JSON.stringify(rows, null, 2)
  );
};
