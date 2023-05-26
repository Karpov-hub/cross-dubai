"use strict";
module.exports = (sequelize, DataTypes) => {
  const currency_rate = sequelize.define(
    "currency_rate",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        unique: true,
        primaryKey: true
      },
      abbr: DataTypes.STRING(4),
      value: DataTypes.FLOAT,
      stime: DataTypes.DATE
    },
    { createdAt: false, updatedAt: false, deletedAt: false }
  );
  currency_rate.associate = function(models) {
    // associations can be defined here
  };
  return currency_rate;
};
