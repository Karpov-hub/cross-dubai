"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let tableDefinition = await queryInterface.describeTable("countries");

    if (!tableDefinition.lang)
      return queryInterface.addColumn("countries", "lang", {
        type: Sequelize.STRING(20)
      });
    return;
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
