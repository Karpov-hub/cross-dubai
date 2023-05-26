"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameTable("servers", "realms");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameTable("realms", "servers");
  }
};
