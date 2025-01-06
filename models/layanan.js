"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Layanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Layanan.init(
    {
      id_layanan: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      kategori_layanan: DataTypes.STRING,
      harga: DataTypes.DOUBLE,
      nama_layanan: DataTypes.STRING,
      spesifikasi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Layanan",
      tableName: "Layanan",
      timestamps: true, // Aktifkan timestamps untuk createdAt dan updatedAt
      paranoid: false, // Mengaktifkan soft delete
    }
  );
  return Layanan;
};
