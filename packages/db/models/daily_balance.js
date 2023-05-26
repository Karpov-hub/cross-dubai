"use strict";
module.exports = (sequelize, DataTypes) => {
  const daily_balance = sequelize.define(
    "daily_balance",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      sk_balances: DataTypes.JSON,
      nil_balances: DataTypes.JSON,
      deposits_on_hold: DataTypes.JSON,
      ready_to_payout: DataTypes.JSON,
      doh_totals: DataTypes.JSON,
      rtp_totals: DataTypes.JSON,

      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      signobject: DataTypes.JSON,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  daily_balance.associate = function(models) {
    // associations can be defined here
  };
  return daily_balance;
};
