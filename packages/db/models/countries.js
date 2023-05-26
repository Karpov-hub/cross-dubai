"use strict";
module.exports = (sequelize, DataTypes) => {
  const currency = sequelize.define(
    "countries",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: DataTypes.STRING(50),
      code: DataTypes.STRING(10),
      abbr2: DataTypes.STRING(2),
      abbr3: DataTypes.STRING(3),
      permission: DataTypes.INTEGER,
      lang:DataTypes.STRING(20)
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  currency.associate = function(models) {
    // associations can be defined here
  };
  return currency;
};
