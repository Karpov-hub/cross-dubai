"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "merchants",
          "short_address",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "merchants",
          "city_district",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "merchants",
          "region",
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
        queryInterface.removeColumn("merchants", "short_address", {
          transaction: t
        }),
        queryInterface.removeColumn("merchants", "city_district", {
          transaction: t
        }),
        queryInterface.removeColumn("merchants", "region", {
          transaction: t
        })
      ]);
    });
  }
};
