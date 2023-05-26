"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `ALTER TABLE merchants DROP COLUMN categories CASCADE;`,
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "merchants",
          "categories",
          { type: Sequelize.STRING },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("merchants", "categories"),
        queryInterface.addColumn(
          "merchants",
          "categories",
          { type: Sequelize.JSON },
          { transaction: t }
        )
      ]);
    });
  }
};
