"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("cryptotx", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(255)
      },
      currency_id: {
        type: Sequelize.STRING(3)
      },
      address: {
        type: Sequelize.STRING(255)
      },
      amount: {
        type: Sequelize.FLOAT
      },
      tag: {
        type: Sequelize.STRING(40)
      },
      confirmations: {
        type: Sequelize.INTEGER
      },
      tx_status: {
        type: Sequelize.STRING(20)
      },
      sign: {
        type: Sequelize.STRING
      },
      network_fee: {
        type: Sequelize.FLOAT
      },
      network_fee_currency_id: {
        type: Sequelize.FLOAT
      },
      crypto_bot: {
        type: Sequelize.STRING(100)
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      },
      provided: {
        default: false,
        type: Sequelize.BOOLEAN
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("cryptotx");
  }
};
