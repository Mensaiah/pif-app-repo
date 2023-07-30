import { Connection } from 'mysql2/promise';
import mysql from 'mysql2/promise';

import { CategoryModel } from '../components/v1/category/category.model';
import { consoleLog } from '../utils/helpers';

export const doCategoryMigrations = async (sql: Connection) => {
  consoleLog('Category Migration in progress');

  const sqlQuery = `
      SELECT 
      categories.id as categoryId,
      categories.enabled,
      categories.promoted,
      categories.main,
      categories.supplier_list,
      categories.is_functional,
      categories.is_birthday,
      categories.type,
      categories.icon,
      categories.icon_id,
      categories.deleted_at as categoryDeletedAt,
      categories.created_at as categoryCreatedAt,
      categories.updated_at as categoryUpdatedAt,
      category_icons.id as iconId,
      category_icons.name as iconName,
      category_icons.icon as iconIcon,
      category_icons.deleted_at as iconDeletedAt,
      category_icons.created_at as iconCreatedAt,
      category_icons.updated_at as iconUpdatedAt,
      category_langs.id as langsId,
      category_langs.lang,
      category_langs.name as langName,
      category_marketplace.id as marketplaceId,
      category_marketplace.marketplace
      FROM categories
      LEFT JOIN category_icons 
      ON categories.icon_id = category_icons.id
      LEFT JOIN category_langs 
      ON categories.id = category_langs.category_id
      LEFT JOIN category_marketplace
      ON categories.id = category_marketplace.category_id;
    `;

  const [rows] = (await sql.query(sqlQuery)) as unknown as [
    mysql.RowDataPacket[],
    mysql.FieldPacket[]
  ];

  const categories: any = {};
  for (const row of rows) {
    const category = categories[row.categoryId] || {
      id: row.categoryId,
      enabled: row.enabled,
      promoted: row.promoted,
      main: row.main,
      supplier_list: row.supplier_list,
      is_functional: row.is_functional,
      is_birthday: row.is_birthday,
      type: row.type,
      icon: row.icon,
      icon_id: row.icon_id,
      deleted_at: row.categoryDeletedAt,
      created_at: row.categoryCreatedAt,
      updated_at: row.categoryUpdatedAt,
      iconId: row.iconId,
      iconName: row.iconName,
      iconIcon: row.iconIcon,
      iconDeletedAt: row.iconDeletedAt,
      iconCreatedAt: row.iconCreatedAt,
      iconUpdatedAt: row.iconUpdatedAt,
      marketplaceId: row.marketplaceId,
      marketplace: row.marketplace,
      name: [],
    };
    const catName: any = {};
    catName[row.lang] = row.langName;
    category.name = Object.entries(catName).map(([lang, name]: any) => ({
      lang,
      value: name,
    }));

    categories[row.categoryId] = category;
  }

  const bulkOps = Object.values(categories).map((category: any) => ({
    updateOne: {
      filter: { old_id: category.old_id, isLegacyData: true },
      update: {
        $setOnInsert: {
          old_id: category.id,
          isLegacyData: true,
          name: category.name,
          isEnabled: Boolean(category.enabled),
          isPromoted: Boolean(category.promoted),
          isSupplierList: Boolean(category.supplier_list),
          isMain: Boolean(category.main),
          isFunctional: Boolean(category.is_functional),
          type: category.type,
          isBirthday: Boolean(category.is_birthday),
          deletedAt: category.deleted_at,
          marketplaces: [category.marketplace],
          Icon:
            category.icon ||
            (category.iconIcon
              ? 'https://admin.pif-app.com/upload/icons/' + category.iconIcon
              : ''),
          createdAt: category.created_at,
          updatedAt: category.updated_at,
        },
      },
      upsert: true,
    },
  }));

  const mongoWriteOps = await CategoryModel.bulkWrite(bulkOps);

  consoleLog(
    'mongoWriteOps: ' + JSON.stringify(mongoWriteOps, null, 2),
    'info'
  );
};
