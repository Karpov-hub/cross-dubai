"use strict";
module.exports = (sequelize, DataTypes) => {
  const doc_types = sequelize.define(
    "doc_types",
    {
      id: {
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID
      },
      name: DataTypes.STRING,
      maker: DataTypes.UUID,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      signobject: DataTypes.JSON,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  doc_types.associate = function(models) {
    // associations can be defined here
  };
  return doc_types;
};
