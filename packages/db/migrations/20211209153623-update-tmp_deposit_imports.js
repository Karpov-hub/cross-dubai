"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "tmp_deposit_imports",
          "type",
          {
            type: Sequelize.INTEGER
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "tmp_deposit_imports",
          "outtx_name",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("tmp_deposit_imports", "type", {
          transaction: t
        }),
        queryInterface.removeColumn("tmp_deposit_imports", "outtx_name", {
          transaction: t
        })
      ]);
    });
  }
};
