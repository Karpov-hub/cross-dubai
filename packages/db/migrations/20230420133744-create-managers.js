"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("managers", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      admin_id: Sequelize.UUID,
      clients: Sequelize.JSONB
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("managers");
  }
};
