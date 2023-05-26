"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("invoices", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      invoice: Sequelize.JSON,
      realm_department: Sequelize.UUID,
      merchant: Sequelize.UUID,

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      removed: Sequelize.INTEGER,
      signobject: Sequelize.JSON
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("invoices");
  }
};
