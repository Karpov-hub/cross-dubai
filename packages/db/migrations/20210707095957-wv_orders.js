"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query("DROP VIEW if exists vw_orders", {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_orders AS select
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
           from users u, merchants m, orders o left join contracts c on o.contract_id=c.id where o.merchant = u.id and o.organisation=m.id`,
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
        queryInterface.sequelize.query(`DROP VIEW if exists vw_orders`, {
          transaction: t
        })
      ]);
    });
  }
};
