"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "users",
          "payment_details",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realms",
          "payment_details",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "merchants",
          "payment_details",
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
        queryInterface.removeColumn("users", "payment_details", {
          transaction: t
        }),
        queryInterface.removeColumn("realms", "payment_details", {
          transaction: t
        }),
        queryInterface.removeColumn("merchants", "payment_details", {
          transaction: t
        })
      ]);
    });
  }
};
