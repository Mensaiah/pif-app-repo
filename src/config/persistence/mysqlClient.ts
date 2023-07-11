import { Duplex } from 'stream'; // import Duplex stream type

import mysql from 'mysql2/promise';
import { Client } from 'ssh2';

import appConfig from '..';
import { consoleLog } from '../../utils/helpers';

export const createSqlConnection = async () => {
  const sshConfig = {
    host: appConfig.sqlSshHost,
    port: appConfig.sqlSshPort,
    username: appConfig.sqlSshUser,
    password: appConfig.sqlSshPass,
  };

  const dbConfig: mysql.ConnectionOptions & { stream?: Duplex } = {
    host: appConfig.sqlHost,
    user: appConfig.sqlUser,
    password: appConfig.sqlPass,
    port: appConfig.sqlPort,
    database: appConfig.sqlDbName,
    connectTimeout: 12345,
  };

  return new Promise<mysql.Connection>(async (resolve, reject) => {
    const ssh = new Client();

    ssh
      .on('ready', function () {
        ssh.forwardOut(
          'localhost',
          12345,
          dbConfig.host,
          dbConfig.port,
          async (err, stream) => {
            if (err) {
              return reject(err);
            }

            dbConfig.stream = stream;

            try {
              const connection = await mysql.createConnection(dbConfig);

              resolve(connection);
            } catch (err) {
              reject(err);
            }
          }
        );
      })
      .on('error', (err) => {
        // handle the error event
        consoleLog('SSH connection error:' + err, 'error');
        reject(err);
      })
      .connect(sshConfig);
  });
};
