"use strict";

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      "non_ad_orders",
      "has_transfers",
      Sequelize.BOOLEAN
    );
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn("non_ad_orders", "has_transfers");
  }
};
