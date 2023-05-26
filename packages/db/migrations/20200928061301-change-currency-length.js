"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_currency_values`, {
          transaction: t
        }),
        queryInterface.sequelize.query(`DROP VIEW vw_merchants`, {
          transaction: t
        }),
        queryInterface.changeColumn(
          "currency",
          "abbr",
          {
            type: Sequelize.STRING(4)
          },
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_currency_values
          AS SELECT v.abbr,
              h.realm,
              v.amount,
              v.value,
              c.crypto
              FROM ( SELECT currency_history.id,
                      jsonb_array_elements_text(currency_history.realms -> '_arr'::text) AS realm
                      FROM currency_history
                    WHERE currency_history.active = true) h,
              currency_values v,
              currency c
            WHERE c.abbr::text = v.abbr::text AND h.id = v.pid;`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_merchants AS
          SELECT m.id,
              m.acc1,
              m.acc2,
              m.name,
              m.website,
              m.description,
              m.categories,
              m.user_id,
              m.ctime,
              m.mtime,
              m.token,
              m.active,
              m.callback_url,
              m.callback_error,
              m.secret,
              array_agg(a.acc_no) AS acc_no,
              array_agg(a.currency) AS acc_currency,
              array_agg(a.crypto) AS crypto
              
             FROM merchants m
               LEFT JOIN merchant_accounts ma ON m.id = ma.id_merchant
               LEFT JOIN ( SELECT accounts.id,
                      accounts.acc_no,
                      accounts.currency,
                      currency.crypto
                     FROM accounts,
                      currency
                    WHERE accounts.currency::text = currency.abbr::text) a ON a.id = ma.id_account
              GROUP BY m.id,
              m.acc1,
              m.acc2,
              m.name,
              m.website,
              m.description,
              m.categories,
              m.user_id,
              m.ctime,
              m.mtime,
              m.token,
              m.active,
              m.callback_url,
              m.callback_error,
              m.secret`,
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
        queryInterface.sequelize.query(`DROP VIEW vw_currency_values`, {
          transaction: t
        }),
        queryInterface.sequelize.query(`DROP VIEW vw_merchants`, {
          transaction: t
        }),
        queryInterface.changeColumn(
          "currency",
          "abbr",
          {
            type: Sequelize.STRING(4)
          },
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_currency_values
          AS SELECT v.abbr,
              h.realm,
              v.amount,
              v.value,
              c.crypto
              FROM ( SELECT currency_history.id,
                      jsonb_array_elements_text(currency_history.realms -> '_arr'::text) AS realm
                      FROM currency_history
                    WHERE currency_history.active = true) h,
              currency_values v,
              currency c
            WHERE c.abbr::text = v.abbr::text AND h.id = v.pid;`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_merchants AS
          SELECT m.id,
              m.acc1,
              m.acc2,
              m.name,
              m.website,
              m.description,
              m.categories,
              m.user_id,
              m.ctime,
              m.mtime,
              m.token,
              m.active,
              m.callback_url,
              m.callback_error,
              m.secret,
              array_agg(a.acc_no) AS acc_no,
              array_agg(a.currency) AS acc_currency,
              array_agg(a.crypto) AS crypto
              
             FROM merchants m
               LEFT JOIN merchant_accounts ma ON m.id = ma.id_merchant
               LEFT JOIN ( SELECT accounts.id,
                      accounts.acc_no,
                      accounts.currency,
                      currency.crypto
                     FROM accounts,
                      currency
                    WHERE accounts.currency::text = currency.abbr::text) a ON a.id = ma.id_account
              GROUP BY m.id,
              m.acc1,
              m.acc2,
              m.name,
              m.website,
              m.description,
              m.categories,
              m.user_id,
              m.ctime,
              m.mtime,
              m.token,
              m.active,
              m.callback_url,
              m.callback_error,
              m.secret`,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
