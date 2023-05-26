"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "role", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "client_roles",
        key: "id"
      },
      onUpdate: "cascade",
      onDelete: "cascade"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "role");
  }
};
