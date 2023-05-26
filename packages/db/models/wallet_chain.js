"use strict";
module.exports = (sequelize, DataTypes) => {
  const wallet_chain = sequelize.define(
    "wallet_chain",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      wallet_sender: DataTypes.STRING(130),
      wallet_receiver: DataTypes.STRING(130),
      merchant_id: DataTypes.UUID,
      first_payment_date: DataTypes.DATE,
      lifespan: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
      wallets: DataTypes.JSONB,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE
    },
    { createdAt: "ctime", updatedAt: "mtime", deletedAt: null }
  );
  wallet_chain.associate = function(models) {
    // associations can be defined here
  };

  wallet_chain.STATUSES = {
    ACTIVE: 0,
    DEACTIVATED: 1
  };

  return wallet_chain;
};
