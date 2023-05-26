"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("account_crypto", "wallet_type", {
      type: Sequelize.INTEGER
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("account_crypto", "wallet_type");
  }
};
