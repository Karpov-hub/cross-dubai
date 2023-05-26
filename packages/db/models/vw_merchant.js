"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_merchants = sequelize.define(
    "vw_merchants",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      name: DataTypes.STRING,
      website: DataTypes.STRING,
      description: DataTypes.STRING,
      categories: DataTypes.STRING,
      user_id: DataTypes.UUID,
      token: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      acc_no: DataTypes.JSON,
      acc_currency: DataTypes.JSON,
      callback_url: DataTypes.STRING,
      //callback: DataTypes.STRING,
      callback_error: DataTypes.STRING,
      secret: DataTypes.STRING,
      crypto: DataTypes.JSON,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  vw_merchants.associate = function(models) {
    // associations can be defined here
  };
  return vw_merchants;
};
