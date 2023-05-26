"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("admin_logs", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      data: Sequelize.JSON,
      result: Sequelize.JSON,
      date: Sequelize.DATE
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("admin_logs");
  }
};
