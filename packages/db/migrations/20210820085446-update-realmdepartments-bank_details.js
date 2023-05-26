"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "realmdepartments",
          "bank_details",
          { type: Sequelize.TEXT },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "realmdepartments",
          "bank_details",
          { type: Sequelize.STRING },
          { transaction: t }
        )
      ]);
    });
  }
};
