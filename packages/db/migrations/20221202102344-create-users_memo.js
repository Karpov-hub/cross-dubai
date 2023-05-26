"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("users_memo", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      maker: Sequelize.UUID,
      ref_id: Sequelize.UUID,
      memo: Sequelize.TEXT
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("users_memo");
  }
};
