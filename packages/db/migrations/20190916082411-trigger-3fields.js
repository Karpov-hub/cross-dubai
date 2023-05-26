"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "triggers",
          "ttype",
          {
            type: Sequelize.INTEGER
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "triggers",
          "tablename",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        ,
        queryInterface.addColumn(
          "triggers",
          "conditions",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("triggers", "ttype", { transaction: t }),
        queryInterface.removeColumn("triggers", "tablename", {
          transaction: t
        }),
        queryInterface.removeColumn("triggers", "conditions", {
          transaction: t
        })
      ]);
    });
  }
};
