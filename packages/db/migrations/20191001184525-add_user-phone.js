"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "phone", {
      type: Sequelize.STRING(15)
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "phone");
  }
};
