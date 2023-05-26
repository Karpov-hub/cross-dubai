"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn("cryptotx", "network_fee_currency_id", {
          type: Sequelize.STRING(4)
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn("cryptotx", "network_fee_currency_id", {
          type: Sequelize.STRING(3)
        })
      ]);
    });
  }
};
