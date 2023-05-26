"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.renameColumn(
          "merchants",
          "manual_orders",
          "disable_manual_orders"
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.renameColumn(
          "merchants",
          "disable_manual_orders",
          "manual_orders"
        )
      ]);
    });
  }
};
