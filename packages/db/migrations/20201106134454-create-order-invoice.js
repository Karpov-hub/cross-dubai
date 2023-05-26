"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("order_invoices", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      code: {
        type: Sequelize.STRING
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "orders",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      generation_date: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("order_invoices");
  }
};
