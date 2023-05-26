"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "variables", {
      type: Sequelize.JSON
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "variables");
  }
};
