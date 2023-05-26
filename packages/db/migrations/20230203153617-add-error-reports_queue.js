"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("reports_queue", "error", {
      type: Sequelize.JSONB
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("reports_queue", "error");
  }
};
