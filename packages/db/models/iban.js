"use strict";
module.exports = (sequelize, DataTypes) => {
  const iban = sequelize.define(
    "iban",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      bank_id: DataTypes.UUID,
      iban: DataTypes.STRING,
      currency: DataTypes.STRING(3),
      owner: DataTypes.UUID,
      notes: DataTypes.STRING,
      dflt: DataTypes.BOOLEAN,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      maker: DataTypes.UUID,
      active: DataTypes.BOOLEAN,
      file_id: DataTypes.JSON,
      file_name: DataTypes.JSON,
      file_size: DataTypes.JSON,
      receiver_name: DataTypes.STRING,

      name: DataTypes.STRING(50),
      bank_details: DataTypes.STRING
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  iban.associate = function(models) {
    iban.belongsTo(models.bank, {
      foreignKey: "bank_id",
      targetKey: "id"
    });
  };
  return iban;
};
