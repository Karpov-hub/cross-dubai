"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("orders", "organisation");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("orders", "organisation", {
      type: Sequelize.UUID
    });
  }
};
