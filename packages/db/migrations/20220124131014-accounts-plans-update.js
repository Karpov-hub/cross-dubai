"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "transfers_plans",
          "tariff",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "transfers_plans",
          "variables",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "transfers_plans",
          "items",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("transfers_plans", "tariff", {
          transaction: t
        }),
        queryInterface.removeColumn("transfers_plans", "variables", {
          transaction: t
        }),
        queryInterface.removeColumn("transfers_plans", "items", {
          transaction: t
        })
      ]);
    });
  }
};
