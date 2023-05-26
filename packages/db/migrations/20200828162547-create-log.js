"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("logs", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      request: {
        type: Sequelize.JSON
      },
      responce: {
        type: Sequelize.JSON
      },
      realm: {
        type: Sequelize.UUID
      },
      service: {
        type: Sequelize.STRING
      },
      method: {
        type: Sequelize.STRING
      },
      ctime: {
        type: Sequelize.DATE
      },
      removed: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("logs");
  }
};
