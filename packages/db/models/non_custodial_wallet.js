"use strict";
module.exports = (sequelize, DataTypes) => {
  const non_custodial_wallet = sequelize.define(
    "non_custodial_wallet",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      address: DataTypes.STRING(130),
      currency: DataTypes.STRING(4),
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      merchant_id: {
        type: DataTypes.UUID,
        references: {
          model: "merchants",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      memo: DataTypes.STRING,
      last_pk_share_date: {
        type: DataTypes.DATE,
        defaultValue: null
      },
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
  non_custodial_wallet.associate = function(models) {
    // associations can be defined here
  };
  return non_custodial_wallet;
};
