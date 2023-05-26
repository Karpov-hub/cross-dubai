"use strict";

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn("users", "inner_client", Sequelize.BOOLEAN);
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn("users", "inner_client");
  }
};
