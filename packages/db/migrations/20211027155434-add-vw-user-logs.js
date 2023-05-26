"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW if exists vw_user_logs`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `create or replace view vw_user_logs as
          select
            al.id,
            u.legalname as username,
            m.name as merchant,
            al.data->>'method' as method,
            al.data,
            al.result,
            date
          from admin_logs al 
          left join merchants m on 
          case when al.data->'data'->>'merchant' = al.data->>'user' then al.data->'data'->>'organisation' else al.data->'data'->>'merchant' 
          end = m.id::text 
          left join users u on al.data->>'user' = u.id::text
            where al.data->>'method' ~* 'deposit' or al.data->>'method' ~* 'withdrawal'  
            or al.data->>'method' ~* 'createOrder' 
            or al.data->>'method' ~* 'accept'`,
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
        queryInterface.sequelize.query(`DROP VIEW if exists vw_user_logs`, {
          transaction: t
        })
      ]);
    });
  }
};