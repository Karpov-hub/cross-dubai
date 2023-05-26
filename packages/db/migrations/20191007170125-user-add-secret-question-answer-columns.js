"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("users", "secret_question", {
        type: Sequelize.STRING(255)
      }),
      queryInterface.addColumn("users", "secret_answer", {
        type: Sequelize.STRING(255)
      }),
      queryInterface.addColumn("users", "referral_link", {
        type: Sequelize.STRING(255)
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("users", "secret_question"),
      queryInterface.removeColumn("users", "secret_answer"),
      queryInterface.removeColumn("users", "referral_link")
    ]);
  }
};
