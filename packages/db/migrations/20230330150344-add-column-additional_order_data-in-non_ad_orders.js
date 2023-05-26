"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "not_sent_plan_transfers",
      "additional_order_data",
      {
        type: Sequelize.JSONB
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      "not_sent_plan_transfers",
      "additional_order_data"
    );
  }
};
