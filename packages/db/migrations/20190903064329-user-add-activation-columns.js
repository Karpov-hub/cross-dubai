"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "users",
          "activated",
          {
            type: Sequelize.BOOLEAN
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "activatecode",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        ,
        queryInterface.addColumn(
          "servers",
          "activateuserlink",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("users", "activated", { transaction: t }),
        queryInterface.removeColumn("users", "activatecode", {
          transaction: t
        }),
        queryInterface.removeColumn("servers", "activateuserlink", {
          transaction: t
        })
      ]);
    });
  }
};
