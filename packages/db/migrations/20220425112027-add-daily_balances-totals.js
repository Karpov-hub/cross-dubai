"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "daily_balances",
          "doh_totals",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "daily_balances",
          "rtp_totals",
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
        queryInterface.removeColumn("daily_balances", "doh_totals", {
          transaction: t
        }),
        queryInterface.removeColumn("daily_balances", "rtp_totals", {
          transaction: t
        })
      ]);
    });
  }
};
