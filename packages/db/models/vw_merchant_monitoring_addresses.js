"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_merchant_monitoring_addresses = sequelize.define(
    "vw_merchant_monitoring_addresses",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      name: DataTypes.STRING,
      ctime: DataTypes.DATE,
      active: DataTypes.BOOLEAN,
      user_id: DataTypes.UUID,
      monitoring_crypto_address: DataTypes.STRING,
      wallet_currency: DataTypes.STRING,
      removed: DataTypes.INTEGER
    },
    {
      createdAt: "ctime",
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  vw_merchant_monitoring_addresses.associate = function(models) {
    // associations can be defined here
  };
  return vw_merchant_monitoring_addresses;
};
