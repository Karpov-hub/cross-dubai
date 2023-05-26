"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("users", "goverment", { transaction: t }),
        queryInterface.removeColumn("users", "city", { transaction: t }),
        queryInterface.removeColumn("users", "street", { transaction: t }),
        queryInterface.removeColumn("users", "house", { transaction: t }),
        queryInterface.removeColumn("users", "apartment", { transaction: t }),

        queryInterface.addColumn(
          "users",
          "zip_addr1",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "city_addr1",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "street_addr1",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "house_addr1",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "apartment_addr1",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "zip_addr2",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "city_addr2",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "street_addr2",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "house_addr2",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "apartment_addr2",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
