"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "transfers",
          "show_to_client",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          { transaction: t }
        ),
        queryInterface.sequelize.query(`DROP VIEW vw_transfers`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_transfers AS SELECT t.id,
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
        t.order_id,
        t.plan_transfer_id,
        t.show_to_client,
        r.name AS realmname,
        concat(u.last_name, ' ', u.first_name) AS username,
        u.legalname,
        u.type AS user_type,
        m.name AS organisation_name,
        t.data ->> 'currency'::text AS currency,
        t.data ->> 'merchant'::text AS merchant_id,
            CASE
                WHEN t.canceled IS TRUE THEN 'CANCELED'::text
                WHEN t.event_name::text = 'account-service:withdrawalCustomExchangeRate'::text THEN
                CASE t.status
                    WHEN 1 THEN 'EXCHANGED'::text
                    WHEN 2 THEN 'ON MASTER'::text
                    WHEN 3 THEN 'ON MONITORING'::text
                    WHEN 4 THEN 'TRANSFERED'::text
                    ELSE NULL::text
                END
                WHEN t.held IS NOT TRUE AND t.canceled IS NOT TRUE THEN 'TRANSFERED'::text
                WHEN t.held IS TRUE AND t.canceled IS NOT TRUE THEN 'PENDING'::text
                ELSE NULL::text
            END AS string_status,
        t.status
       FROM realms r,
        transfers t
         LEFT JOIN users u ON t.user_id = u.id
         LEFT JOIN merchants m ON m.id::text = (t.data ->> 'merchant'::text)
      WHERE t.realm_id = r.id`,
          { transaction: t }
        ),
        queryInterface.sequelize.query(`DROP VIEW vw_all_transfers`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `create view vw_all_transfers as select p.id, x.acc_src, x.acc_dst, p.ctime, p.step, 'p' as type from transfers_plans p, transfers t, transactions x where t.plan_transfer_id=p.id and t.id=x.transfer_id group by p.id, x.acc_src, x.acc_dst, p.ctime, p.step union select t.id, x.acc_src, x.acc_dst, t.ctime, 0 as step, 't' as type from transfers t, transactions x where plan_transfer_id is null and t.id=x.transfer_id and t.show_to_client=true group by t.id, x.acc_src, x.acc_dst, t.ctime`,
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
        queryInterface.sequelize.query(`DROP VIEW vw_transfers`, {
          transaction: t
        }),
        queryInterface.removeColumn("transfers", "show_to_client", {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_transfers AS SELECT t.id,
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
        t.order_id,
        t.plan_transfer_id,
        r.name AS realmname,
        concat(u.last_name, ' ', u.first_name) AS username,
        u.legalname,
        u.type AS user_type,
        m.name AS organisation_name,
        t.data ->> 'currency'::text AS currency,
        t.data ->> 'merchant'::text AS merchant_id,
            CASE
                WHEN t.canceled IS TRUE THEN 'CANCELED'::text
                WHEN t.event_name::text = 'account-service:withdrawalCustomExchangeRate'::text THEN
                CASE t.status
                    WHEN 1 THEN 'EXCHANGED'::text
                    WHEN 2 THEN 'ON MASTER'::text
                    WHEN 3 THEN 'ON MONITORING'::text
                    WHEN 4 THEN 'TRANSFERED'::text
                    ELSE NULL::text
                END
                WHEN t.held IS NOT TRUE AND t.canceled IS NOT TRUE THEN 'TRANSFERED'::text
                WHEN t.held IS TRUE AND t.canceled IS NOT TRUE THEN 'PENDING'::text
                ELSE NULL::text
            END AS string_status,
        t.status
       FROM realms r,
        transfers t
         LEFT JOIN users u ON t.user_id = u.id
         LEFT JOIN merchants m ON m.id::text = (t.data ->> 'merchant'::text)
      WHERE t.realm_id = r.id`,
          { transaction: t }
        ),
        queryInterface.sequelize.query(`DROP VIEW vw_all_transfers`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `create view vw_all_transfers as select p.id, x.acc_src, x.acc_dst, p.ctime, p.step, 'p' as type from transfers_plans p, transfers t, transactions x where t.plan_transfer_id=p.id and t.id=x.transfer_id group by p.id, x.acc_src, x.acc_dst, p.ctime, p.step union select t.id, x.acc_src, x.acc_dst, t.ctime, 0 as step, 't' as type from transfers t, transactions x where plan_transfer_id is null and t.id=x.transfer_id group by t.id, x.acc_src, x.acc_dst, t.ctime`,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
