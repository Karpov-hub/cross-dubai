"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(`drop view vw_merchants`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `ALTER TABLE merchants 
          DROP COLUMN categories CASCADE;`,
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "merchants",
          "categories",
          {
            type: Sequelize.JSONB
          },
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `create view vw_merchants as SELECT m.id,
          m.acc1,
          m.acc2,
          m.name,
          m.website,
          m.description,
          m.categories,
          m.user_id,
          m.ctime,
          m.mtime,
          m.maker,
          m.signobject,
          m.removed,
          m.token,
          m.active,
          m.callback_url,
          m.callback_error,
          m.secret,
          a.acc_no,
          a.crypto
         FROM merchants m
           LEFT JOIN merchant_accounts ma ON m.id = ma.id_merchant
           LEFT JOIN ( SELECT accounts.id,
                  accounts.acc_no,
                  currency.crypto
                 FROM accounts,
                  currency
                WHERE accounts.currency::text = currency.abbr::text) a ON a.id = ma.id_account`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
