"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("profile_kycs", "file", { transaction: t }),
        queryInterface.removeColumn("address_kycs", "file", { transaction: t }),
        queryInterface.removeColumn("company_kycs", "file", { transaction: t }),
        queryInterface.addColumn(
          "profile_kycs",
          "file",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "company_kycs",
          "file",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "address_kycs",
          "file",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
