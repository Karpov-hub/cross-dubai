"use strict";
module.exports = (sequelize, DataTypes) => {
  const invoice = sequelize.define(
    "invoice",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      invoice: DataTypes.JSON,
      realm_department: DataTypes.UUID,
      merchant: DataTypes.UUID,

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
  invoice.associate = function(models) {
    // associations can be defined here
  };
  return invoice;
};
