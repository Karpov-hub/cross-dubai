"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("finance_settings", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: Sequelize.STRING(255),
      gtype: Sequelize.STRING(10),
      description: Sequelize.STRING,
      accounts: Sequelize.JSONB,
      duration: Sequelize.INTEGER,
      currency: Sequelize.STRING(3),
      status_pending: Sequelize.BOOLEAN,
      status_approved: Sequelize.BOOLEAN,
      status_canceled: Sequelize.BOOLEAN,
      status_refund: Sequelize.BOOLEAN,

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      signobject: Sequelize.JSONB,
      removed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("finance_settings");
  }
};
