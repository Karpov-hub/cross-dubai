"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("files", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      type: {
        type: Sequelize.STRING,
      },
      file: {
        type: Sequelize.JSON,
      },
      name: {
        type: Sequelize.STRING(100),
      },
      code: {
        type: Sequelize.UUID,
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      removed: Sequelize.INTEGER,
      signobject: Sequelize.JSON,
      maker: Sequelize.UUID,
      owner_id: Sequelize.UUID,
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("files");
  },
};
