"use strict";
module.exports = (sequelize, DataTypes) => {
  const plans_weight = sequelize.define(
    "plans_weight",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      plan_id: {
        type: DataTypes.UUID
      },
      merchant_id: {
        type: DataTypes.UUID
      },
      weight: {
        type: DataTypes.INTEGER
      }
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false
    }
  );

  return plans_weight;
};
