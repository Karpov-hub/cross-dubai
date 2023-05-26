"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("transfer_logs", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      transfer_id: {
        type: Sequelize.UUID
      },
      ctime: {
        type: Sequelize.DATE
      },
      code: {
        type: Sequelize.STRING(50)
      },
      message: {
        type: Sequelize.STRING(255)
      },
      data: {
        type: Sequelize.TEXT
      },
      request: {
        type: Sequelize.TEXT
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("transfer_logs");
  }
};
