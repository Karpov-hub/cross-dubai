"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
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
          r.name AS realmname,
          concat(u.last_name, ' ', u.first_name) AS username,
          u.legalname,
          u.type AS user_type,
          t.data->>'organisation_name' as organisation_name,
          t.data->>'currency' as currency,
          t.data->>'merchant' as merchant_id,
          case 
          	when t.canceled is true then 'CANCELED'
          	when t.event_name ::text = 'account-service:withdrawalCustomExchangeRate' then 
          	( case t.status
          	when 1 then 'EXCHANGED'
          	when 2 then 'ON MASTER'
          	when 3 then 'ON MONITORING'
          	when 4 then 'TRANSFERED'
          	end)
          	when t.held is not true and t.canceled is not true then 'TRANSFERED'
          	when t.held is true  and t.canceled is not true then 'PENDING'
          end status 
          FROM realms r,
          transfers t
           LEFT JOIN users u ON t.user_id = u.id
          WHERE t.realm_id = r.id;`,
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
          r.name AS realmname,
          concat(u.last_name, ' ', u.first_name) AS username,
          u.legalname,
          u.type AS user_type,
          t.data->>'organisation_name' as organisation_name,
          t.data->>'currency' as currency,
          case 
          	when t.canceled is true then 'CANCELED'
          	when t.event_name ::text = 'account-service:withdrawalCustomExchangeRate' then 
          	( case t.status
          	when 1 then 'EXCHANGED'
          	when 2 then 'ON MASTER'
          	when 3 then 'ON MONITORING'
          	when 4 then 'TRANSFERED'
          	end)
          	when t.held is not true and t.canceled is not true then 'TRANSFERED'
          	when t.held is true  and t.canceled is not true then 'PENDING'
          end status 
          FROM realms r,
          transfers t
           LEFT JOIN users u ON t.user_id = u.id
          WHERE t.realm_id = r.id;`,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};