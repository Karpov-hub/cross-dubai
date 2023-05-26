'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('realm_department_accounts', {
      department_id:{
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "realmdepartments",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      account_id:{
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "realmaccounts",
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
    return queryInterface.dropTable('realm_department_accounts');
  }
};