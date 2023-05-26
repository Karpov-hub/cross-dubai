"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `CREATE OR REPLACE VIEW vw_inner_clients_merchants AS
      SELECT m.id, m.name, u.id AS user_id FROM merchants m, users u
      WHERE u.inner_client = true and m.user_id = u.id;`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      "DROP VIEW vw_inner_clients_merchants"
    );
  }
};
