"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("telegram_apps", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      phone: {
        type: Sequelize.STRING(20),
        unique: true,
        allowNull: false
      },
      app_id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false
      },
      api_hash: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
      },
      session: {
        type: Sequelize.TEXT
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      removed: {
        type: Sequelize.INTEGER
      },
      signobject: {
        type: Sequelize.JSON
      },
      maker: {
        type: Sequelize.UUID
      },
      ctime: {
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("telegram_apps");
  }
};
