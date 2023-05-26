"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "orders",
      "additional_data",
      {
        type: Sequelize.JSONB
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("orders", "additional_data");
  }
};
