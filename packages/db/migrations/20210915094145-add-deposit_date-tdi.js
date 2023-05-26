"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "tmp_deposit_imports",
          "deposit_date",
          {
            type: Sequelize.DATE
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("tmp_deposit_imports", "deposit_date", {
          transaction: t
        })
      ]);
    });
  }
};
