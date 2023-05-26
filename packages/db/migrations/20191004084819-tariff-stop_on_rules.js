"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "tariffs",
          "stop_on_rules",
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
        queryInterface.removeColumn("tariffs", "stop_on_rules", {
          transaction: t
        })
      ]);
    });
  }
};
