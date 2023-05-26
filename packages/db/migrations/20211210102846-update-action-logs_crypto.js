"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "logs_crypto",
          "action",
          {
            type: Sequelize.STRING(80)
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "logs_crypto",
          "action",
          {
            type: Sequelize.STRING(50)
          },
          { transaction: t }
        )
      ]);
    });
  }
};
