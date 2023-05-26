"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "tariff", {
      type: Sequelize.UUID
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "tariff");
  }
};
