"use strict";
module.exports = (sequelize, DataTypes) => {
  const business_type = sequelize.define(
    "business_type",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      type: DataTypes.STRING(50),
      realm: DataTypes.UUID,

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
  business_type.associate = function(models) {
    // associations can be defined here
  };
  return business_type;
};
