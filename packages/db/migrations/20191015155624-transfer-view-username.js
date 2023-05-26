"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_transfers`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_transfers AS select t.*, r.name as realmname, concat(u.last_name,' ',u.first_name) as username, u.legalname, u.type as user_type from realms r, transfers t left join users u on t.user_id = u.id where t.realm_id = r.id`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
