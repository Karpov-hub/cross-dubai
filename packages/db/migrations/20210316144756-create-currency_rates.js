"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("currency_rates", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      stime: {
        type: Sequelize.DATE
      },
      abbr: {
        type: Sequelize.STRING
      },
      value: {
        type: Sequelize.FLOAT
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("currency_rates");
  }
};
