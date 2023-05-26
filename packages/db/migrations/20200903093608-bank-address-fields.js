"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "banks",
          "zip_addr1",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
          "city_addr1",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
          "street_addr1",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
          "house_addr1",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
          "apartment_addr1",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
          "zip_addr2",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
          "city_addr2",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
          "street_addr2",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
          "house_addr2",
          {
            type: Sequelize.STRING(100)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
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
