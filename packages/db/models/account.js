"use strict";
module.exports = (sequelize, DataTypes) => {
  const account = sequelize.define(
    "account",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      acc_no: DataTypes.STRING,
      easy_acc_name: DataTypes.STRING,
      acc_description: DataTypes.STRING,
      acc_name: DataTypes.STRING,
      currency: DataTypes.STRING(3),
      owner: DataTypes.UUID,
      overdraft: DataTypes.FLOAT,
      balance: DataTypes.FLOAT,
      status: DataTypes.INTEGER,
      negative: DataTypes.BOOLEAN,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
      },

      stime: DataTypes.BIGINT,
      ltime: DataTypes.BIGINT,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID
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
              result[i].balance = parseFloat(result[i].balance);
            }
          } else {
            result.balance = parseFloat(result.balance);
          }
          return result;
        },
        afterCreate: (result) => {
          result.balance = parseFloat(result.balance);
          return result;
        }
      }
    }
  );
  account.associate = function(models) {
    account.belongsTo(models.user, {
      foreignKey: "owner",
      targetKey: "id"
    });
    account.belongsTo(models.currency, {
      foreignKey: "currency",
      as: "Currency",
      targetKey: "abbr"
    });
  };
  return account;
};
