'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('withdrawal_statements', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      code: {
        type: Sequelize.STRING
      },
      transfer_id: {
        type: Sequelize.UUID
      },
      generation_date: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('withdrawal_statements');
  }
};