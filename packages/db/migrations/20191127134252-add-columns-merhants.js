"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "merchants",
          "callback_url",
          {
            type: Sequelize.STRING
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "merchants",
          "secret",
          {
            type: Sequelize.STRING
          },
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(`drop view vw_merchants`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `create view vw_merchants as select m.*, a.acc_no, a.currency, a.balance, c.crypto from merchants m, accounts a, currency c where (a.id = m.acc1 or a.id = m.acc2) and a.currency = c.abbr`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          `alter table currency_history alter column realms type json`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(`drop view vw_currency_values`, {
          transaction: t
        })
      ]);
    });
  }
};