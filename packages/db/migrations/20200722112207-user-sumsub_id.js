"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "sumsub_id", {
      type: Sequelize.STRING(50)
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "sumsub_id");
  }
};
