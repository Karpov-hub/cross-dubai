'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('daily_rate_history', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      currencies_pair: {
        type: Sequelize.STRING
      },
      buy: {
        type: Sequelize.DECIMAL
      },
      sell: {
        type: Sequelize.DECIMAL
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
      signobject: {
        type: Sequelize.JSON
      },
      maker: {
        type: Sequelize.UUID
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('daily_rate_history');
  }
};