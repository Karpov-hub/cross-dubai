"use strict";

module.exports = {
  up: function(queryInterface, Sequelize) {
    // logic for transforming into the new state
    return queryInterface.addColumn("users", "google_auth", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: function(queryInterface, Sequelize) {
    // logic for reverting the changes
    return queryInterface.removeColumn("users", "google_auth");
  }
};
