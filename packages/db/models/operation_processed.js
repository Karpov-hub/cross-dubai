"use strict";
module.exports = (sequelize, DataTypes) => {
  const operation_processed = sequelize.define(
    "operation_processed",
    {
      op_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "operation",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      rec_id: DataTypes.UUID
    },
    {
      paranoid: false,
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  operation_processed.associate = function(models) {
    /*operation_processed.belongsTo(models.operation, {
      foreignKey: "op_id",
      targetKey: "id"
    });
    */
  };

  operation_processed.removeAttribute("id");
  return operation_processed;
};
