const db = require("../models");
const project = db.Project;
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");

const projectSchema = Joi.object({
  nama_pemilik: Joi.string().required().messages({
    "string.empty": "nama_pemilik tidak boleh kosong",
  }),

  lokasi: Joi.string().required().messages({
    "string.empty": "lokasi tidak boleh kosong",
  }),

  deskripsi: Joi.date().required().messages({
    "string.empty": "deskripsi tidak boleh kosong",
  }),
});

const updateProjectSchema = Joi.object({
  nama_pemilik: Joi.string().optional(),
  lokasi: Joi.string().optional(),
  deskripsi: Joi.string().optional(),
});

const idSchema = Joi.object({
  id_project: Joi.number().integer().required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    nama_pemilik: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const querySchemaUniqe = Joi.object({
  field: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9,_]+$")),
});

const querySchemaCount = Joi.object({
  field: Joi.object()
    .pattern(
      Joi.string(), // Kunci harus berupa string
      Joi.alternatives().try(
        Joi.number().integer(),
        Joi.string().trim(), // Nilai bisa berupa string
        Joi.array().items(Joi.string().trim()) // Atau array dari string
      )
    )
    .required(), // Field ini wajib ada
});

const post_project = async (req, res) => {
  try {
    upload.single("foto")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          data: null,
        });
      }

      const { error, value } = projectSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
          data: null,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Foto harus diunggah!",
          data: null,
        });
      }

      const { nama_pemilik, lokasi, deskripsi } = value;

      const create_project = await tim.create({
        nama_pemilik: nama_pemilik,
        lokasi: lokasi,
        deskripsi: deskripsi,
        foto: req.file.filename, // Simpan nama_pemilik file
      });

      res.status(200).json({
        success: true,
        message: "Berhasil menambahkan data tim",
        data: {
          nama_pemilik: create_project.nama_pemilik,
          lokasi: create_project.lokasi,
          deskripsi: create_project.deskripsi,
          foto: create_project.foto,
        },
      });
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const put_project = async (req, res) => {
  try {
    const id_project = req.params.id_project;
    const { error, value } = updateProjectSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // const existingJob =
    //   value.nama_pemilik || value.lokasi
    //     ? await testimoni.findOne({
    //         where: {
    //           [Op.and]: [
    //             {
    //               [Op.or]: [
    //                 ...(value.nama_pemilik
    //                   ? [{ nama_pemilik: value.nama_pemilik }]
    //                   : []),
    //                 ...(value.lokasi ? [{ lokasi: value.lokasi }] : []),
    //               ],
    //             },
    //           ],
    //         },
    //       })
    //     : null;

    // if (existingJob) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "lokasi sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const update_project = await project.findOne({
      where: { id_project },
    });

    if (!update_project) {
      return res.status(404).json({
        success: false,
        message: "project tidak ditemukan",
        data: null,
      });
    }

    // Jika file foto baru diunggah, tambahkan logika untuk menghapus foto lama
    if (req.file) {
      const oldPhotoPath = `uploads/img/${update_tim.foto}`;

      // Hapus foto lama jika ada
      if (update_tim.foto && fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }

      // Simpan nama file baru
      value.foto = req.file.filename;
    }

    await update_project.update({
      nama_pemilik: value.nama_pemilik || update_project.nama_pemilik,
      lokasi: value.lokasi || update_project.lokasi,
      deskripsi: value.deskripsi || update_project.deskripsi,
      foto: value.foto || update_project.foto,
      updateAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        nama_pemilik: update_project.nama_pemilik,
        lokasi: update_project.lokasi,
        deskripsi: update_project.deskripsi,
        foto: update_project.foto,
        createdAt: update_project.createdAt,
        updateAt: update_project.updateAt,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const delete_project = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_project } = value;

    const delete_project = await project.findOne({
      where: { id_project },
    });

    if (!delete_project) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data project",
        data: null,
      });
    }

    // Hapus file foto jika ada
    const photoPath = `uploads/img/${delete_project.foto}`;
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath); // Hapus foto
    }

    await project.destroy({
      where: { id_project },
    });

    //   await tbl_media.update(
    //     { media_delete_at: new Date() },
    //     { where: { media_uuid_table: id_project, media_table: "testimoni" } }
    //   );

    res.json({
      success: true,
      message: "Sukses menghapus data project",
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_detail_project = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_project } = value;

    const detail_project = await project.findOne({
      where: {
        id_project,
      },
    });

    if (!detail_project) {
      return res.status(404).json({
        success: false,
        message: "Gagal Mendapatkan Data",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Berhasil Mendapatkan Data",
      data: {
        nama_pemilik: detail_project.nama_pemilik,
        lokasi: detail_project.lokasi,
        deskripsi: detail_project.deskripsi,
        foto: detail_project.foto,
      },
    };

    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_all_project = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { id_project: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {};

    if (filter.nama_pemilik) {
      const filterNames = Array.isArray(filter.nama_pemilik)
        ? filter.nama_pemilik
        : filter.nama_pemilik.split(",");

      if (filterNames.length > 0) {
        whereClause.nama_pemilik = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.user_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
      offset = 0;

      whereClause.nama_pemilik = whereClause.nama_pemilik
        ? { [Sequelize.Op.and]: [whereClause.nama_pemilik, keywordClause] }
        : keywordClause;
    }

    const data = await project.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((project) => ({
        nama_pemilik: project.nama_pemilik,
        lokasi: project.lokasi,
        deskripsi: project.deskripsi,
        foto: project.foto,
      })),
      pages: {
        total: data.count,
        per_page: limit || data.count,
        next_page: limit && page ? (page < totalPages ? page + 1 : null) : null,
        to: limit ? offset + data.rows.length : data.count,
        last_page: totalPages,
        current_page: page || 1,
        from: offset,
      },
    };

    if (data.count === 0) {
      return res.status(200).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
        pages: {
          total: 0,
          per_page: limit || 0,
          next_page: null,
          to: 0,
          last_page: 0,
          current_page: page || 1,
          from: 0,
        },
      });
    }

    const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const excludePagesUrl = "http://localhost:5000/api/v6/testimoni/get_all";

    if (currentUrl === excludePagesUrl) {
      delete result.pages;
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

module.exports = {
  post_project,
  put_project,
  delete_project,
  get_all_project,
  get_detail_project,
};
