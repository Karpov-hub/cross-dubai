"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameTable("tarifs", "tariffs");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameTable("tariffs", "tarifs");
  }
};
