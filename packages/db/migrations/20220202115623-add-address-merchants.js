"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "merchants",
          "zip",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "merchants",
          "city",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "merchants",
          "street",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "merchants",
          "house",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "merchants",
          "additional_info",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "merchants",
          "tax_number",
          {
            type: Sequelize.STRING(30)
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("merchants", "zip", {
          transaction: t
        }),
        queryInterface.removeColumn("merchants", "city", {
          transaction: t
        }),
        queryInterface.removeColumn("merchants", "street", {
          transaction: t
        }),
        queryInterface.removeColumn("merchants", "house", {
          transaction: t
        }),
        queryInterface.removeColumn("merchants", "additional_info", {
          transaction: t
        }),
        queryInterface.removeColumn("merchants", "tax_number", {
          transaction: t
        })
      ]);
    });
  }
};
