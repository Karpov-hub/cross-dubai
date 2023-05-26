"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_merchants`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_merchants AS SELECT m.id,
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
          array_agg(a.crypto) AS crypto,
          array_agg(distinct i.bank_details) as iban,
          u.legalname
         FROM merchants m
           LEFT JOIN merchant_accounts ma ON m.id = ma.id_merchant
           LEFT JOIN ( SELECT accounts.id,
                  accounts.acc_no,
                  accounts.currency,
                  currency.crypto
                 FROM accounts,
                  currency
                WHERE accounts.currency::text = currency.abbr::text) a ON a.id = ma.id_account
           left join org_ibans oi on oi.org_id = m.id 
           left join ibans i on i.id = oi.iban_id
           left join users u on u.id = m.user_id
             GROUP BY m.id, m.acc1, m.acc2, m.name, m.website, m.description, m.categories, m.user_id, m.ctime, m.mtime, m.token, m.active, m.callback_url, m.callback_error, m.secret, u.legalname;
        
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
        queryInterface.sequelize.query(`DROP VIEW vw_merchants`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE OR REPLACE VIEW vw_merchants
          AS SELECT m.id,
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
            GROUP BY m.id, m.acc1, m.acc2, m.name, m.website, m.description, m.categories, m.user_id, m.ctime, m.mtime, m.token, m.active, m.callback_url, m.callback_error, m.secret;
        `,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
