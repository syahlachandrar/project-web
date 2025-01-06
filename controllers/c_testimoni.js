const db = require("../models");
const testimoni = db.Testimoni;
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");

const testimoniSchema = Joi.object({
  nama: Joi.string().required().messages({
    "string.empty": "testimoni requirement tidak boleh kosong",
  }),

  kategori: Joi.string().required().messages({
    "string.empty": "kategori tidak boleh kosong",
  }),

  testimoni: Joi.string().min(8).required().messages({
    "string.empty": "testimoni deskripsi tidak boleh kosong",
  }),
});

const updateTestimoniSchema = Joi.object({
  nama: Joi.string().optional(),
  kategori: Joi.string().optional(),
  testimoni: Joi.string().optional(),
});

const idSchema = Joi.object({
  id_testimoni: Joi.number().integer().required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    nama: Joi.alternatives()
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
const post_testimoni = async (req, res) => {
  try {
    const { error, value } = testimoniSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      nama,
      kategori,
      testimoni
    } = value;

    // Cek apakah kategori sudah ada di database
    // const existingJob = await testimoni.findOne({
    //   where: {
    //     [Op.or]: [{ kategori: kategori }, { nama: nama }],
    //   },
    // });

    // // Jika kategori sudah ada, kirim respons error
    // if (existingJob) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "kategori sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const create_testimoni = await testimoni.create({
      nama: nama,
      kategori: kategori,
      testimoni: testimoni,
    });

    if (!create_testimoni) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data testimoni",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data testimoni",
      data: {
        nama: create_testimoni.nama,
        kategori: create_testimoni.kategori,
        testimoni: create_testimoni.testimoni,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_testimoni = async (req, res) => {
  try {
    const id_testimoni = req.params.id_testimoni;
    const { error, value } = updateTestimoniSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // const existingJob =
    //   value.nama || value.kategori
    //     ? await testimoni.findOne({
    //         where: {
    //           [Op.and]: [
    //             {
    //               [Op.or]: [
    //                 ...(value.nama
    //                   ? [{ nama: value.nama }]
    //                   : []),
    //                 ...(value.kategori ? [{ kategori: value.kategori }] : []),
    //               ],
    //             },
    //           ],
    //         },
    //       })
    //     : null;

    // if (existingJob) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "kategori sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const update_testimoni = await testimoni.findOne({
      where: { id_testimoni },
    });

    if (!update_testimoni) {
      return res.status(404).json({
        success: false,
        message: "Testimoni tidak ditemukan",
        data: null,
      });
    }

    await update_testimoni.update({
      nama: value.nama || update_testimoni.nama,
      kategori: value.kategori || update_testimoni.kategori,
      testimoni: value.testimoni || update_testimoni.testimoni,
      updateAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        nama: update_testimoni.nama,
        testimoni: update_testimoni.testimoni,
        kategori: update_testimoni.kategori,
        createdAt: update_testimoni.createdAt,
        updateAt: update_testimoni.updateAt,
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

const delete_testimoni = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_testimoni } = value;

    const delete_testimoni = await testimoni.findOne({
      where: { id_testimoni },
    });

    if (!delete_testimoni) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data testimoni",
        data: null,
      });
    }

    // Menghapus testimoni secara permanen
    await testimoni.destroy({
      where: { id_testimoni },
    });

    //   await tbl_media.update(
    //     { media_delete_at: new Date() },
    //     { where: { media_uuid_table: id_testimoni, media_table: "testimoni" } }
    //   );

    res.json({
      success: true,
      message: "Sukses menghapus data testimoni",
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

const get_detail_testimoni = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_testimoni } = value;

    const detail_testimoni = await testimoni.findOne({
      where: {
        id_testimoni,
      },
    });

    if (!detail_testimoni) {
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
        nama: detail_testimoni.nama,
        kategori: detail_testimoni.kategori,
        testimoni: detail_testimoni.testimoni,
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

const get_all_testimoni = async (req, res) => {
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
      order = { id_testimoni: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {};

    if (filter.nama) {
      const filterNames = Array.isArray(filter.nama)
        ? filter.nama
        : filter.nama.split(",");

      if (filterNames.length > 0) {
        whereClause.nama = {
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

      whereClause.nama = whereClause.nama
        ? { [Sequelize.Op.and]: [whereClause.nama, keywordClause] }
        : keywordClause;
    }

    const data = await testimoni.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((testimoni) => ({
        nama: testimoni.nama,
        kategori: testimoni.kategori,
        testimoni: testimoni.testimoni,
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
  post_testimoni,
  put_testimoni,
  delete_testimoni,
  get_all_testimoni,
  get_detail_testimoni,
};
