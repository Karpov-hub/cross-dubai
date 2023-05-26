"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
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
          t.status,
          r.name AS realmname,
          concat(u.last_name, ' ', u.first_name) AS username,
          u.legalname,
          u.type AS user_type
         FROM realms r,
          transfers t
           LEFT JOIN users u ON t.user_id = u.id
        WHERE t.realm_id = r.id`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
