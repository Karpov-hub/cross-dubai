"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`update users set order_counter = c.cnt from (select count(*) as cnt, u.id from orders o, users u where o.ctime > date_trunc('year', now()) and merchant = u.id
        group by u.id) as c where users.id = c.id`, {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`update users set order_counter = 0`, {
          transaction: t
        })
      ]);
    });
  }
};
