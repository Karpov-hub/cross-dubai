"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("orders", "bank_details", {
      type: Sequelize.TEXT
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("orders", "bank_details");
  }
};
