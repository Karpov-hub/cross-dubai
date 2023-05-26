"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("tarifs", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: Sequelize.STRING,
      description: Sequelize.TEXT,
      trigger: Sequelize.UUID,
      data: Sequelize.JSON,
      variables: Sequelize.JSON,
      actions: Sequelize.JSON,
      rules: Sequelize.JSON,
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
    return queryInterface.dropTable("tarifs");
  }
};
