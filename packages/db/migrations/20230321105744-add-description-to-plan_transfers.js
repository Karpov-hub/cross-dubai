"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("transfers_plans", "description", {
      type: Sequelize.JSONB
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("transfers_plans", "description");
  }
};
