"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "tests",
          "trigger",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "tests",
          "plan_id",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `ALTER TABLE tests ALTER COLUMN data type text`,
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "checks",
          "parameter",
          {
            type: Sequelize.STRING(255)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "checks",
          "operator",
          {
            type: Sequelize.STRING(10)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "checks",
          "value",
          {
            type: Sequelize.STRING(255)
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("tests", "trigger", {
          transaction: t
        }),
        queryInterface.removeColumn("tests", "plan_id", {
          transaction: t
        }),
        queryInterface.removeColumn("checks", "parameter", {
          transaction: t
        }),
        queryInterface.removeColumn("checks", "operator", {
          transaction: t
        }),
        queryInterface.removeColumn("checks", "value", {
          transaction: t
        })
      ]);
    });
  }
};
