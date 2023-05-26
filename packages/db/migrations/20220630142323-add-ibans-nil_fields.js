"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "ibans",
          "verified_on_nil",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "ibans",
          "nil_account_description",
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
        queryInterface.removeColumn("ibans", "verified_on_nil", {
          transaction: t
        }),
        queryInterface.removeColumn("ibans", "nil_account_description", {
          transaction: t
        })
      ]);
    });
  }
};
