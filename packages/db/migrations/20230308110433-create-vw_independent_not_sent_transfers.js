"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `CREATE OR REPLACE VIEW vw_independent_not_sent_transfers AS
      SELECT * FROM not_sent_plan_transfers nspt WHERE nspt.ref_id = '2';`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      "DROP VIEW vw_independent_not_sent_transfers"
    );
  }
};
