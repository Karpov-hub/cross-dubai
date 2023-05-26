"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("currency_history", "crypto", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("currency_history", "crypto");
  }
};
