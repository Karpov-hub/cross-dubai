"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("categories_merchants", {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      code: {
        type: Sequelize.STRING(10)
      },
      name: {
        type: Sequelize.STRING
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      signobject: Sequelize.JSON,
      maker: Sequelize.UUID
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("categories_merchants");
  }
};
