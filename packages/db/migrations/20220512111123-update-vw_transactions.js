"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_trancactions`, {
          transaction: t
        }),
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
          u.type AS user_type,
          acc_src.acc_name as src_acc_name,
          acc_dst.acc_name as dst_acc_name,
          tr."data"->>'organisation_name' as merchant_name
         FROM realms r,
         transfers tr, 
          transactions t
           LEFT JOIN users u ON t.user_id = u.id
           LEFT JOIN accounts acc_src ON acc_src.acc_no = t.acc_src
           LEFT JOIN accounts acc_dst ON acc_dst.acc_no = t.acc_dst
        WHERE t.realm_id = r.id and t.transfer_id = tr.id;
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
        queryInterface.sequelize.query(`DROP VIEW vw_trancactions`, {
          transaction: t
        }),
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
        WHERE t.realm_id = r.id;
        `,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
