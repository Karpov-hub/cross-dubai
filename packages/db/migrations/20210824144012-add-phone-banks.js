"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("banks", "phone", {
      type: Sequelize.TEXT
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("banks", "phone");
  }
};
