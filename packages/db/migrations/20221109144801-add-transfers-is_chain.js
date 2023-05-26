"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("transfers", "is_chain", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("transfers", "is_chain");
  }
};
