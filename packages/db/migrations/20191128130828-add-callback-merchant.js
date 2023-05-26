"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "merchants",
          "callback",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "merchants",
          "callback_error",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
