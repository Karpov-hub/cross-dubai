"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "realmdepartments",
          "director",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realmdepartments",
          "address",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        ,
        queryInterface.addColumn(
          "realmdepartments",
          "register",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realmdepartments",
          "tax_number",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realmdepartments",
          "vat_id",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realmdepartments",
          "bank_id",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("realmdepartments", "director", {
          transaction: t
        }),
        queryInterface.removeColumn("realmdepartments", "address", {
          transaction: t
        }),
        queryInterface.removeColumn("realmdepartments", "register", {
          transaction: t
        }),
        queryInterface.removeColumn("realmdepartments", "tax_number", {
          transaction: t
        }),
        queryInterface.removeColumn("realmdepartments", "vat_id", {
          transaction: t
        }),
        queryInterface.removeColumn("realmdepartments", "bank_id", {
          transaction: t
        })
      ]);
    });
  }
};
