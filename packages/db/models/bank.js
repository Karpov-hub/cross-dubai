"use strict";
module.exports = (sequelize, DataTypes) => {
  const bank = sequelize.define(
    "bank",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      name: DataTypes.STRING,
      shortname: DataTypes.STRING,
      country: DataTypes.STRING,
      swift: DataTypes.STRING,
      notes: DataTypes.STRING,
      corr_bank: DataTypes.STRING,
      corr_swift: DataTypes.STRING,
      corr_acc: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      zip_addr1: DataTypes.STRING,
      city_addr1: DataTypes.STRING,
      street_addr1: DataTypes.STRING,
      house_addr1: DataTypes.STRING,
      apartment_addr1: DataTypes.STRING,
      zip_addr2: DataTypes.STRING,
      city_addr2: DataTypes.STRING,
      street_addr2: DataTypes.STRING,
      house_addr2: DataTypes.STRING,
      apartment_addr2: DataTypes.STRING,
      code: DataTypes.STRING,
      phone: DataTypes.STRING(20),
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  return bank;
};
