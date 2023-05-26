"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("users", "registred_using_bot", {
        type: Sequelize.BOOLEAN
      }),
      queryInterface.addColumn("users", "website", {
        type: Sequelize.STRING(255)
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("users", "registred_using_bot"),
      queryInterface.removeColumn("users", "website")
    ]);
  }
};
