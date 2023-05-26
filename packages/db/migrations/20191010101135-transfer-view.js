"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `CREATE VIEW vw_transfers AS select t.*, r.name as realmname, u.first_name, u.last_name, u.legalname, u.type as user_type from realms r, transfers t left join users u on t.user_id = u.id where t.realm_id = r.id`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`DROP VIEW vw_transfers`);
  }
};
