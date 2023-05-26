"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("realms", "cors", {
      type: Sequelize.JSON
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("realms", "cors");
  }
};
