"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `CREATE SEQUENCE deposit_invoice_usd MINVALUE 0 START 1;`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `select setval('deposit_invoice_usd', (select count(t.data->>'invoice') from transfers t where t.event_name ~* 'deposit' and t.data->>'currency' = 'USD' and t.data->>'invoice' is not null and t.data->>'invoice' != ''));
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
        queryInterface.sequelize.query(`DROP SEQUENCE deposit_invoice_usd`, {
          transaction: t
        })
      ]);
    });
  }
};
