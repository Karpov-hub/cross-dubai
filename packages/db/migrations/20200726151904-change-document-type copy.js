"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "user_documents",
          "type",
          { type: Sequelize.STRING },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "user_documents",
          "type",
          { type: Sequelize.UUID },
          { transaction: t }
        )
      ]);
    });
  }
};
