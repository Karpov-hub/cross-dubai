"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("comments", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      ticketId: {
        type: Sequelize.STRING
      },
      sender: {
        type: Sequelize.STRING
      },
      receiver: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.TEXT
      },
      fileId: {
        type: Sequelize.UUID
      },
      realmId: {
        type: Sequelize.UUID
      },
      is_user_message: {
        type: Sequelize.BOOLEAN
      },
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("comments");
  }
};
