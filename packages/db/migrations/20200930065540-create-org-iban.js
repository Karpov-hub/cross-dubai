"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("org_ibans", {
      org_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "merchants",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      iban_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "ibans",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      ctime: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("org_ibans");
  }
};
