"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_trancactions`, {
          transaction: t
        }),
        queryInterface.addColumn(
          "transactions",
          "currency_src",
          {
            type: Sequelize.STRING(3)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "transactions",
          "currency_dst",
          {
            type: Sequelize.STRING(3)
          },
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `CREATE OR REPLACE VIEW vw_trancactions AS select t.*, r.name as realmname, concat(u.last_name,' ',u.first_name) as username, u.legalname, u.type as user_type FROM realms r, transactions t left join users u on t.user_id = u.id where t.realm_id = r.id`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
