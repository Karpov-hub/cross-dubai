"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "cookie", {
      type: Sequelize.BOOLEAN
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "cookie");
  }
};
