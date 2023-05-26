"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("servers", "permissions", {
      type: Sequelize.JSON
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("servers", "permissions");
  }
};
