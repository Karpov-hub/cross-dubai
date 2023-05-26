"use strict";
module.exports = (sequelize, DataTypes) => {
  const merchant = sequelize.define(
    "merchant",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      acc1: DataTypes.UUID,
      acc2: DataTypes.UUID,
      name: DataTypes.STRING,
      website: DataTypes.STRING(255),
      description: DataTypes.STRING(255),
      categories: DataTypes.STRING(255),
      user_id: DataTypes.UUID,
      token: DataTypes.STRING(255),
      callback: DataTypes.STRING(255),
      callback_error: DataTypes.STRING(255),
      secret: DataTypes.STRING(255),
      tariff: DataTypes.UUID,
      variables: DataTypes.JSON,
      id_template: DataTypes.UUID,
      payment_details: DataTypes.STRING,
      country: DataTypes.STRING(3),
      vat: DataTypes.STRING(20),
      email: DataTypes.STRING(50),
      phone: DataTypes.STRING(15),
      active: DataTypes.BOOLEAN,
      address: DataTypes.STRING(100),
      registration: DataTypes.TEXT,
      other_websites: DataTypes.TEXT,
      zip: DataTypes.STRING,
      city: DataTypes.STRING,
      street: DataTypes.STRING,
      house: DataTypes.STRING,
      additional_info: DataTypes.STRING,
      tax_number: DataTypes.STRING(30),
      client_number: DataTypes.STRING(8),
      short_address: DataTypes.STRING,
      city_district: DataTypes.STRING,
      region: DataTypes.STRING,
      registration_info: DataTypes.STRING,

      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      signobject: DataTypes.JSON,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  merchant.associate = function(models) {
    merchant.belongsTo(models.account, {
      foreignKey: "id",
      targetKey: "owner"
    });
    merchant.belongsTo(models.merchant_account, {
      foreignKey: "id",
      targetKey: "id_merchant"
    });
  };
  return merchant;
};
