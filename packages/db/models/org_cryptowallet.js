"use strict";
module.exports = (sequelize, DataTypes) => {
  const org_cryptowallet = sequelize.define(
    "org_cryptowallet",
    {
      org_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "merchant",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      wallet_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "crypto_wallet",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      ctime: DataTypes.DATE
    },
    { createdAt: "ctime", updatedAt: false, deletedAt: false }
  );
  org_cryptowallet.removeAttribute('id');
  org_cryptowallet.associate = function(models) {
    org_cryptowallet.belongsTo(models.crypto_wallet, {
      foreignKey: "wallet_id",
      targetKey: "id"
    });
  };
  return org_cryptowallet;
};
