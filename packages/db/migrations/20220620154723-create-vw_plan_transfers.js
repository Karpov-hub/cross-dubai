"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `CREATE VIEW vw_plan_transfers AS 
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
            t.order_id,
            t.plan_transfer_id,
            t.show_to_client,
            r.name AS realmname,
            concat(u.last_name, ' ', u.first_name) AS username,
            u.legalname,
            u.type AS user_type,
            m.name AS organisation_name,
            t.data->'plan'->'from'->>'currency' as currency,
            t.data->'netData'->'net'->>'txId' as hash,
            t.data ->> 'merchant'::text AS merchant_id,
            t.data->'netData'->'exchange'->>'executed_price' as exchange_price,
              t.data->'netData'->'exchange'->>'quantity' as exchange_quantity,
                CASE
                    WHEN t.canceled IS TRUE THEN 'CANCELED'::text
                    WHEN t.held IS NOT TRUE AND t.canceled IS NOT TRUE THEN 'TRANSFERED'::text
                    WHEN t.held IS TRUE AND t.canceled IS NOT TRUE THEN 'PENDING'::text
                    ELSE NULL::text
                END AS string_status,
            t.status
          FROM realms r,
            transfers t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN merchants m ON m.id::text = (t.data ->> 'merchant'::text)
          WHERE t.realm_id = r.id and t.event_name='account-service:doPipe'`,
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
        queryInterface.sequelize.query(`DROP VIEW vw_plan_transfers`, {
          transaction: t
        })
      ]);
    });
  }
};
