'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE VIEW vw_orgs_ibans as 
      select oi.org_id, i.id, i.iban, i.currency, i.notes, i."owner" as user_id 
      from org_ibans oi
      inner join ibans i
      on (i.id=oi.iban_id)`);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`DROP VIEW vw_orgs_ibans`);
  }
};
