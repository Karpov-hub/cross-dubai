"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("admin_logs", "admin_id", {
      type: Sequelize.UUID,
      allowNull: true
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("admin_logs", "admin_id");
  }
};
