"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("tmp_deposit_imports", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      reason: Sequelize.STRING,
      amount: Sequelize.FLOAT,
      deposit_to: Sequelize.STRING,
      order_id: Sequelize.STRING,
      organisation_id: Sequelize.STRING,
      order_name: Sequelize.STRING,
      currency: Sequelize.STRING,
      bank: Sequelize.STRING,
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      removed: Sequelize.INTEGER,
      signobject: Sequelize.JSON,
      maker: Sequelize.UUID
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("tmp_deposit_imports");
  }
};
