"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_notification_settings", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: Sequelize.UUID,
      notification_settings: Sequelize.JSONB
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_notification_settings");
  }
};
