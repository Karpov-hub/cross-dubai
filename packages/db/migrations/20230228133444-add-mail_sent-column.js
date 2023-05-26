"use strict";

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      "system_notifications",
      "mail_sent",
      Sequelize.BOOLEAN
    );
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn("system_notifications", "mail_sent");
  }
};
