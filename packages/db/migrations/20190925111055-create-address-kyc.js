"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("address_kycs", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      userId: {
        type: Sequelize.UUID
      },
      realmId: {
        type: Sequelize.UUID
      },
      country: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      zip_code: {
        type: Sequelize.STRING
      },
      address_type: {
        type: Sequelize.STRING
      },
      doc_type: {
        type: Sequelize.STRING
      },
      issue_date: {
        type: Sequelize.DATE
      },
      file: {
        type: Sequelize.UUID
      },
      verified: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("address_kycs");
  }
};
