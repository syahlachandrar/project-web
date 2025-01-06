"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Testimoni extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Testimoni.init(
    {
      id_testimoni: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      nama: DataTypes.STRING,
      kategori: DataTypes.STRING,
      testimoni: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Testimoni",
      tableName: "Testimoni",
      timestamps: true, // Aktifkan timestamps untuk createdAt dan updatedAt
      paranoid: false, // Mengaktifkan soft delete
    }
  );
  return Testimoni;
};
