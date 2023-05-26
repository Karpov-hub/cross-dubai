"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_trancaction = sequelize.define(
    "vw_trancaction",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      realm_id: DataTypes.UUID,
      user_id: DataTypes.UUID,
      transfer_id: DataTypes.UUID,
      tariff_id: DataTypes.UUID,
      plan_id: DataTypes.UUID,
      held: DataTypes.BOOLEAN,
      canceled: DataTypes.BOOLEAN,
      amount: DataTypes.INTEGER,
      exchange_amount: DataTypes.INTEGER,
      acc_src: DataTypes.STRING,
      acc_dst: DataTypes.STRING,
      currency_src: DataTypes.STRING,
      currency_dst: DataTypes.STRING,
      legalname: DataTypes.STRING,
      src_acc_name: DataTypes.STRING,
      dst_acc_name: DataTypes.STRING,
      merchant_name: DataTypes.STRING,
      ctime: DataTypes.DATE,
      ref_id: DataTypes.UUID,
      description_src: DataTypes.STRING
    },
    {
      createdAt: "ctime",
      updatedAt: false,
      deletedAt: false
    }
  );

  return vw_trancaction;
};
