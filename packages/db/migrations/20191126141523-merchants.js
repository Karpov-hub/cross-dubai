"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("merchants", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      account_fiat: Sequelize.UUID,
      account_crypto: Sequelize.UUID,
      name: Sequelize.STRING(50),
      website: Sequelize.STRING(255),
      description: Sequelize.STRING(255),
      categories: Sequelize.STRING(255),
      user_id: Sequelize.UUID,

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      signobject: Sequelize.JSON,
      removed: Sequelize.INTEGER
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("merchants");
  }
};
