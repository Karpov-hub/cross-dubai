"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "on_top", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "on_top");
  }
};
