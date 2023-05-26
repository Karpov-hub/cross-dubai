"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "contracts",
          "director_name",
          {
            type: Sequelize.STRING(100),
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "contracts",
          "director_name_history",
          {
            type: Sequelize.JSON,
          },
          { transaction: t }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("contracts", "director_name", {
          transaction: t,
        }),
        queryInterface.removeColumn("contracts", "director_name_history", {
          transaction: t,
        }),
      ]);
    });
  },
};
