"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `create or replace view vw_all_transfers as 
        select 
          p.id, 
          x.acc_src, 
          x.acc_dst, 
          p.ctime, 
          p.step, 
          'p' as type, 
          t.event_name,
          x.held,
          x.canceled,
          t.show_to_client,
          t.invisibility_exp_date
        from 
          transfers_plans p, 
          transfers t, 
          transactions x 
        where 
          t.plan_transfer_id=p.id and t.id=x.transfer_id 
        group by p.id, x.acc_src, x.acc_dst, p.ctime, p.step, t.event_name, x.held, x.canceled, t.show_to_client, t.invisibility_exp_date
        union 
        select 
          t.id, 
          x.acc_src, 
          x.acc_dst, 
          t.ctime, 0 as step, 
          't' as type, 
          t.event_name,
          x.held,
          x.canceled,
          t.show_to_client,
          t.invisibility_exp_date
        from 
          transfers t, 
          transactions x 
        where 
          plan_transfer_id is null and t.id=x.transfer_id 
        group by t.id, x.acc_src, x.acc_dst, t.ctime, t.event_name, x.held, x.canceled, t.show_to_client, t.invisibility_exp_date`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `create or replace view vw_all_transfers as 
        select 
          p.id, 
          x.acc_src, 
          x.acc_dst, 
          p.ctime, 
          p.step, 
          'p' as type, 
          t.event_name,
          x.held,
          x.canceled 
        from 
          transfers_plans p, 
          transfers t, 
          transactions x 
        where 
          t.plan_transfer_id=p.id and t.id=x.transfer_id 
        group by p.id, x.acc_src, x.acc_dst, p.ctime, p.step, t.event_name, x.held, x.canceled 
        union 
        select 
          t.id, 
          x.acc_src, 
          x.acc_dst, 
          t.ctime, 0 as step, 
          't' as type, 
          t.event_name,
          x.held,
          x.canceled 
        from 
          transfers t, 
          transactions x 
        where 
          plan_transfer_id is null and t.id=x.transfer_id 
        group by t.id, x.acc_src, x.acc_dst, t.ctime, t.event_name, x.held, x.canceled `
    );
  }
};
