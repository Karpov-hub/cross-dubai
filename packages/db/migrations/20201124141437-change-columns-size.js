'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "users",
          "zip_addr1",
          {
            type: Sequelize.STRING(15)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "city_addr1",
          {
            type: Sequelize.STRING(40)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "street_addr1",
          {
            type: Sequelize.STRING(40)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "house_addr1",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "apartment_addr1",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "zip_addr2",
          {
            type: Sequelize.STRING(15)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "city_addr2",
          {
            type: Sequelize.STRING(40)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "street_addr2",
          {
            type: Sequelize.STRING(40)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "house_addr2",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "apartment_addr2",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "citizenship",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "gender",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          "users",
          "zip_addr1",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "city_addr1",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "street_addr1",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "house_addr1",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "apartment_addr1",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "zip_addr2",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "city_addr2",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "street_addr2",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "house_addr2",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "apartment_addr2",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "citizenship",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          "users",
          "gender",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        )
      ]);
    });
  }
};
