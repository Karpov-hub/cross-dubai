"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(`drop view vw_realmaccounts`, {
          transaction: t
        }),
        queryInterface.addColumn(
          "realmaccounts",
          "callback",
          {
            type: Sequelize.STRING(255)
          },
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          `create view vw_realmaccounts as SELECT a.id,
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
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("realmaccounts", "callback", {
          transaction: t
        })
      ]);
    });
  }
};
