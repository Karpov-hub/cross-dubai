'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('realmdepartments', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      realm: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "realms",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING(20)
      },
      bank_details: {
        type: Sequelize.STRING
      },
      removed: {
        type: Sequelize.INTEGER
      },
      maker: {
        type: Sequelize.UUID
      },
      ctime: {
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      },
      signobject: {
        type: Sequelize.JSON
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('realmdepartments');
  }
};