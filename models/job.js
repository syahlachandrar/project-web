"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Job.init(
    {
      id_job: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      job_requirement: DataTypes.STRING,
      posisi: DataTypes.STRING,
      job_deskripsi: DataTypes.STRING,
      salary: DataTypes.DOUBLE,
      job_type: DataTypes.STRING,
      lokasi_penempatan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Job",
      tableName: "Job",
      timestamps: true, // Aktifkan timestamps untuk createdAt dan updatedAt
      paranoid: false, // Mengaktifkan soft delete
    }
  );
  return Job;
};
