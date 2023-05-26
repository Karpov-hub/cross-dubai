"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_documents", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      user_id: {
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING
      },
      doc_code: {
        type: Sequelize.UUID
      },
      type: {
        type: Sequelize.UUID
      },
      status: {
        type: Sequelize.INTEGER
      },
      maker: {
        type: Sequelize.UUID
      },
      ctime: {
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      },
      signobject: {
        type: Sequelize.JSON
      },
      removed: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_documents");
  }
};
