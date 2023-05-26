"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "crypto_wallets",
      "send_via_chain_required",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      "crypto_wallets",
      "send_via_chain_required"
    );
  }
};
