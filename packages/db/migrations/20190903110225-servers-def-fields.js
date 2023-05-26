"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "servers",
          "removed",
          {
            type: Sequelize.INTEGER
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "servers",
          "signobject",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        ,
        queryInterface.addColumn(
          "servers",
          "maker",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("servers", "removed", { transaction: t }),
        queryInterface.removeColumn("servers", "signobject", {
          transaction: t
        }),
        queryInterface.removeColumn("servers", "maker", {
          transaction: t
        })
      ]);
    });
  }
};
