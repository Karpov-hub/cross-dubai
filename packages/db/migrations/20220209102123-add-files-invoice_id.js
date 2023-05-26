"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "files",
          "invoice_id",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "files",
          "cancelled",
          {
            type: Sequelize.INTEGER,
            defaultValue: 0
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("files", "invoice_id", {
          transaction: t
        }),
        queryInterface.removeColumn("files", "cancelled", {
          transaction: t
        })
      ]);
    });
  }
};
