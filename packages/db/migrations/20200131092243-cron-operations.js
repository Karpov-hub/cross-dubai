"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .transaction(t => {
        return Promise.all([
          queryInterface.createTable(
            "operations",
            {
              id: {
                allowNull: false,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                type: Sequelize.UUID
              },
              name: {
                allowNull: false,
                type: Sequelize.STRING(50)
              },
              ctime: {
                allowNull: false,
                type: Sequelize.DATE
              }
            },
            {
              transaction: t
            }
          ),
          queryInterface.createTable(
            "operation_processed",
            {
              op_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                  model: "operations",
                  key: "id"
                },
                onUpdate: "cascade",
                onDelete: "cascade"
              },
              rec_id: Sequelize.UUID
            },
            {
              transaction: t
            }
          )
        ]);
      })
      .then(() => {
        queryInterface.sequelize.query(
          `CREATE INDEX idx_operation_processed on operation_processed ("op_id", "rec_id")`
        );
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable("operations", { transaction: t }),
        queryInterface.dropTable("operation_processed", { transaction: t })
      ]);
    });
  }
};
