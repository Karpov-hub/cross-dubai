"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("contracts", "contract_subject", {
      type: Sequelize.TEXT,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("contracts", "contract_subject");
  },
};
