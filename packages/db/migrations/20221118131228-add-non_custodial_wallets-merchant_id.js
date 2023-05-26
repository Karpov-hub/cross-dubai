"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("non_custodial_wallets", "merchant_id", {
      type: Sequelize.UUID,
      references: {
        model: "merchants",
        key: "id"
      },
      onUpdate: "cascade",
      onDelete: "cascade"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("non_custodial_wallets", "merchant_id");
  }
};
