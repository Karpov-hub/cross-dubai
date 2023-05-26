"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("non_ad_orders", "order_type", {
      type: Sequelize.STRING
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("non_ad_orders", "order_type", {
      type: Sequelize.UUID
    });
  }
};
