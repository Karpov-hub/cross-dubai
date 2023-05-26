"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "contracts",
          "memo",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `
            DROP VIEW IF EXISTS vw_orgs_contract;
            CREATE OR REPLACE VIEW vw_orgs_contract
            AS select oc.*, c.*
            from orgs_contracts oc
            inner join contracts c
            on (c.id = oc.contract_id)
          `,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("contracts", "memo", {
          transaction: t
        })
      ]);
    });
  }
};
