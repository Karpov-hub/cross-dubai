"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "transfers",
          "canceled",
          {
            defaultValue: false,
            type: Sequelize.BOOLEAN
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "transactions",
          "canceled",
          {
            defaultValue: false,
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
        queryInterface.removeColumn("transfers", "canceled", {
          transaction: t
        }),
        queryInterface.removeColumn("transactions", "canceled", {
          transaction: t
        })
      ]);
    });
  }
};
