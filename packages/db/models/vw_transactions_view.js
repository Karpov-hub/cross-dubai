"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_transactions_view = sequelize.define(
    "vw_transactions_view",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      transfer_id: DataTypes.UUID,
      user_id: DataTypes.UUID,
      realm_id: DataTypes.UUID,
      ctime: DataTypes.DATE,
      merchant_name: DataTypes.STRING,
      merchant: DataTypes.UUID,
      description_src: DataTypes.STRING,
      description_dst: DataTypes.STRING,
      data: DataTypes.JSON,
      held: DataTypes.BOOLEAN,
      status: DataTypes.INTEGER,
      amount: DataTypes.FLOAT,
      canceled: DataTypes.BOOLEAN,
      currency_dst: DataTypes.STRING,
      currency_src: DataTypes.STRING,
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  vw_transactions_view.associate = function(models) {
    // associations can be defined here
  };
  return vw_transactions_view;
};
