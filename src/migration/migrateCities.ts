import { Connection } from 'mysql2/promise';
import mysql from 'mysql2/promise';

import CityModel from '../components/v1/city/city.model';
import { consoleLog } from '../utils/helpers';

export const doCityMigrations = async (sql: Connection) => {
  consoleLog('City Migration in progress');

  const sqlQuery = `
    SELECT 
      cities.id as cityId,
      cities.enabled,
      cities.x,
      cities.y,
      cities.deleted_at as cityDeletedAt,
      cities.created_at as cityCreatedAt,
      cities.updated_at as cityUpdatedAt,
      cities_langs.id as langsId,
      cities_langs.lang,
      cities_langs.name as langName,
      cities_marketplace.id as marketplaceId,
      cities_marketplace.marketplace
    FROM 
      cities
    LEFT JOIN 
      cities_langs 
      ON cities.id = cities_langs.city_id
    LEFT JOIN 
      cities_marketplace
    ON cities.id = cities_marketplace.city_id;
  `;

  const [rows] = (await sql.query(sqlQuery)) as unknown as [
    mysql.RowDataPacket[],
    mysql.FieldPacket[]
  ];

  const cities: any = {};
  for (const row of rows) {
    if (!cities[row.cityId]) {
      // If the city does not exist, create it
      cities[row.cityId] = {
        name: [],
        id: row.cityId,
        enabled: row.enabled,
        x: row.x,
        y: row.y,
        deleted_at: row.cityDeletedAt,
        created_at: row.cityCreatedAt,
        updated_at: row.cityUpdatedAt,
        marketplace: row.marketplace,
      };
    }
    // Add the language and name to the city's name array
    cities[row.cityId].name.push({
      lang: row.lang,
      value: row.langName,
    });
  }

  const bulkOps = Object.values(cities).map((city: any) => ({
    updateOne: {
      filter: { old_id: city.id },
      update: {
        $setOnInsert: {
          old_id: city.id,
          isLegacyData: true,
          name: city.name,
          isEnabled: Boolean(city.enabled),
          x: city.x,
          y: city.y,
          marketplace: city.marketplace,
          deletedAt: city.deleted_at,
          createdAt: city.created_at,
          updatedAt: city.updated_at,
        },
      },
      upsert: true,
    },
  }));

  const mongoWriteOps = await CityModel.bulkWrite(bulkOps);

  consoleLog(
    'mongoWriteOps: ' + JSON.stringify(mongoWriteOps, null, 2),
    'info'
  );
};
