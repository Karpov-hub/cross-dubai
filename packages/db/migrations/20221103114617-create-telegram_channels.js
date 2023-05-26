"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("telegram_channels", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      channel_id: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      ref_id: {
        type: Sequelize.UUID,
        unique: true,
        allowNull: false
      },
      join_link: {
        type: Sequelize.STRING(40),
        allowNull: false
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
    return queryInterface.dropTable("telegram_channels");
  }
};
