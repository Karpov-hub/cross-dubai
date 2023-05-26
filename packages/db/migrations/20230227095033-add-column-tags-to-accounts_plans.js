"use strict";

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn("accounts_plans", "tags", Sequelize.JSONB);
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn("accounts_plans", "tags");
  }
};
