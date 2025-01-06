"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Appointment.init(
    {
      id_appointment: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      nama_klien: DataTypes.STRING,
      jasa: DataTypes.STRING,
      email_klien: DataTypes.STRING,
      no_tlpn_klien: DataTypes.STRING,
      pesan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Appointment",
      tableName: "Appointment",
      timestamps: true, // Aktifkan timestamps untuk createdAt dan updatedAt
      paranoid: false, // Mengaktifkan soft delete
    }
  );
  return Appointment;
};
