"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    await queryInterface.createTable(
      "tags",
      {
        entity: {
          allowNull: false,
          type: Sequelize.UUID
        },
        tag: Sequelize.STRING(20)
      },
      { transaction }
    );
    await queryInterface.addIndex("tags", ["entity", "tag"], { transaction });
    await transaction.commit();
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("tags");
  }
};
