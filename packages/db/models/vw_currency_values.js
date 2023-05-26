"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_currency_values = sequelize.define(
    "vw_currency_values",
    {
      abbr: DataTypes.STRING(3),
      realm: DataTypes.UUID,
      amount: DataTypes.FLOAT,
      value: DataTypes.FLOAT,
      crypto: DataTypes.BOOLEAN,
      decimal: DataTypes.INTEGER
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  vw_currency_values.associate = function(models) {
    // associations can be defined here
  };
  return vw_currency_values;
};
