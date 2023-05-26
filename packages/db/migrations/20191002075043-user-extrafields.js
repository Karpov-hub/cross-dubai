"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "users",
          "country",
          {
            type: Sequelize.STRING(2)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "keyword",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        ,
        queryInterface.addColumn(
          "users",
          "addr1_zip",
          {
            type: Sequelize.STRING(15)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "addr1_address",
          {
            type: Sequelize.STRING(150)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "addr2_zip",
          {
            type: Sequelize.STRING(15)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "addr2_address",
          {
            type: Sequelize.STRING(150)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "notes",
          {
            type: Sequelize.STRING(255)
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("users", "country", { transaction: t }),
        queryInterface.removeColumn("users", "keyword", {
          transaction: t
        }),
        queryInterface.removeColumn("users", "addr1_zip", {
          transaction: t
        }),
        queryInterface.removeColumn("users", "addr1_address", {
          transaction: t
        }),
        queryInterface.removeColumn("users", "addr2_zip", {
          transaction: t
        }),
        queryInterface.removeColumn("users", "notes", {
          transaction: t
        })
      ]);
    });
  }
};
