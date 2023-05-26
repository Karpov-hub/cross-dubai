"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("triggers", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: Sequelize.STRING,
      service: Sequelize.STRING,
      method: Sequelize.STRING,
      cron: Sequelize.STRING,
      data: Sequelize.JSON,
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      },

      stime: Sequelize.BIGINT,
      ltime: Sequelize.BIGINT,
      removed: Sequelize.INTEGER,

      signobject: Sequelize.JSON,
      maker: Sequelize.UUID
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("triggers");
  }
};
