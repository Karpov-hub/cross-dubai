"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          `create view vw_allusers as select id, concat(first_name,' ',last_name) as name, email as login, 1 as type from users union select _id as id, name, login, 2 as type from admin_users`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
