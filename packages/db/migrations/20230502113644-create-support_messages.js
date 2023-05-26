"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("support_messages", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      user_id: Sequelize.UUID,
      sender: Sequelize.UUID,
      text: Sequelize.TEXT,
      attachments: Sequelize.JSONB,
      is_new: Sequelize.BOOLEAN,

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      signobject: Sequelize.JSON,
      removed: Sequelize.INTEGER
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("support_message");
  }
};
