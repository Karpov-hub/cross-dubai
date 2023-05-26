"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_system_notifications", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      user_id: {
        type: Sequelize.UUID
      },
      message: {
        type: Sequelize.JSONB
      },
      system_notification_id: {
        type: Sequelize.UUID
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      new_record: {
        defaultValue: true,
        type: Sequelize.BOOLEAN
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_system_notifications");
  }
};
