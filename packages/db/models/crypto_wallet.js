"use strict";
module.exports = (sequelize, DataTypes) => {
  const crypto_wallet = sequelize.define(
    "crypto_wallet",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      status: DataTypes.INTEGER,
      name: DataTypes.STRING(50),
      num: DataTypes.STRING(30),
      curr_name: DataTypes.STRING(4),
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "user",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      send_via_chain_required: DataTypes.BOOLEAN
    },
    { createdAt: "ctime", updatedAt: "mtime", deletedAt: null }
  );
  crypto_wallet.associate = function(models) {
    // associations can be defined here
  };
  return crypto_wallet;
};
