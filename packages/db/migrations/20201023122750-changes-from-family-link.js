"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          "ALTER TABLE if exists users add if not exists temp_pass VARCHAR(100)",
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          "ALTER TABLE if exists users add if not exists pass_chng_date DATE",
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          "ALTER TABLE if exists users add if not exists citizenship VARCHAR(50)",
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          "ALTER TABLE if exists users add if not exists gender VARCHAR(6)",
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          "ALTER TABLE if exists users add if not exists legal_id VARCHAR(100)",
          { transaction: t }
        ),
        queryInterface.sequelize.query(
          "ALTER TABLE if exists users add if not exists person_function VARCHAR(100)",
          { transaction: t }
        ),
        // queryInterface.addColumn(
        //   "users",
        //   "pass_chng_date",
        //   {
        //     type: Sequelize.DATE
        //   },
        //   { transaction: t }
        // ),
        // queryInterface.addColumn(
        //   "users",
        //   "citizenship",
        //   {
        //     type: Sequelize.STRING
        //   },
        //   { transaction: t }
        // ),
        // queryInterface.addColumn(
        //   "users",
        //   "gender",
        //   {
        //     type: Sequelize.STRING
        //   },
        //   { transaction: t }
        // ),
        // queryInterface.addColumn(
        //   "users",
        //   "legal_id",
        //   {
        //     type: Sequelize.STRING
        //   },
        //   { transaction: t }
        // ),
        // queryInterface.addColumn(
        //   "users",
        //   "person_function",
        //   {
        //     type: Sequelize.STRING
        //   },
        //   { transaction: t }
        // )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("users", "temp_pass", { transaction: t }),
        queryInterface.removeColumn("users", "pass_chng_date", {
          transaction: t
        }),
        queryInterface.removeColumn("users", "citizenship", { transaction: t }),
        queryInterface.removeColumn("users", "gender", { transaction: t }),
        queryInterface.removeColumn("users", "legal_id", { transaction: t }),
        queryInterface.removeColumn("users", "person_function", {
          transaction: t
        })
      ]);
    });
  }
};
