const db = require("../models");
const job = db.Job;
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");

const jobSchema = Joi.object({
  job_requirement: Joi.string()
    .required()
    .messages({ "string.empty": "job requirement tidak boleh kosong" }),
  posisi: Joi.string().required().messages({
    "string.empty": "posisi tidak boleh kosong",
  }),

  job_deskripsi: Joi.string().min(8).required().messages({
    "string.empty": "job deskripsi tidak boleh kosong",
  }),

  salary: Joi.number().required().messages({
    "string.empty": "salary tidak boleh kosong",
  }),

  job_type: Joi.string().required().messages({
    "string.empty": "job type tidak boleh kosong",
  }),

  lokasi_penempatan: Joi.string().required().messages({
    "string.empty": "lokasi tidak boleh kosong",
  }),
});

const updateJobSchema = Joi.object({
  job_requirement: Joi.string().optional(),
  posisi: Joi.string().optional(),
  job_deskripsi: Joi.string().optional(),
  salary: Joi.number().optional(),
  job_type: Joi.string().optional(),
  lokasi_penempatan: Joi.string().optional(),
});

const idSchema = Joi.object({
  id_job: Joi.number().integer().required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    job_requirement: Joi.alternatives()
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
const post_job = async (req, res) => {
  try {
    const { error, value } = jobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { job_requirement, posisi, job_type, job_deskripsi, salary, lokasi_penempatan } = value;

    // Cek apakah posisi sudah ada di database
    // const existingJob = await job.findOne({
    //   where: {
    //     [Op.or]: [{ posisi: posisi }, { job_requirement: job_requirement }],
    //   },
    // });

    // // Jika posisi sudah ada, kirim respons error
    // if (existingJob) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "posisi sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const create_job = await job.create({
      job_requirement: job_requirement,
      posisi: posisi,
      job_deskripsi: job_deskripsi,
      salary: salary,
      job_type: job_type,
      lokasi_penempatan: lokasi_penempatan,
    });

    if (!create_job) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data job",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data job",
      data: {
        job_requirement: create_job.job_requirement,
        posisi: create_job.posisi,
        job_deskripsi: create_job.job_deskripsi,
        salary: create_job.salary,
        job_type: create_job.job_type,
        lokasi_penempatan: create_job.lokasi_penempatan,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_job = async (req, res) => {
  try {
    const id_job = req.params.id_job;
    const { error, value } = updateJobSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // const existingJob =
    //   value.job_requirement || value.posisi
    //     ? await job.findOne({
    //         where: {
    //           [Op.and]: [
    //             {
    //               [Op.or]: [
    //                 ...(value.job_requirement
    //                   ? [{ job_requirement: value.job_requirement }]
    //                   : []),
    //                 ...(value.posisi ? [{ posisi: value.posisi }] : []),
    //               ],
    //             },
    //           ],
    //         },
    //       })
    //     : null;

    // if (existingJob) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "posisi sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const update_job = await job.findOne({
      where: { id_job },
    });

    if (!update_job) {
      return res.status(404).json({
        success: false,
        message: "Job tidak ditemukan",
        data: null,
      });
    }

    await update_job.update({
      job_requirement: value.job_requirement || update_job.job_requirement,
      posisi: value.posisi || update_job.posisi,
      job_deskripsi: value.job_deskripsi || update_job.job_deskripsi,
      salary: value.salary || update_job.salary,
      job_type: value.job_type || update_job.job_type,
      lokasi_penempatan: value.lokasi_penempatan || update_job.lokasi_penempatan,
      updateAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        job_requirement: update_job.job_requirement,
        job_deskripsi: update_job.job_deskripsi,
        posisi: update_job.posisi,
        salary: update_job.salary,
        job_type: update_job.job_type,
        lokasi_penempatan: update_job.lokasi_penempatan,
        createdAt: update_job.createdAt,
        updateAt: update_job.updateAt,
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

const delete_job = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_job } = value;

    const delete_job = await job.findOne({
      where: { id_job },
    });

    if (!delete_job) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data pelanggan",
        data: null,
      });
    }

    // Menghapus job secara permanen
    await job.destroy({
      where: { id_job },
    });

    //   await tbl_media.update(
    //     { media_delete_at: new Date() },
    //     { where: { media_uuid_table: id_job, media_table: "job" } }
    //   );

    res.json({
      success: true,
      message: "Sukses menghapus data job",
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

const get_detail_job = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_job } = value;

    const detail_job = await job.findOne({
      where: {
        id_job,
      },
    });

    if (!detail_job) {
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
        job_requirement: detail_job.job_requirement,
        posisi: detail_job.posisi,
        job_deskripsi: detail_job.job_deskripsi,
        salary: detail_job.salary,
        job_type: detail_job.job_type,
        lokasi_penempatan: detail_job.lokasi_penempatan,
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

const get_all_job = async (req, res) => {
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
      order = { id_job: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {

    };

    if (filter.job_requirement) {
      const filterNames = Array.isArray(filter.job_requirement)
        ? filter.job_requirement
        : filter.job_requirement.split(",");

      if (filterNames.length > 0) {
        whereClause.job_requirement = {
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

      whereClause.job_requirement = whereClause.job_requirement
        ? { [Sequelize.Op.and]: [whereClause.job_requirement, keywordClause] }
        : keywordClause;
    }

    const data = await job.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((job) => ({
        job_requirement: job.job_requirement,
        posisi: job.posisi,
        job_deskripsi: job.job_deskripsi,
        salary: job.salary,
        job_type: job.job_type,
        lokasi_penempatan: job.lokasi_penempatan,
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
    const excludePagesUrl = "http://localhost:5000/api/v6/job/get_all";

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
  post_job,
  put_job,
  delete_job,
  get_all_job,
  get_detail_job,
};
