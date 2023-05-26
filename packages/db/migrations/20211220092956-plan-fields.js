"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          "transfers_plans",
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID
            },
            plan_id: {
              type: Sequelize.UUID
            },
            step: {
              type: Sequelize.INTEGER
            },
            ctime: Sequelize.DATE,
            mtime: Sequelize.DATE
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "transfers",
          "plan_transfer_id",
          {
            type: Sequelize.UUID
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
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("transfers", "plan_transfer_id", {
          transaction: t
        }),
        queryInterface.dropTable("transfers_plan", { transaction: t })
      ]);
    });
  }
};
