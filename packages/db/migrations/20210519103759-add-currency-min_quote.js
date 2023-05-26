"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("currency", "min_quote", {
      type: Sequelize.FLOAT,
      defaultValue: 1
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("tickets", "min_quote");
  }
};
