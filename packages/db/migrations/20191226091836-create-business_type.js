"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("business_types", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      type: Sequelize.STRING(60),
      realm: Sequelize.UUID,

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
    return queryInterface.dropTable("business_types");
  }
};
