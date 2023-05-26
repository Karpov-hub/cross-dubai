"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.changeColumn(
          "profile_kycs",
          "doc_num",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
