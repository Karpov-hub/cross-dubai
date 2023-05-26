"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "invoice_templates",
          "def",
          {
            type: Sequelize.BOOLEAN
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "invoice_tpl",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "transporters",
          "name",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `alter table transporters alter column host_transporter type varchar(255)`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `alter table transporters alter column user_transporter type varchar(255)`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `alter table transporters alter column password_transporter type varchar(255)`,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("invoice_templates", "def", {
          transaction: t
        }),
        queryInterface.removeColumn("users", "invoice_tpl", {
          transaction: t
        }),
        queryInterface.removeColumn("transporters", "name", {
          transaction: t
        })
      ]);
    });
  }
};
