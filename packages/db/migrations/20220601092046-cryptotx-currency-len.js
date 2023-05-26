"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `alter table cryptotx alter column currency_id type varchar(20)`,
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
        queryInterface.sequelize.query(
          `alter table cryptotx alter column currency_id type varchar(4)`,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
