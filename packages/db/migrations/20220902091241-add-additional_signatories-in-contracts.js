"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("contracts", "other_signatories", {
      type: Sequelize.JSONB
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("contracts", "other_signatories");
  }
};
