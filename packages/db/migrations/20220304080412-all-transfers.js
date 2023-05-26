"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `create view vw_all_transfers as select p.id, x.acc_src, x.acc_dst, p.ctime, p.step, 'p' as type from transfers_plans p, transfers t, transactions x where t.plan_transfer_id=p.id and t.id=x.transfer_id group by p.id, x.acc_src, x.acc_dst, p.ctime, p.step union select t.id, x.acc_src, x.acc_dst, t.ctime, 0 as step, 't' as type from transfers t, transactions x where plan_transfer_id is null and t.id=x.transfer_id group by t.id, x.acc_src, x.acc_dst, t.ctime`,
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
        queryInterface.sequelize.query(`DROP VIEW vw_all_transfers`, {
          transaction: t
        })
      ]);
    });
  }
};
