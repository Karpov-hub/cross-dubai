'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_orders`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `
      CREATE OR REPLACE VIEW vw_orders
      AS SELECT o.id,
          u.legalname AS merchant_name,
          m.name AS organisation_name,
          rd.name AS realmdepartment_name,
          c.name AS contract,
          o.merchant,
          o.organisation,
          o.contract_id,
          o.amount,
          o.currency,
          o.realm_department,
          o.res_currency,
          o.details,
          o.status,
          o.ctime,
          o.bank_details,
          o.order_num,
          o.date_from,
          o.date_to,
          o.order_date,
          o.merchant_website,
          o.merchant_owebsites,
          o.amount2,
          o.currency2,
              CASE
                  WHEN cw.num IS NULL THEN i.bank_details::character varying
                  ELSE cw.num
              END AS external_wallet,
              CASE
                  WHEN cw.id IS NULL THEN i.id
                  ELSE cw.id
              END AS external_wallet_id
         FROM users u,
          merchants m,
          realmdepartments rd,
          orders o
           LEFT JOIN contracts c ON o.contract_id = c.id
           LEFT JOIN crypto_wallets cw ON cw.id = o.receiver_account
           LEFT JOIN ibans i ON i.id = o.receiver_account
        WHERE o.merchant = u.id AND o.organisation = m.id AND o.realm_department = rd.id;`,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `
      CREATE OR REPLACE VIEW vw_orders
      AS SELECT o.id,
          u.legalname AS merchant_name,
          m.name AS organisation_name,
          rd.name AS realmdepartment_name,
          c.name AS contract,
          o.merchant,
          o.organisation,
          o.contract_id,
          o.amount,
          o.currency,
          o.realm_department,
          o.res_currency,
          o.details,
          o.status,
          o.ctime,
          o.bank_details,
          o.order_num,
          o.date_from,
          o.date_to,
          o.order_date,
          o.merchant_website,
          o.merchant_owebsites,
          o.amount2,
          o.currency2,
              CASE
                  WHEN cw.num IS NULL THEN i.bank_details::character varying
                  ELSE cw.num
              END AS external_wallet,
              CASE
                  WHEN cw.id IS NULL THEN i.id
                  ELSE cw.id
              END AS external_wallet_id,
          o.additional_data
         FROM users u,
          merchants m,
          realmdepartments rd,
          orders o
           LEFT JOIN contracts c ON o.contract_id = c.id
           LEFT JOIN crypto_wallets cw ON cw.id = o.receiver_account
           LEFT JOIN ibans i ON i.id = o.receiver_account
        WHERE o.merchant = u.id AND o.organisation = m.id AND o.realm_department = rd.id;`
    );
  }
};
