"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "ip", {
      type: Sequelize.JSON,
      defaultValue: []
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "ip");
  }
};
