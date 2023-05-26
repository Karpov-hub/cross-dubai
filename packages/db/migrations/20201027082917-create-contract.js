'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('contracts', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING(50)
      },
      description: {
        type: Sequelize.STRING
      },
      code: {
        type: Sequelize.UUID
      },
      status: {
        type: Sequelize.STRING(20)
      },
      contract_date: {
        type: Sequelize.DATE
      },
      expiration_date: {
        type: Sequelize.DATE
      },
      ctime: {
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      },
      maker: {
        type: Sequelize.UUID
      },
      removed: {
        type: Sequelize.INTEGER
      },
      signobject: {
        type: Sequelize.JSON
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('contracts');
  }
};