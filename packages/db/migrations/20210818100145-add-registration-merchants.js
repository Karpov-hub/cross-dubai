"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("merchants", "registration", {
      type: Sequelize.TEXT
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("merchants", "registration");
  }
};
