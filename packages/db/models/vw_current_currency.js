"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_current_currency = sequelize.define(
    "vw_current_currency",
    {
      k: DataTypes.FLOAT,
      abbr: DataTypes.STRING(3)
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  vw_current_currency.associate = function(models) {
    // associations can be defined here
  };
  return vw_current_currency;
};
