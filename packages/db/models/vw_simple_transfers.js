"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_simple_transfers = sequelize.define(
    "vw_simple_transfers",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      plan_name: DataTypes.STRING,
      sender_address: DataTypes.STRING,
      sender_id: DataTypes.UUID,
      sender: DataTypes.STRING,
      receiver_address: DataTypes.STRING,
      receiver_id: DataTypes.UUID,
      receiver: DataTypes.STRING,
      amount: DataTypes.FLOAT,
      currency: DataTypes.STRING,
      result_amount: DataTypes.FLOAT,
      result_currency: DataTypes.STRING,
      hash: DataTypes.STRING,
      hash_url: DataTypes.STRING,
      fee: DataTypes.FLOAT,
      fee_currency: DataTypes.STRING,
      status: DataTypes.STRING,
      started: DataTypes.DATE,
      finished: DataTypes.DATE,
      ui_description: DataTypes.STRING,
      admin_description: DataTypes.STRING,
      errors: DataTypes.JSONB
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  vw_simple_transfers.associate = function(models) {
    // associations can be defined here
  };
  return vw_simple_transfers;
};
