"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          `alter table letters rename column "from" to from_email`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `alter table letters rename column "to" to to_email`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(`alter table letters add data text`, {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
