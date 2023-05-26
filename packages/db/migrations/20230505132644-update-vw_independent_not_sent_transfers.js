"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `CREATE OR REPLACE VIEW vw_independent_not_sent_transfers
      AS SELECT nspt.id,
          nspt.plan_transfer_id,
          nspt.merchant_id,
          nspt.amount,
          nspt.fees,
          nspt.netto_amount,
          nspt.rate,
          nspt.result_amount,
          nspt.currency,
          nspt.result_currency,
          nspt.plan_id,
          nspt.ref_id,
          nspt.tariff,
          nspt.variables,
          nspt.description,
          nspt.status,
          nspt.approver,
          nspt.ctime,
          nspt.mtime,
          nspt.maker,
          nspt.signobject,
          nspt.removed,
          nspt.is_draft,
          nspt.last_rejection_reason,
          nspt.approve_request
         FROM not_sent_plan_transfers nspt
        WHERE nspt.ref_id::text = '2'::text;`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `DROP VIEW vw_independent_not_sent_transfers`,
            {
              transaction: t
            }
        ),
        queryInterface.sequelize.query(
          `CREATE OR REPLACE VIEW vw_independent_not_sent_transfers
          AS SELECT nspt.id,
              nspt.plan_transfer_id,
              nspt.merchant_id,
              nspt.amount,
              nspt.fees,
              nspt.netto_amount,
              nspt.rate,
              nspt.result_amount,
              nspt.currency,
              nspt.result_currency,
              nspt.plan_id,
              nspt.ref_id,
              nspt.tariff,
              nspt.variables,
              nspt.description,
              nspt.status,
              nspt.approver,
              nspt.ctime,
              nspt.mtime,
              nspt.maker,
              nspt.signobject,
              nspt.removed
             FROM not_sent_plan_transfers nspt
            WHERE nspt.ref_id::text = '2'::text;`,
            {
              transaction: t
            }
        )
      ]);
    });
  }
};
