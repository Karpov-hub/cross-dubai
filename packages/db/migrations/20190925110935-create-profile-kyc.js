"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("profile_kycs", {
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
      doc_type: {
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING
      },
      middle_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      issue_date: {
        type: Sequelize.DATE
      },
      doc_num: {
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable("profile_kycs");
  }
};
