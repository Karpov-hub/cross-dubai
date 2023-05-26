"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("transfers", "order_id", {
      type: Sequelize.UUID,
      references: {
        model: "merchants",
        key: "id"
      },
      onUpdate: "cascade",
      onDelete: "cascade"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("transfers", "order_id");
  }
};
