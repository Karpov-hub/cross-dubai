"use strict";

async function dropViews(queryInterface, t) {
  await queryInterface.sequelize.query(`drop view vw_withdraval_accounts`, {
    transaction: t
  });
  await queryInterface.sequelize.query(`drop view vw_trancactions`, {
    transaction: t
  });
  await queryInterface.sequelize.query(`drop view vw_transfers`, {
    transaction: t
  });
  await queryInterface.sequelize.query(`drop view vw_realmaccounts`, {
    transaction: t
  });
  await queryInterface.sequelize.query(`drop view vw_accounts`, {
    transaction: t
  });
  await queryInterface.sequelize.query(`drop view vw_transfer_transactions`, {
    transaction: t
  });
  await queryInterface.sequelize.query(`drop view vw_org_accounts`, {
    transaction: t
  });
}

async function restoreViews(queryInterface, t) {
  await queryInterface.sequelize.query(
    `create view vw_accounts as
SELECT a.id,
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
    { transaction: t }
  );

  await queryInterface.sequelize.query(
    `create view vw_realmaccounts as
SELECT a.id,
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
    r.id AS ra_id,
    r.type,
    r.details,
    r.country,
    r.callback
   FROM realmaccounts r,
    accounts a
  WHERE r.account_id = a.id`,
    { transaction: t }
  );

  await queryInterface.sequelize.query(
    `create view vw_transfers as
SELECT t.id,
    t.realm_id,
    t.user_id,
    t.event_name,
    t.held,
    t.description,
    t.notes,
    t.data,
    t.amount,
    t.ctime,
    t.mtime,
    t.maker,
    t.signobject,
    t.removed,
    t.canceled,
    t.ref_id,
    t.status,
    t.order_id,
    r.name AS realmname,
    concat(u.last_name, ' ', u.first_name) AS username,
    u.legalname,
    u.type AS user_type
   FROM realms r,
    transfers t
     LEFT JOIN users u ON t.user_id = u.id
  WHERE t.realm_id = r.id`,
    { transaction: t }
  );

  await queryInterface.sequelize.query(
    `create view vw_trancactions as
SELECT t.id,
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
  WHERE t.realm_id = r.id`,
    { transaction: t }
  );

  await queryInterface.sequelize.query(
    `create view vw_transfer_transactions as 
SELECT t.id,
    t.ref_id,
    t.event_name,
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
  GROUP BY t.id, t.ref_id, t.held, t.canceled, t.ctime, t.mtime`,
    { transaction: t }
  );

  await queryInterface.sequelize.query(
    `create view vw_withdraval_accounts as 
    SELECT m.id AS merchant,
    a.acc_name,
    a.acc_no,
    a.currency
   FROM users m,
    vw_realmaccounts a
  WHERE m.realm = a.owner AND a.type = 2`,
    { transaction: t }
  );

  await queryInterface.sequelize.query(
    `create view vw_org_accounts as 
    SELECT m.id_merchant AS org,
    a.acc_no,
    a.currency,
    a.balance
   FROM accounts a,
    merchant_accounts m
  WHERE m.id_account = a.id`,
    { transaction: t }
  );
}

async function alterType(queryInterface, t, type) {
  await queryInterface.sequelize.query(
    `alter table transactions alter column amount type ${type}`,
    { transaction: t }
  );
  await queryInterface.sequelize.query(
    `alter table transactions alter column exchange_amount type ${type}`,
    { transaction: t }
  );
  await queryInterface.sequelize.query(
    `alter table transfers alter column amount type ${type}`,
    { transaction: t }
  );
  await queryInterface.sequelize.query(
    `alter table orders alter column amount type ${type}`,
    { transaction: t }
  );
  await queryInterface.sequelize.query(
    `alter table accounts alter column balance type ${type}`,
    { transaction: t }
  );
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await dropViews(queryInterface, t);
      await alterType(queryInterface, t, "numeric(40,18)");
      await restoreViews(queryInterface, t);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await dropViews(queryInterface, t);
      await alterType(queryInterface, t, "double");
      await restoreViews(queryInterface, t);
    });
  }
};
