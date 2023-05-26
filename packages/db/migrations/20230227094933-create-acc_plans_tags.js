"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("acc_plans_tags", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      removed: Sequelize.INTEGER,
      maker: Sequelize.UUID,
      signobject: Sequelize.JSON
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("acc_plans_tags");
  }
};
