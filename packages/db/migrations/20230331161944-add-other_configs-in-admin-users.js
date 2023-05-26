"use strict";

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      "admin_users",
      "other_configs",
      Sequelize.JSONB
    );
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn("admin_users", "other_configs");
  }
};
