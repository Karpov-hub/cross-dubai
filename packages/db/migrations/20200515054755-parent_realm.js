"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("realms", "pid", {
      type: Sequelize.UUID
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("realms", "pid");
  }
};
