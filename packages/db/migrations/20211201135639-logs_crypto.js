"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("logs_crypto", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      url: Sequelize.STRING(100),
      action: Sequelize.STRING(50),
      data: Sequelize.TEXT,
      response: Sequelize.TEXT,
      ctime: Sequelize.DATE
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("logs_crypto");
  }
};
