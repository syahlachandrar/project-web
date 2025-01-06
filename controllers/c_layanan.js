const db = require("../models");
const layanan = db.Layanan;
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");

const layananSchema = Joi.object({
  kategori_layanan: Joi.string().required().messages({
    "string.empty": "kategori_layanan tidak boleh kosong",
  }),

  harga: Joi.number().required().messages({
    "string.empty": "harga tidak boleh kosong",
  }),

  nama_layanan: Joi.date().required().messages({
    "string.empty": "nama_layanan tidak boleh kosong",
  }),

  spesifikiasi: Joi.string().required().messages({
    "string.empty": "spesifikiasi tidak boleh kosong",
  }),
});

const updateLayananSchema = Joi.object({
  kategori_layanan: Joi.string().optional(),
  harga: Joi.number().optional(),
  nama_layanan: Joi.string().optional(),
  spesifikiasi: Joi.string().optional(),
});

const idSchema = Joi.object({
  id_layanan: Joi.number().integer().required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    nama_layanan: Joi.alternatives()
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
const post_layanan = async (req, res) => {
  try {
    const { error, value } = layananSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      kategori_layanan,
      harga,
      nama_layanan,
      spesifikiasi,
    } = value;

    // Cek apakah harga sudah ada di database
    // const existingJob = await testimoni.findOne({
    //   where: {
    //     [Op.or]: [{ harga: harga }, { kategori_layanan: kategori_layanan }],
    //   },
    // });

    // // Jika harga sudah ada, kirim respons error
    // if (existingJob) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "harga sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const create_layanan = await layanan.create({
      kategori_layanan: kategori_layanan,
      harga: harga,
      nama_layanan: nama_layanan,
      spesifikiasi: spesifikiasi,
    });

    if (!create_layanan) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data layanan",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data layanan",
      data: {
        kategori_layanan: create_layanan.kategori_layanan,
        harga: create_layanan.harga,
        nama_layanan: create_layanan.nama_layanan,
        spesifikiasi: create_layanan.spesifikiasi,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_layanan = async (req, res) => {
  try {
    const id_layanan = req.params.id_layanan;
    const { error, value } = updateLayananSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // const existingJob =
    //   value.kategori_layanan || value.harga
    //     ? await testimoni.findOne({
    //         where: {
    //           [Op.and]: [
    //             {
    //               [Op.or]: [
    //                 ...(value.kategori_layanan
    //                   ? [{ kategori_layanan: value.kategori_layanan }]
    //                   : []),
    //                 ...(value.harga ? [{ harga: value.harga }] : []),
    //               ],
    //             },
    //           ],
    //         },
    //       })
    //     : null;

    // if (existingJob) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "harga sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const update_layanan = await layanan.findOne({
      where: { id_layanan },
    });

    if (!update_layanan) {
      return res.status(404).json({
        success: false,
        message: "Layanan tidak ditemukan",
        data: null,
      });
    }

    await update_layanan.update({
      kategori_layanan: value.kategori_layanan || update_layanan.kategori_layanan,
      harga: value.harga || update_layanan.harga,
      nama_layanan: value.nama_layanan || update_layanan.nama_layanan,
      spesifikiasi: value.spesifikiasi || update_layanan.spesifikiasi,
      updateAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        kategori_layanan: update_layanan.kategori_layanan,
        harga: update_layanan.harga,
        nama_layanan: update_layanan.nama_layanan,
        spesifikiasi: update_layanan.spesifikiasi,
        createdAt: update_layanan.createdAt,
        updateAt: update_layanan.updateAt,
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

const delete_layanan = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_layanan } = value;

    const delete_layanan = await layanan.findOne({
      where: { id_layanan },
    });

    if (!delete_layanan) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data layanan",
        data: null,
      });
    }

    // Menghapus testimoni secara permanen
    await layanan.destroy({
      where: { id_layanan },
    });

    //   await tbl_media.update(
    //     { media_delete_at: new Date() },
    //     { where: { media_uuid_table: id_layanan, media_table: "testimoni" } }
    //   );

    res.json({
      success: true,
      message: "Sukses menghapus data layanan",
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

const get_detail_layanan = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_layanan } = value;

    const detail_layanan = await layanan.findOne({
      where: {
        id_layanan,
      },
    });

    if (!detail_layanan) {
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
        kategori_layanan: detail_layanan.kategori_layanan,
        harga: detail_layanan.harga,
        nama_layanan: detail_layanan.nama_layanan,
        spesifikiasi: detail_layanan.spesifikiasi,
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

const get_all_layanan = async (req, res) => {
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
      order = { id_layanan: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {};

    if (filter.nama_layanan) {
      const filterNames = Array.isArray(filter.nama_layanan)
        ? filter.nama_layanan
        : filter.nama_layanan.split(",");

      if (filterNames.length > 0) {
        whereClause.nama_layanan = {
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

      whereClause.nama_layanan = whereClause.nama_layanan
        ? { [Sequelize.Op.and]: [whereClause.nama_layanan, keywordClause] }
        : keywordClause;
    }

    const data = await layanan.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((layanan) => ({
        kategori_layanan: layanan.kategori_layanan,
        harga: layanan.harga,
        nama_layanan: layanan.nama_layanan,
        spesifikiasi: layanan.spesifikiasi,
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
  post_layanan,
  put_layanan,
  delete_layanan,
  get_all_layanan,
  get_detail_layanan,
};
