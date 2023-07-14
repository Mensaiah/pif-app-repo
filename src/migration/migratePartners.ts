import { Connection } from 'mysql2/promise';
import mysql from 'mysql2/promise';

import { PartnerModel } from '../components/v1/partner/partner.model';
import defaultUserTypesRolesAndPermissions from '../config/defaultRolesAndPermissions';
import { consoleLog } from '../utils/helpers';

export const doPartnersMigrations = async (sql: Connection) => {
  consoleLog('Partners Migration in progress');

  const sqlQuery = `
  SELECT 
  partners.*,
  partner_settlings.transaction_fee as settling_transaction_fee,
  partner_settlings.transaction_fee_value as settling_transaction_fee_value,
  partner_settlings.type AS settling_type,
  partner_settlings.period_type as settling_period_type,
  partner_settlings.amount as settling_amount,
  partner_settlings.currency as settling_currency,
  partner_settlings.proportion_start as settling_proportion_start,
  partner_settlings.proportion_finish as settling_proportion_finish,
  partner_settlings.proportion_pif as settling_proportion_pif,
  partner_settlings.fixed_fee as settling_fixed_fee
FROM 
  partners
LEFT JOIN 
  partner_settlings
  ON partners.id = partner_settlings.partner_id;
  `;

  const [rows] = (await sql.query(sqlQuery)) as unknown as [
    mysql.RowDataPacket[],
    mysql.FieldPacket[]
  ];

  const partners = rows.map((partner: any) => ({
    ...partner,
    logo_crop_data: partner.logo_crop_data
      ? JSON.parse(partner.logo_crop_data)
      : null,
  }));

  consoleLog('rows length: ' + rows.length);
  const durationTypeKeys = { 1: 'daily', 2: 'monthly', 3: 'weekly' };
  const statusKeys = { 1: 'active', 2: 'not-verified', 3: 'inactive' };

  const mongoWriteOps = await PartnerModel.bulkWrite(
    partners.map((partner: any) => ({
      updateOne: {
        filter: { old_id: partner.id },
        update: {
          $setOnInsert: {
            old_id: partner.id,
            isLegacyData: true,
            name: partner.name,
            email: partner.email,
            marketplaces: [partner.marketplace],
            vat: partner.vat,
            phone: partner.phone,
            fax: partner.fax,
            website: partner.www,
            isCharity: partner.is_charity,
            logo: partner.logo,
            logoCropData: partner.logo_crop_data,
            headquarter: {
              country: partner.country,
              city: partner.city,
              zipCode: partner.zipcode,
              address: partner.address,
            },
            status: statusKeys[partner.status as 1 | 2 | 3],
            paymentDetails: {
              accountNumber: partner.payment_account_number,
              accountName: partner.payment_recipient,
              notifyEmail: true,
              currency: partner.settling_currency,
            },
            settlingDetails: {
              amountThreshold: partner.settling_amount,
              transactionFee: partner.settling_transaction_fee,
              transactionFeeValue: partner.settling_transaction_fee_value,
              periodType:
                durationTypeKeys[partner.settling_period_type as 1 | 2 | 3],
              settlingType: partner.settling_type,
              startProportion: partner.settling_proportion_start,
              finishProportion: partner.settling_proportion_finish,
              pifProportion: partner.settling_proportion_pif,
              fixedFee: partner.settling_fixed_fee,
            },
            rolesAndPermissions: defaultUserTypesRolesAndPermissions[2].roles,
          },
        },
        upsert: true,
      },
    }))
  );

  consoleLog(
    'mongoWriteOps: ' + JSON.stringify(mongoWriteOps, null, 2),
    'info'
  );
};
