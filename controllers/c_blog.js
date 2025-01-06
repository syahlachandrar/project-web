const db = require("../models");
const blog = db.Blog;
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");

const blogSchema = Joi.object({
  deskripsi: Joi.string().required().messages({
    "string.empty": "deskripsi tidak boleh kosong",
  }),

  judul: Joi.string().required().messages({
    "string.empty": "judul tidak boleh kosong",
  }),

  tanggal: Joi.date().required().messages({
    "string.empty": "tanggal tidak boleh kosong",
  }),
});

const updateBlogSchema = Joi.object({
  deskripsi: Joi.string().optional(),
  judul: Joi.string().optional(),
  tanggal: Joi.string().optional(),
});

const idSchema = Joi.object({
  id_blog: Joi.number().integer().required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    deskripsi: Joi.alternatives()
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
const post_blog = async (req, res) => {
  try {
    const { error, value } = blogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      deskripsi,
      judul,
      tanggal,
    } = value;

    // Cek apakah judul sudah ada di database
    // const existingJob = await testimoni.findOne({
    //   where: {
    //     [Op.or]: [{ judul: judul }, { deskripsi: deskripsi }],
    //   },
    // });

    // // Jika judul sudah ada, kirim respons error
    // if (existingJob) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "judul sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const create_blog = await blog.create({
      deskripsi: deskripsi,
      judul: judul,
      tanggal: tanggal,
    });

    if (!create_blog) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data blog",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data blog",
      data: {
        deskripsi: create_blog.deskripsi,
        judul: create_blog.judul,
        tanggal: create_blog.tanggal,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_blog = async (req, res) => {
  try {
    const id_blog = req.params.id_blog;
    const { error, value } = updateBlogSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // const existingJob =
    //   value.deskripsi || value.judul
    //     ? await testimoni.findOne({
    //         where: {
    //           [Op.and]: [
    //             {
    //               [Op.or]: [
    //                 ...(value.deskripsi
    //                   ? [{ deskripsi: value.deskripsi }]
    //                   : []),
    //                 ...(value.judul ? [{ judul: value.judul }] : []),
    //               ],
    //             },
    //           ],
    //         },
    //       })
    //     : null;

    // if (existingJob) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "judul sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const update_blog = await blog.findOne({
      where: { id_blog },
    });

    if (!update_blog) {
      return res.status(404).json({
        success: false,
        message: "Blog tidak ditemukan",
        data: null,
      });
    }

    await update_blog.update({
      deskripsi: value.deskripsi || update_blog.deskripsi,
      judul: value.judul || update_blog.judul,
      tanggal: value.tanggal || update_blog.tanggal,
      updateAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        deskripsi: update_blog.deskripsi,
        judul: update_blog.judul,
        tanggal: update_blog.tanggal,
        createdAt: update_blog.createdAt,
        updateAt: update_blog.updateAt,
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

const delete_blog = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_blog } = value;

    const delete_blog = await blog.findOne({
      where: { id_blog },
    });

    if (!delete_blog) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data blog",
        data: null,
      });
    }

    // Menghapus testimoni secara permanen
    await blog.destroy({
      where: { id_blog },
    });

    //   await tbl_media.update(
    //     { media_delete_at: new Date() },
    //     { where: { media_uuid_table: id_blog, media_table: "testimoni" } }
    //   );

    res.json({
      success: true,
      message: "Sukses menghapus data blog",
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

const get_detail_blog = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_blog } = value;

    const detail_blog = await blog.findOne({
      where: {
        id_blog,
      },
    });

    if (!detail_blog) {
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
        deskripsi: detail_blog.deskripsi,
        judul: detail_blog.judul,
        tanggal: detail_blog.tanggal,
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

const get_all_blog = async (req, res) => {
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
      order = { id_blog: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {};

    if (filter.deskripsi) {
      const filterNames = Array.isArray(filter.deskripsi)
        ? filter.deskripsi
        : filter.deskripsi.split(",");

      if (filterNames.length > 0) {
        whereClause.deskripsi = {
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

      whereClause.deskripsi = whereClause.deskripsi
        ? { [Sequelize.Op.and]: [whereClause.deskripsi, keywordClause] }
        : keywordClause;
    }

    const data = await blog.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((blog) => ({
        deskripsi: blog.deskripsi,
        judul: blog.judul,
        tanggal: blog.tanggal,
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
  post_blog,
  put_blog,
  delete_blog,
  get_all_blog,
  get_detail_blog,
};
