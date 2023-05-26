'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tranches', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      ref_id: {
        type: Sequelize.UUID
      },
      no: {
        type: Sequelize.INTEGER
      },
      data: {
        type: Sequelize.JSONB
      },
      ctime: {
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      },
      removed: {
        type: Sequelize.INTEGER
      },
      maker: {
        type: Sequelize.UUID
      },
      signobject: {
        type: Sequelize.JSONB
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tranches');
  }
};