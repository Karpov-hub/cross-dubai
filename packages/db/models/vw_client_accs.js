"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_client_accs = sequelize.define(
    "vw_client_accs",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      acc_no: DataTypes.STRING,
      currency: DataTypes.STRING(10),
      owner: DataTypes.UUID,
      balance: DataTypes.FLOAT,
      active: DataTypes.BOOLEAN,
      status: DataTypes.INTEGER,
      merchant_name: DataTypes.STRING,
      merchant_id: DataTypes.STRING,
      crypto_address: DataTypes.STRING,
      wallet_type: DataTypes.INTEGER,
      owner_is_inner_client: DataTypes.BOOLEAN
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  vw_client_accs.associate = function(models) {
    // associations can be defined here
  };
  return vw_client_accs;
};
