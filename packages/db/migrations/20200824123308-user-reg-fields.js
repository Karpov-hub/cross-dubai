"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "users",
          "middle_name",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "goverment",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "city",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "street",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "house",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "apartment",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "fa");
  }
};
