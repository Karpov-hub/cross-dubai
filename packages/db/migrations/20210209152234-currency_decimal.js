"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("currency", "decimal", {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("currency", "decimal");
  }
};
