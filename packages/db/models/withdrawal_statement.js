"use strict";
module.exports = (sequelize, DataTypes) => {
  const withdrawal_statement = sequelize.define(
    "withdrawal_statement",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      code: DataTypes.STRING,
      transfer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "transfer",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      generation_date: DataTypes.DATE
    },
    { createdAt: false, updatedAt: false, deletedAt: false }
  );
  withdrawal_statement.associate = function(models) {
    withdrawal_statement.belongsTo(models.transfer, {
      foreignKey: "transfer_id",
      targetKey: "id"
    });
  };
  return withdrawal_statement;
};
