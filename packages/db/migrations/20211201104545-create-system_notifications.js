"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("system_notifications", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      message: Sequelize.STRING,
      msg_date: Sequelize.DATE,
      time_from: Sequelize.STRING(20),
      time_to: Sequelize.STRING(20),
      active: Sequelize.BOOLEAN,

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      removed: Sequelize.INTEGER,
      signobject: Sequelize.JSON
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("system_notifications");
  }
};
