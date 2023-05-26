"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "currency",
          "ap_active",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "currency",
          "ui_active",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("currency", "ap_active", {
          transaction: t
        }),
        queryInterface.removeColumn("currency", "ui_active", {
          transaction: t
        })
      ]);
    });
  }
};
