'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      merchant: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      organisation: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "merchants",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      amount: {
        type: Sequelize.FLOAT
      },
      currency: {
        type: Sequelize.STRING(4)
      },
      res_currency: {
        type: Sequelize.STRING(4)
      },
      details: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      },
      removed: {
        type: Sequelize.INTEGER
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      },
      signobject: {
        type: Sequelize.JSON
      },
      maker: {
        type: Sequelize.UUID
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('orders');
  }
};