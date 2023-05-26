"use strict";
module.exports = (sequelize, DataTypes) => {
  const currency_values = sequelize.define(
    "currency_values",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      pid: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "currency_history",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      amount: DataTypes.FLOAT,
      value: DataTypes.FLOAT,
      abbr: DataTypes.STRING(4)
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  currency_values.associate = function(models) {
    // associations can be defined here
  };
  return currency_values;
};
