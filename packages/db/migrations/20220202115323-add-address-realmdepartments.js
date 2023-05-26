"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "realmdepartments",
          "country",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realmdepartments",
          "zip",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realmdepartments",
          "city",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realmdepartments",
          "street",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realmdepartments",
          "house",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realmdepartments",
          "additional_info",
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
        queryInterface.removeColumn("realmdepartments", "country", {
          transaction: t
        }),
        queryInterface.removeColumn("realmdepartments", "zip", {
          transaction: t
        }),
        queryInterface.removeColumn("realmdepartments", "city", {
          transaction: t
        }),
        queryInterface.removeColumn("realmdepartments", "street", {
          transaction: t
        }),
        queryInterface.removeColumn("realmdepartments", "house", {
          transaction: t
        }),
        queryInterface.removeColumn("realmdepartments", "additional_info", {
          transaction: t
        })
      ]);
    });
  }
};
