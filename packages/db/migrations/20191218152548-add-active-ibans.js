"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "ibans",
          "active",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "ibans",
          "file_id",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "ibans",
          "file_name",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "ibans",
          "file_size",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("ibans", "active", {
          transaction: t
        }),
        queryInterface.removeColumn("ibans", "file_id", {
          transaction: t
        }),
        queryInterface.removeColumn("ibans", "file_name", {
          transaction: t
        }),
        queryInterface.removeColumn("ibans", "file_size", {
          transaction: t
        })
      ]);
    });
  }
};
