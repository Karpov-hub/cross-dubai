"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW if exists vw_merchants`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE OR REPLACE VIEW vw_merchants AS SELECT m.id,
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
          array_agg(DISTINCT ac.bank) AS bank,
          array_agg(distinct ac.account_number) as contract_acc_no,
          u.legalname
         FROM merchants m
           LEFT JOIN merchant_accounts ma ON m.id = ma.id_merchant
           LEFT JOIN ( SELECT accounts.id,
            accounts.acc_no,
            accounts.currency,
            currency.crypto
           FROM accounts,
            currency
          WHERE accounts.currency::text = currency.abbr::text and removed is not null and removed <> 1) a ON a.id = ma.id_account
           LEFT JOIN orgs_contracts oc ON oc.owner_id = m.id
           LEFT JOIN account_contracts ac ON ac.owner_id = oc.contract_id and ac.removed <> 1 
           LEFT JOIN users u ON u.id = m.user_id
       GROUP BY m.id, m.acc1, m.acc2, m.name, m.website, m.description, m.categories, m.user_id, m.ctime, m.mtime, m.token, m.active, m.callback_url, m.callback_error, m.secret, u.legalname;`,
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
        queryInterface.sequelize.query(`DROP VIEW if exists vw_merchants`, {
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
          array_agg(DISTINCT ac.bank) AS bank,
          array_agg(distinct ac.account_number) as contract_acc_no,
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
           LEFT JOIN orgs_contracts oc ON oc.owner_id = m.id
           LEFT JOIN account_contracts ac ON ac.owner_id = oc.contract_id 
           LEFT JOIN users u ON u.id = m.user_id
           where ac.removed = 0
       GROUP BY m.id, m.acc1, m.acc2, m.name, m.website, m.description, m.categories, m.user_id, m.ctime, m.mtime, m.token, m.active, m.callback_url, m.callback_error, m.secret, u.legalname;
        `,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
