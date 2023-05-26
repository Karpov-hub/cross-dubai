"use strict";

module.exports = {
  up: function(queryInterface, Sequelize) {
    // logic for transforming into the new state
    return queryInterface.addColumn("system_notifications", "title", Sequelize.STRING(100));
  },

  down: function(queryInterface, Sequelize) {
    // logic for reverting the changes
    return queryInterface.removeColumn("system_notifications", "title");
  }
};
