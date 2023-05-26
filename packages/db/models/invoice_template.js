"use strict";
module.exports = (sequelize, DataTypes) => {
  const invoice_template = sequelize.define(
    "invoice_template",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      name: DataTypes.STRING,
      html: DataTypes.TEXT,
      def: DataTypes.BOOLEAN,
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
  invoice_template.associate = function(models) {
    // associations can be defined here
  };
  return invoice_template;
};
