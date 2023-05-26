"use strict";
module.exports = (sequelize, DataTypes) => {
  const not_sent_plan_transfer = sequelize.define(
    "not_sent_plan_transfer",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      plan_transfer_id: DataTypes.UUID,
      merchant_id: DataTypes.UUID,
      amount: DataTypes.DECIMAL,
      fees: DataTypes.DECIMAL,
      netto_amount: DataTypes.DECIMAL,
      rate: DataTypes.DECIMAL,
      result_amount: DataTypes.DECIMAL,
      currency: DataTypes.STRING(10),
      result_currency: DataTypes.STRING(10),
      plan_id: DataTypes.UUID,
      ref_id: DataTypes.UUID,
      tariff: DataTypes.UUID,
      variables: DataTypes.JSONB,
      description: DataTypes.TEXT,
      status: DataTypes.INTEGER,
      approver: DataTypes.UUID,
      is_draft: DataTypes.BOOLEAN,
      last_rejection_reason: DataTypes.TEXT,
      additional_order_data: DataTypes.JSONB,
      approve_request: DataTypes.UUID,

      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      signobject: DataTypes.JSONB,
      removed: DataTypes.INTEGER
    },
    { createdAt: "ctime", updatedAt: "mtime", deletedAt: null }
  );
  not_sent_plan_transfer.associate = function(models) {
    // associations can be defined here
  };
  return not_sent_plan_transfer;
};
