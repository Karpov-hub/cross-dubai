"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("orgs_contracts", {
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      contract_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "contracts",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("orgs_contracts");
  }
};
