"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("client_roles", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING(40)
      },
      permissions: {
        type: Sequelize.JSONB
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      ctime: {
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      },
      maker: {
        type: Sequelize.UUID
      },
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      signobject: {
        type: Sequelize.JSON
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("client_roles");
  }
};
