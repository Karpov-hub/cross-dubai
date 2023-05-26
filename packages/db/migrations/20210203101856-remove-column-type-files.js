"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("files", "type", {
          transaction: t,
        }),
        queryInterface.removeColumn("files", "file", {
          transaction: t,
        }),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "files",
          "type",
          {
            type: Sequelize.STRING,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "files",
          "file",
          {
            type: Sequelize.JSON,
          },
          { transaction: t }
        ),
      ]);
    });
  },
};
