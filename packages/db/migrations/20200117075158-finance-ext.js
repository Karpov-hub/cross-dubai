"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "finance_settings",
          "separate_chart",
          {
            type: Sequelize.BOOLEAN
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("finance_settings", "separate_chart", {
          transaction: t
        })
      ]);
    });
  }
};
