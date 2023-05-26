"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("non_ad_orders", "short_id", {
      type: Sequelize.STRING(15)
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("non_ad_orders", "short_id");
  }
};
