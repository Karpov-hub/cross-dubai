"use strict";
module.exports = (sequelize, DataTypes) => {
  const user_documents = sequelize.define(
    "user_documents",
    {
      id: {
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID
      },
      user_id: DataTypes.UUID,
      name: DataTypes.STRING,
      doc_code: DataTypes.UUID,
      type: DataTypes.STRING,
      status: DataTypes.INTEGER,
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
  user_documents.associate = function(models) {
    // associations can be defined here
  };
  return user_documents;
};
