'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "orders",
      "realm_department",
      {
        type: Sequelize.UUID,
        references: {
          model: "realmdepartments",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      "orders",
      "realm_department"
    )
  }
};
