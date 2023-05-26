"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query("DROP VIEW if exists vw_merchants", {
          transaction: t
        }),
        queryInterface.sequelize.query("DROP VIEW if exists vw_orders", {
          transaction: t
        }),
        queryInterface.changeColumn(
          "merchants",
          "name",
          {
            type: Sequelize.STRING
          },
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_orders AS  SELECT o.id,
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
        o.manual_processing
       FROM users u,
        merchants m,
        orders o
         LEFT JOIN contracts c ON o.contract_id = c.id
      WHERE o.merchant = u.id AND o.organisation = m.id;`,
          {
            transaction: t
          }
        ),
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
      GROUP BY m.id, m.acc1, m.acc2, m.name, m.website, m.description, m.categories, m.user_id, m.ctime, m.mtime, m.token, m.active, m.callback_url, m.callback_error, m.secret`,
          {
            transaction: t
          }
        )
      ]);
    });
    return;
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query("DROP VIEW if exists vw_merchants", {
          transaction: t
        }),
        queryInterface.sequelize.query("DROP VIEW if exists vw_orders", {
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
        GROUP BY m.id, m.acc1, m.acc2, m.name, m.website, m.description, m.categories, m.user_id, m.ctime, m.mtime, m.token, m.active, m.callback_url, m.callback_error, m.secret`,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
