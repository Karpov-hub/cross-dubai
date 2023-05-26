"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("nil_logs", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      request: Sequelize.TEXT,
      response: Sequelize.TEXT,
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      removed: Sequelize.INTEGER
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("nil_logs");
  }
};
