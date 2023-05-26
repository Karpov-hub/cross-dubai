"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query(
      `UPDATE not_sent_plan_transfers SET is_draft=false`,
      {
        type: queryInterface.sequelize.QueryTypes.UPDATE
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("admin_users", null, {});
  }
};
