"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `create view vw_transactions_view
          as SELECT 
            x.id,
            x.transfer_id,
            x.user_id,
            x.realm_id,
            (case when t.data->>'deposit_date' is null then x.ctime else to_date(t.data->>'deposit_date','YYYY-MM-DD') end) ctime,
            t.data->>'organisation_name' as merchant_name,
            t.data->>'merchant' as merchant,
            x.description_src,
            x.description_dst,
            t.data,
            t.held,
            t.status,
            x.amount,
            t.canceled,
            x.currency_dst,
            x.currency_src
             FROM transfers t,
              transactions x
            WHERE t.id = x.transfer_id AND x.hidden = false 
            GROUP BY x.id, x.ref_id, x.held, x.canceled, x.ctime, x.mtime, t.data, t.held, t.status, t.canceled;
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
        queryInterface.sequelize.query(`DROP VIEW vw_transactions_view`, {
          transaction: t
        })
      ]);
    });
  }
};
