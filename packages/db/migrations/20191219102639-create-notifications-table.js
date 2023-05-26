"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("notifications", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      sender: Sequelize.STRING(60),
      sender_id: Sequelize.UUID,
      message: Sequelize.STRING,
      new: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      user_id: Sequelize.UUID,

      maker: Sequelize.UUID,
      signobject: Sequelize.JSON,
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("notifications");
  }
};
