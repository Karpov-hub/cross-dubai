"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("org_cryptowallets", {
      org_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "merchants",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      wallet_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "crypto_wallets",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      ctime: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("org_cryptowallets");
  }
};
