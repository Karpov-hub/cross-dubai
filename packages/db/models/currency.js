"use strict";
module.exports = (sequelize, DataTypes) => {
  const currency = sequelize.define(
    "currency",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      code: DataTypes.INTEGER,
      name: DataTypes.STRING(50),
      abbr: DataTypes.STRING(4),
      crypto: DataTypes.BOOLEAN,
      api: DataTypes.STRING(255),
      apitoken: DataTypes.STRING(255),
      decimal: DataTypes.INTEGER,
      provider_address: DataTypes.STRING(255),
      explorer_url: DataTypes.STRING,
      ui_decimal: DataTypes.INTEGER,
      ap_active: DataTypes.BOOLEAN,
      ui_active: DataTypes.BOOLEAN
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
