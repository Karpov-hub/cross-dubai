"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("account_contracts", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      account_number: {
        type: Sequelize.STRING,
      },
      bank: {
        type: Sequelize.STRING,
      },
      swift: {
        type: Sequelize.STRING,
      },
      correspondent_currency: Sequelize.STRING,
      correspondent_account: Sequelize.STRING,
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
    return queryInterface.dropTable("account_contracts");
  },
};
