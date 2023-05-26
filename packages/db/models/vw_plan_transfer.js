"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_plan_transfer = sequelize.define(
    "vw_plan_transfer",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      realm_id: DataTypes.UUID,
      user_id: DataTypes.UUID,
      event_name: DataTypes.STRING,
      held: DataTypes.BOOLEAN,
      description: DataTypes.STRING,
      notes: DataTypes.STRING,
      data: DataTypes.JSON,
      amount: DataTypes.INTEGER,
      ctime: DataTypes.DATE,
      canceled: DataTypes.BOOLEAN,
      ref_id: DataTypes.STRING,
      order_id: DataTypes.UUID,
      plan_transfer_id: DataTypes.UUID,
      organisation_name: DataTypes.STRING,
      legalname: DataTypes.STRING,
      currency: DataTypes.STRING,
      hash: DataTypes.STRING,
      exchange_price: DataTypes.STRING,
      exchange_quantity: DataTypes.STRING,
      string_status: DataTypes.STRING
    },
    {
      createdAt: "ctime",
      updatedAt: false,
      deletedAt: false
    }
  );
  vw_plan_transfer.associate = function(models) {
    // associations can be defined here
  };
  return vw_plan_transfer;
};
