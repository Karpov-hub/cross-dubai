"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW if exists vw_merchants`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE OR REPLACE VIEW vw_merchants AS 
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
          array_agg(a.crypto) AS crypto,
          array_agg(DISTINCT ac.bank) AS bank,
          array_agg(DISTINCT ac.account_number) AS contract_acc_no,
          u.legalname,
          last_deposit.ctime AS last_deposit,
          balance.busd,
          balance.beur
        FROM merchants m
          LEFT JOIN merchant_accounts ma ON m.id = ma.id_merchant
          LEFT JOIN ( SELECT accounts.id,
                 accounts.acc_no,
                 accounts.currency,
                 currency.crypto
                FROM accounts,
                 currency
               WHERE accounts.currency::text = currency.abbr::text AND accounts.removed IS NOT NULL AND accounts.removed <> 1) a ON a.id = ma.id_account
          LEFT JOIN orgs_contracts oc ON oc.owner_id = m.id
          LEFT JOIN account_contracts ac ON ac.owner_id = oc.contract_id AND ac.removed <> 1
          LEFT JOIN users u ON u.id = m.user_id
          LEFT JOIN ( SELECT transfers.data->>'merchant' as merchant_id,
                 max(transfers.ctime) AS ctime
                FROM transfers 
               WHERE transfers.event_name::text = 'account-service:deposit'::text
               GROUP BY transfers.data->>'merchant') last_deposit ON last_deposit.merchant_id = m.id::text
          left join (select 
                      sum((select sum(a.balance) from accounts a where a.id=m.id_account and a.currency='USD')) as busd,
                      sum((select sum(a.balance) from accounts a where a.id=m.id_account and a.currency='EUR')) as beur,
                      m.id_merchant 
                    from merchant_accounts m 
                    group by m.id_merchant) as balance on balance.id_merchant = m.id
          GROUP BY balance.busd, balance.beur,last_deposit.ctime, m.id, m.acc1, m.acc2, m.name, m.website, m.description, m.categories, m.user_id, m.ctime, m.mtime, m.token, m.active, m.callback_url, m.callback_error, m.secret, u.legalname;`,
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
          `CREATE OR REPLACE VIEW vw_merchants AS
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
          array_agg(a.crypto) AS crypto,
          array_agg(DISTINCT ac.bank) AS bank,
          array_agg(DISTINCT ac.account_number) AS contract_acc_no,
          u.legalname,
          vwt.ctime AS last_deposit,
          balance.busd,
          balance.beur
        FROM merchants m
          LEFT JOIN merchant_accounts ma ON m.id = ma.id_merchant
          LEFT JOIN ( SELECT accounts.id,
                 accounts.acc_no,
                 accounts.currency,
                 currency.crypto
                FROM accounts,
                 currency
               WHERE accounts.currency::text = currency.abbr::text AND accounts.removed IS NOT NULL AND accounts.removed <> 1) a ON a.id = ma.id_account
          LEFT JOIN orgs_contracts oc ON oc.owner_id = m.id
          LEFT JOIN account_contracts ac ON ac.owner_id = oc.contract_id AND ac.removed <> 1
          LEFT JOIN users u ON u.id = m.user_id
          LEFT JOIN ( SELECT vw_transfers.merchant_id,
                 max(vw_transfers.ctime) AS ctime
                FROM vw_transfers
               WHERE vw_transfers.event_name::text = 'account-service:deposit'::text
               GROUP BY vw_transfers.merchant_id) vwt ON vwt.merchant_id = m.id::text
          left join (select 
                      sum((select sum(a.balance) from accounts a where a.id=m.id_account and a.currency='USD')) as busd,
                      sum((select sum(a.balance) from accounts a where a.id=m.id_account and a.currency='EUR')) as beur,
                      m.id_merchant 
                    from merchant_accounts m 
                    group by m.id_merchant) as balance on balance.id_merchant = m.id
          GROUP BY balance.busd, balance.beur,vwt.ctime, m.id, m.acc1, m.acc2, m.name, m.website, m.description, m.categories, m.user_id, m.ctime, m.mtime, m.token, m.active, m.callback_url, m.callback_error, m.secret, u.legalname;`,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
