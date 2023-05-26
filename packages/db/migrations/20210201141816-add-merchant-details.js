"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn("merchants", "group", {
          type: Sequelize.STRING(50)
        }),
        queryInterface.addColumn("merchants", "country", {
          type: Sequelize.STRING(3)
        }),
        queryInterface.addColumn("merchants", "vat", {
          type: Sequelize.STRING(20)
        }),
        queryInterface.addColumn("merchants", "email", {
          type: Sequelize.STRING(50)
        }),
        queryInterface.addColumn("merchants", "phone", {
          type: Sequelize.STRING(15)
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("merchants", "group"),
        queryInterface.removeColumn("merchants", "country"),
        queryInterface.removeColumn("merchants", "vat"),
        queryInterface.removeColumn("merchants", "email"),
        queryInterface.removeColumn("merchants", "phone")
      ]);
    });
  }
};
