"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable(
          "banks",
          {
            id: {
              allowNull: false,
              defaultValue: Sequelize.UUIDV4,
              primaryKey: true,
              type: Sequelize.UUID
            },
            name: Sequelize.STRING(255),
            shortname: Sequelize.STRING(50),
            country: Sequelize.STRING(2),
            swift: Sequelize.STRING(20),
            address1: Sequelize.STRING(255),
            address2: Sequelize.STRING(255),
            notes: Sequelize.STRING(255),
            active: Sequelize.BOOLEAN,
            ctime: Sequelize.DATE,
            mtime: Sequelize.DATE,
            maker: Sequelize.UUID,
            signobject: Sequelize.JSON,
            removed: Sequelize.INTEGER
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "ibans",
          {
            id: {
              allowNull: false,
              defaultValue: Sequelize.UUIDV4,
              primaryKey: true,
              type: Sequelize.UUID
            },
            owner: {
              type: Sequelize.UUID,
              allowNull: false
            },
            bank_id: {
              type: Sequelize.UUID,
              allowNull: false
            },
            iban: Sequelize.STRING(50),
            currency: Sequelize.STRING(3),
            notes: Sequelize.STRING(255),
            dflt: Sequelize.BOOLEAN,
            ctime: Sequelize.DATE,
            mtime: Sequelize.DATE,
            maker: Sequelize.UUID,
            signobject: Sequelize.JSON,
            removed: Sequelize.INTEGER
          },
          { transaction: t }
        )
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable("banks"),
        queryInterface.dropTable("ibans")
      ]);
    });
  }
};
