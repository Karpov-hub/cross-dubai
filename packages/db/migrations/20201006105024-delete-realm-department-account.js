"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "realmdepartments",
          "realm_acc",
          {
            type: Sequelize.UUID,
            references: {
              model: "realmaccounts",
              key: "id"
            },
            onUpdate: "cascade",
            onDelete: "cascade"
          },
          {
            transaction: t
          }
        ),
        queryInterface.dropTable("realm_department_accounts", {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `DROP VIEW IF EXISTS vw_withdraval_accounts`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_realmaccounts`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_realmaccounts AS SELECT a.id,
          a.acc_no,
          a.currency,
          a.owner,
          a.balance,
          a.active,
          a.ctime,
          a.mtime,
          a.stime,
          a.ltime,
          a.removed,
          a.signobject,
          a.maker,
          a.negative,
          a.status,
          a.acc_name,
          r.iban_id,
          r.id as ra_id,
          r.type,
          r.details,
          r.country,
          r.callback
         FROM realmaccounts r,
          accounts a
        WHERE r.account_id = a.id`,
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_withdraval_accounts AS SELECT m.id AS merchant,
          a.acc_name,
          a.acc_no,
          a.currency
         FROM users m,
          vw_realmaccounts a
        WHERE m.realm = a.owner AND a.type = 2`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("realmdepartments", "realm_acc", {
          transaction: t
        }),
        queryInterface.createTable(
          "realm_department_accounts",
          {
            department_id: {
              type: Sequelize.UUID,
              allowNull: false,
              references: {
                model: "realmdepartments",
                key: "id"
              },
              onUpdate: "cascade",
              onDelete: "cascade"
            },
            account_id: {
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
          },
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_realmaccounts`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_realmaccounts AS SELECT a.id,
          a.acc_no,
          a.currency,
          a.owner,
          a.balance,
          a.active,
          a.ctime,
          a.mtime,
          a.stime,
          a.ltime,
          a.removed,
          a.signobject,
          a.maker,
          a.negative,
          a.status,
          a.acc_name,
          r.iban_id,
          r.type,
          r.details,
          r.country,
          r.callback
         FROM realmaccounts r,
          accounts a
        WHERE r.account_id = a.id`,
          { transaction: t }
        )
      ]);
    });
  }
};
