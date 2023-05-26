"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "orders",
          "amount2",
          {
            type: Sequelize.FLOAT
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "orders",
          "currency2",
          {
            type: Sequelize.STRING(10)
          },
          { transaction: t }
        ),
        queryInterface.sequelize.query(`DROP VIEW vw_orders`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_orders AS SELECT o.id,
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
          o.manual_processing,
          o.order_date,
          o.merchant_website,
          o.merchant_owebsites,
          o.amount2,
          o.currency2,
          case when cw.num is null then i.bank_details else cw.num end external_wallet,
          case when cw.id is null then i.id else cw.id end external_wallet_id
         FROM users u,
          merchants m,
          realmdepartments rd,
          orders o
           LEFT JOIN contracts c ON o.contract_id = c.id
           LEFT JOIN crypto_wallets cw ON cw.id = o.receiver_account
           left join ibans i on i.id = o.receiver_account 
        WHERE o.merchant = u.id AND o.organisation = m.id AND o.realm_department = rd.id;
        `,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("orders", "amount2", {
          transaction: t
        }),
        queryInterface.removeColumn("orders", "currency2", {
          transaction: t
        }),
        queryInterface.sequelize.query(`DROP VIEW vw_orders`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_orders AS SELECT o.id,
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
          o.manual_processing,
          o.order_date,
          o.merchant_website,
          o.merchant_owebsites,
          case when cw.num is null then i.bank_details else cw.num end external_wallet,
          case when cw.id is null then i.id else cw.id end external_wallet_id
         FROM users u,
          merchants m,
          realmdepartments rd,
          orders o
           LEFT JOIN contracts c ON o.contract_id = c.id
           LEFT JOIN crypto_wallets cw ON cw.id = o.receiver_account
           left join ibans i on i.id = o.receiver_account 
        WHERE o.merchant = u.id AND o.organisation = m.id AND o.realm_department = rd.id;
        `,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
