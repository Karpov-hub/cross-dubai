"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "accounts",
          "negative",
          {
            type: Sequelize.BOOLEAN
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "accounts",
          "status",
          {
            type: Sequelize.INTEGER
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("accounts", "negative", { transaction: t }),
        queryInterface.removeColumn("accounts", "status", {
          transaction: t
        })
      ]);
    });
  }
};
