"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `DROP VIEW IF EXISTS vw_currency_values`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `DROP VIEW IF EXISTS vw_current_currency`,
          {
            transaction: t
          }
        ),

        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_realmaccounts`, {
          transaction: t
        }),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_accounts`, {
          transaction: t
        }),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_merchants`, {
          transaction: t
        }),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_org_accounts`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `DROP VIEW IF EXISTS vw_transfer_transactions`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_trancactions`, {
          transaction: t
        }),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_org_ibans`, {
          transaction: t
        }),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_org_wallets`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `DROP VIEW IF EXISTS vw_withdraval_accounts`,
          {
            transaction: t
          }
        ),
        queryInterface.changeColumn(
          "currency_values",
          "abbr",
          {
            type: Sequelize.STRING(4)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "accounts",
          "currency",
          {
            type: Sequelize.STRING(4)
          },
          { transaction: t }
        ),

        queryInterface.changeColumn(
          "transactions",
          "currency_src",
          {
            type: Sequelize.STRING(4)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "transactions",
          "currency_dst",
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
          `CREATE VIEW vw_current_currency AS SELECT max(currency_values.value) AS k,
          currency_values.abbr
         FROM currency_values
        WHERE (currency_values.pid IN ( SELECT currency_history.id
                 FROM currency_history
                WHERE currency_history.active = true
                ORDER BY currency_history.ctime DESC
               LIMIT 1))
        GROUP BY currency_values.abbr`,
          {
            transaction: t
          }
        ),

        queryInterface.sequelize.query(
          `CREATE VIEW vw_realmaccounts AS SELECT a.id,
          a.acc_no,
          a.currency,
          a.owner,
          a.balance,
          a.active,
          a.ctime,
          a.mtime,
          a.stime,
          a.ltime,
          a.removed,
          a.signobject,
          a.maker,
          a.negative,
          a.status,
          a.acc_name,
          r.iban_id,
          r.type,
          r.details,
          r.country,
          r.callback
         FROM realmaccounts r,
          accounts a
        WHERE r.account_id = a.id`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_accounts AS SELECT a.id,
          a.acc_no,
          a.status,
          a.owner,
          a.overdraft,
          a.balance,
          a.currency,
          u.first_name,
          u.last_name,
          u.legalname,
          u.addr1_zip AS zip,
          u.addr1_address AS address,
          u.country,
          u.realm,
          r.name AS realmname
         FROM accounts a,
          users u,
          realms r
        WHERE a.owner = u.id AND u.realm = r.id`,
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
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_org_accounts AS select m.id_merchant as org, a.acc_no, a.currency, a.balance  from accounts a, merchant_accounts m where m.id_account=a.id
         `,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_org_ibans AS select m.org_id as org, a.* from ibans a, org_ibans m where m.iban_id=a.id
         `,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_org_wallets AS select m.org_id as org, a.* from crypto_wallets a, org_cryptowallets m where m.wallet_id=a.id
         `,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_withdraval_accounts AS SELECT m.id as merchant, a.acc_name, a.acc_no, a.currency FROM users m, vw_realmaccounts a WHERE m.realm = a.owner and a.type=2
         `,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_transfer_transactions AS SELECT t.id,
          t.ref_id,
          t.held,
          t.canceled,
          t.ctime,
          t.mtime,
          t.status,
          array_agg(x.acc_src) AS acc_src,
          array_agg(x.acc_dst) AS acc_dst,
          array_agg(x.amount) AS amount,
          array_agg(x.exchange_amount) AS exchange_amount,
          array_agg(x.currency_src) AS currency_src,
          array_agg(x.currency_dst) AS currency_dst,
          array_agg(x.index) AS index,
          array_agg(x.txtype) AS txtype,
          t.data
         FROM transfers t,
          transactions x
        WHERE t.id = x.transfer_id AND x.hidden = false
        GROUP BY t.id, t.ref_id, t.held, t.canceled, t.ctime, t.mtime
         `,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_trancactions AS SELECT t.id,
          t.realm_id,
          t.user_id,
          t.transfer_id,
          t.tariff_id,
          t.plan_id,
          t.held,
          t.amount,
          t.acc_src,
          t.acc_dst,
          t.tariff,
          t.plan,
          t.ref_id,
          t.ctime,
          t.mtime,
          t.maker,
          t.signobject,
          t.removed,
          t.exchange_amount,
          t.canceled,
          t.description_src,
          t.description_dst,
          t.currency_src,
          t.currency_dst,
          r.name AS realmname,
          concat(u.last_name, ' ', u.first_name) AS username,
          u.legalname,
          u.type AS user_type
         FROM realms r,
          transactions t
           LEFT JOIN users u ON t.user_id = u.id
        WHERE t.realm_id = r.id
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
        queryInterface.sequelize.query(
          `DROP VIEW IF EXISTS vw_currency_values`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(`DROP VIEW vw_current_currency`, {
          transaction: t
        }),
        queryInterface.changeColumn(
          "currency_values",
          "abbr",
          {
            type: Sequelize.STRING(3)
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
          `CREATE VIEW vw_current_currency AS SELECT max(currency_values.value) AS k,
          currency_values.abbr
         FROM currency_values
        WHERE (currency_values.pid IN ( SELECT currency_history.id
                 FROM currency_history
                WHERE currency_history.active = true
                ORDER BY currency_history.ctime DESC
               LIMIT 1))
        GROUP BY currency_values.abbr`,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
