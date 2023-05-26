"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("settings", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(255)
      },
      key: {
        type: Sequelize.STRING(50)
      },
      value: {
        type: Sequelize.STRING(255)
      },
      maker: {
        type: Sequelize.UUID
      },
      ctime: {
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      },
      signobject: {
        type: Sequelize.JSON
      },
      removed: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("settings");
  }
};
