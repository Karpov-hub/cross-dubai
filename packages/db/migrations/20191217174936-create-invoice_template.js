"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("invoice_templates", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: Sequelize.STRING,
      html: Sequelize.TEXT,

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      signobject: Sequelize.JSON,
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("invoice_templates");
  }
};
