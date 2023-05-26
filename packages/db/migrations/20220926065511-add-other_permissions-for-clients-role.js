"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("client_roles", "other_permissions", {
      type: Sequelize.JSONB
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("client_roles", "other_permissions");
  }
};
