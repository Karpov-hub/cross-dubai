"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_transfer_transaction = sequelize.define(
    "vw_transfer_transaction",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      ref_id: DataTypes.STRING(50),

      held: DataTypes.BOOLEAN,
      canceled: DataTypes.BOOLEAN,
      data: DataTypes.JSON,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      acc_src: DataTypes.ARRAY(DataTypes.STRING),
      acc_dst: DataTypes.ARRAY(DataTypes.STRING),
      amount: DataTypes.ARRAY(DataTypes.FLOAT),
      exchange_amount: DataTypes.ARRAY(DataTypes.FLOAT),
      currency_src: DataTypes.ARRAY(DataTypes.STRING),
      currency_dst: DataTypes.ARRAY(DataTypes.STRING),
      status: DataTypes.INTEGER
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false,
      hooks: {
        afterFind: function(result) {
          if (!result) return result;
          if (result.constructor === Array) {
            for (var i = 0; i < result.length; i++) {
              result[i].amount = parseFloat(result[i].amount);
              result[i].exchange_amount = parseFloat(result[i].exchange_amount);
            }
          } else {
            result.amount = parseFloat(result.amount);
            result.exchange_amount = parseFloat(result.exchange_amount);
          }
          return result;
        }
      }
    }
  );

  vw_transfer_transaction.associate = function(models) {
    vw_transfer_transaction.belongsTo(models.transaction, {
      foreignKey: "id",
      targetKey: "transfer_id"
    });
  };

  return vw_transfer_transaction;
};
