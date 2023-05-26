"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("currency", "ui_decimal", {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("currency", "ui_decimal");
  }
};
