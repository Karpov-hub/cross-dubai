"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_orders`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_orders AS SELECT o.id,
          u.legalname AS merchant_name,
          m.name AS organisation_name,
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
          case when cw.num is null then i.bank_details else cw.num end external_wallet,
          case when cw.id is null then i.id else cw.id end external_wallet_id
         FROM users u,
          merchants m,
          orders o
           LEFT JOIN contracts c ON o.contract_id = c.id
           LEFT JOIN crypto_wallets cw ON cw.id = o.receiver_account
           left join ibans i on i.id = o.receiver_account 
        WHERE o.merchant = u.id AND o.organisation = m.id;
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
        queryInterface.sequelize.query(`DROP VIEW vw_orders`, {
          transaction: t
        }),
        queryInterface.sequelize.query(`CREATE VIEW vw_orders AS select
        o.id,
        u.legalname as merchant_name,
        m.name as organisation_name,
        c.name as contract,
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
        o.manual_processing
         from users u, merchants m, orders o left join contracts c on o.contract_id=c.id where o.merchant = u.id and o.organisation=m.id`, {
          transaction: t
         })
      ]);
    });
  }
};
