"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `
        DROP VIEW IF EXISTS vw_org_ibans
        `,
          {
            transaction: t
          }
        ),
        queryInterface.changeColumn(
          "ibans",
          "bank_id",
          {
            type: Sequelize.UUID,
            allowNull: true
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "ibans",
          "name",
          {
            type: Sequelize.STRING(50)
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "ibans",
          "bank_details",
          {
            type: Sequelize.STRING
          },
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `
        CREATE OR REPLACE VIEW vw_org_ibans
AS SELECT m.org_id AS org,
    a.id,
    a.owner,
    a.bank_id,
    a.iban,
    a.currency,
    a.notes,
    a.dflt,
    a.ctime,
    a.mtime,
    a.maker,
    a.signobject,
    a.removed,
    a.active,
    a.file_id,
    a.file_name,
    a.file_size,
    a.receiver_name,
    a.name,
    a.bank_details
   FROM ibans a,
    org_ibans m
  WHERE m.iban_id = a.id;
        `,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `
        DROP VIEW IF EXISTS vw_org_ibans
        `,
          {
            transaction: t
          }
        ),
        queryInterface.changeColumn(
          "ibans",
          "bank_id",
          {
            type: Sequelize.UUID,
            allowNull: false
          },
          {
            transaction: t
          }
        ),
        queryInterface.removeColumn(
          "ibans",
          "name",
          {
            transaction: t
          }
        ),
        queryInterface.removeColumn(
          "ibans",
          "bank_details",
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `
        CREATE OR REPLACE VIEW vw_org_ibans
AS SELECT m.org_id AS org,
    a.id,
    a.owner,
    a.bank_id,
    a.iban,
    a.currency,
    a.notes,
    a.dflt,
    a.ctime,
    a.mtime,
    a.maker,
    a.signobject,
    a.removed,
    a.active,
    a.file_id,
    a.file_name,
    a.file_size,
    a.receiver_name
   FROM ibans a,
    org_ibans m
  WHERE m.iban_id = a.id;
        `,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
