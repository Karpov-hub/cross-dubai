"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "realmdepartments",
          "ot_proforma_invoice_eur",
          {
            type: Sequelize.INTEGER,
            defaultValue: 0
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realmdepartments",
          "ot_proforma_invoice_usd",
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
        queryInterface.removeColumn(
          "realmdepartments",
          "ot_proforma_invoice_usd",
          {
            transaction: t
          }
        ),
        queryInterface.removeColumn(
          "realmdepartments",
          "ot_proforma_invoice_eur",
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
