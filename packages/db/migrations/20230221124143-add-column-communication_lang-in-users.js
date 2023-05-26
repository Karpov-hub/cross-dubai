"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "communication_lang", {
      type: Sequelize.STRING(3)
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "communication_lang");
  }
};
