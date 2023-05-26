"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("stickers", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      parent_id: Sequelize.UUID,
      txt: Sequelize.TEXT,

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      signobject: Sequelize.JSON
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("stickers");
  }
};
