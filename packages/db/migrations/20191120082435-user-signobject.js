"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          `alter table messages alter column to_name type jsonb`,
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `alter table messages alter column signobject type jsonb`,
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `alter table messages alter column touser type jsonb`,
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "signobject",
          {
            type: Sequelize.JSONB
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "active",
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("users", "signobject", {
          transaction: t
        }),
        queryInterface.removeColumn("users", "active", {
          transaction: t
        })
      ]);
    });
  }
};
