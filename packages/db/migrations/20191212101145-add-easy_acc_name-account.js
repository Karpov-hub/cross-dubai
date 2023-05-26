"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("accounts", "easy_acc_name", {
      type: Sequelize.STRING(20)
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("accounts", "easy_acc_name");
  }
};
