"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("letters", "lang", {
      type: Sequelize.STRING(2),
      defaultValue: "en"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("letters", "lang");
  }
};
