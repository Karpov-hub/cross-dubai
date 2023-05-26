"use strict";
module.exports = (sequelize, DataTypes) => {
  const file = sequelize.define(
    "file",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      code: {
        type: DataTypes.UUID
      },
      name: {
        type: DataTypes.STRING
      },
      type: {
        type: DataTypes.STRING
      },
      invoice_id: {
        type: DataTypes.UUID
      },
      cancelled: {
        type: DataTypes.INTEGER
      },
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      owner_id: DataTypes.UUID
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  file.associate = function(models) {
    // associations can be defined here
  };
  return file;
};
