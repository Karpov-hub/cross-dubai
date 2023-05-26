"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("currency", "withdrawal_decimal", {
      type: Sequelize.INTEGER,
      defaultValue: 4,
      allowNull: false
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("currency", "withdrawal_decimal");
  }
};
