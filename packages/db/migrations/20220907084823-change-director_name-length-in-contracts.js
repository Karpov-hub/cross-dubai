"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`drop view vw_orgs_contract;`, {
          transaction: t
        }),
        queryInterface.changeColumn(
          "contracts",
          "director_name",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `CREATE OR REPLACE VIEW vw_orgs_contract
        AS SELECT oc.owner_id,
            oc.contract_id,
            c.id,
            c.name,
            c.description,
            c.code,
            c.status,
            c.contract_date,
            c.expiration_date,
            c.ctime,
            c.mtime,
            c.maker,
            c.removed,
            c.signobject,
            c.contract_subject,
            c.director_name,
            c.director_name_history,
            c.memo,
            c.automatic_renewal,
            c.tariff,
            c.variables,
            c.other_signatories
           FROM orgs_contracts oc
             JOIN contracts c ON c.id = oc.contract_id;`,
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
        queryInterface.sequelize.query(`drop view vw_orgs_contract;`, {
          transaction: t
        }),
        queryInterface.changeColumn(
          "contracts",
          "director_name",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `CREATE OR REPLACE VIEW vw_orgs_contract
        AS SELECT oc.owner_id,
            oc.contract_id,
            c.id,
            c.name,
            c.description,
            c.code,
            c.status,
            c.contract_date,
            c.expiration_date,
            c.ctime,
            c.mtime,
            c.maker,
            c.removed,
            c.signobject,
            c.contract_subject,
            c.director_name,
            c.director_name_history,
            c.memo,
            c.automatic_renewal,
            c.tariff,
            c.variables,
            c.other_signatories
           FROM orgs_contracts oc
             JOIN contracts c ON c.id = oc.contract_id;`,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
