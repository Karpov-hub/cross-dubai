"use strict";
module.exports = (sequelize, DataTypes) => {
  const transfers_plan = sequelize.define(
    "transfers_plan",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      plan_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "accounts_pan",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      tariff: DataTypes.UUID,
      description: DataTypes.JSONB,
      items: DataTypes.JSON,
      variables: DataTypes.JSON,
      prevdata: DataTypes.JSON,
      step: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );

  transfers_plan.associate = function(models) {
    transfers_plan.belongsTo(models.accounts_plan, {
      foreignKey: "plan_id",
      targetKey: "id"
    });
  };

  return transfers_plan;
};
