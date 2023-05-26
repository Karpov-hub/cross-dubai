"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint("orders", "orders_realm_department_fkey");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint("orders", {
      fields: ["realm_department"],
      type: "foreign key",
      name: "orders_realm_department_fkey",
      references: {
        table: "realmdepartments",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  }
};
