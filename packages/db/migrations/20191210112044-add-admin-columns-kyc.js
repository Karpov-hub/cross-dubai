"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "address_kycs",
          "maker",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "address_kycs",
          "signobject",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "address_kycs",
          "removed",
          {
            type: Sequelize.INTEGER,
            defaultValue: 0
          },
          { transaction: t }
        ),

        queryInterface.addColumn(
          "company_kycs",
          "maker",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "company_kycs",
          "signobject",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "company_kycs",
          "removed",
          {
            type: Sequelize.INTEGER,
            defaultValue: 0
          },
          { transaction: t }
        ),

        queryInterface.addColumn(
          "profile_kycs",
          "maker",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "profile_kycs",
          "signobject",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "profile_kycs",
          "removed",
          {
            type: Sequelize.INTEGER,
            defaultValue: 0
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
