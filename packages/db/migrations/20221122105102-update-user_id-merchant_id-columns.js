"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `CREATE OR REPLACE VIEW vw_transfers AS SELECT t.id,
      t.realm_id,
      coalesce(t.user_id, o.merchant) as user_id,
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
      coalesce(t.data ->> 'currency'::text, ((t.data -> 'plan'::text) -> 'from'::text) ->> 'currency'::text, t.data ->> 'currencyId'::text) AS currency,
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
      t.status,
      t.invisibility_exp_date
     FROM realms r,
      transfers t
       LEFT JOIN orders o ON o.id::text = t.ref_id
       LEFT JOIN users u on u.id = coalesce(t.user_id, o.merchant)
       LEFT JOIN merchants m ON m.id::text = coalesce((t.data ->> 'merchant'::text), o.organisation::text)
    WHERE t.realm_id = r.id;`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `CREATE OR REPLACE VIEW vw_transfers AS SELECT t.id,
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
      CASE
        WHEN t.data ->> 'currency'::text IS NOT NULL THEN t.data ->> 'currency'::text
        WHEN ((t.data -> 'plan'::text) -> 'from'::text) ->> 'currency'::text IS NOT NULL THEN ((t.data -> 'plan'::text) -> 'from'::text) ->> 'currency'::text
        WHEN t.data ->> 'currencyId'::text IS NOT NULL THEN t.data ->> 'currencyId'::text
      END AS currency,
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
      t.status,
      t.invisibility_exp_date
     FROM realms r,
      transfers t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN merchants m ON m.id::text = (t.data ->> 'merchant'::text)
    WHERE t.realm_id = r.id;`
    );
  }
};
