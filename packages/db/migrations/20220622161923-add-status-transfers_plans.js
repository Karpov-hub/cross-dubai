"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "transfers_plans",
          "status",
          {
            type: Sequelize.INTEGER,
            defaultValue: 0
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("transfers_plans", "status", {
          transaction: t
        })
      ]);
    });
  }
};
