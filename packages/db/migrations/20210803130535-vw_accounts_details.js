"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `CREATE VIEW vw_accounts_details
          AS SELECT ac.id,
              ac.account_number,
              ac.bank,
              ac.swift,
              ac.correspondent_currency,
              ac.correspondent_account,
              m.id AS merchant_id,
              m.name AS merchant_name,
              c.contract_subject
             FROM merchants m
               JOIN orgs_contracts oc ON oc.owner_id = m.id
               JOIN contracts c ON c.id = oc.contract_id
               JOIN account_contracts ac ON ac.owner_id = c.id;`,
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
        queryInterface.sequelize.query(`DROP VIEW vw_accounts_details`, {
          transaction: t
        })
      ]);
    });
  }
};
