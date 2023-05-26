'use strict';
module.exports = (sequelize, DataTypes) => {
  const check = sequelize.define(
    "check",
    {
      id: {
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID
      },
      test_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "tests",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      code: DataTypes.STRING,
      status: DataTypes.INTEGER,
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
      updatedAt: "mtime"
    }
  );
  check.associate = function(models) {
    // associations can be defined here
  };
  return check;
};