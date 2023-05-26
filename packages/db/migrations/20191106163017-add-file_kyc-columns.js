"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "profile_kycs",
          "file_name",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "profile_kycs",
          "file_size",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "address_kycs",
          "file_name",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "address_kycs",
          "file_size",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "company_kycs",
          "file_name",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "company_kycs",
          "file_size",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.removeColumn("tickets", "fileId", { transaction: t }),
        queryInterface.removeColumn("comments", "fileId", { transaction: t }),
        queryInterface.addColumn(
          "tickets",
          "fileId",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "tickets",
          "file_name",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "tickets",
          "file_size",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "comments",
          "fileId",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "comments",
          "file_name",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "comments",
          "file_size",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("profile_kycs", "file_name", {
          transaction: t
        }),
        queryInterface.removeColumn("profile_kycs", "file_size", {
          transaction: t
        }),
        queryInterface.removeColumn("address_kycs", "file_name", {
          transaction: t
        }),
        queryInterface.removeColumn("address_kycs", "file_size", {
          transaction: t
        }),
        queryInterface.removeColumn("company_kycs", "file_name", {
          transaction: t
        }),
        queryInterface.removeColumn("company_kycs", "file_size", {
          transaction: t
        })
      ]);
    });
  }
};
