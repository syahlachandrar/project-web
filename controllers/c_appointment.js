const db = require("../models");
const appointment = db.Appointment;
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");

const appointmentSchema = Joi.object({
  nama_klien: Joi.string().required().messages({
    "string.empty": "nama_klien tidak boleh kosong",
  }),

  jasa: Joi.string().required().messages({
    "string.empty": "jasa tidak boleh kosong",
  }),

  email_klien: Joi.string().email().required().messages({
    "string.empty": "email_klien tidak boleh kosong",
  }),

  no_tlpn_klien: Joi.string().required().pattern(/^[0-9]{10,14}$/).messages({
    'string.empty': 'Nomor HP tidak boleh kosong',
    'string.pattern.base': 'Nomor HP harus terdiri dari angka saja dan memiliki panjang minimal 10 dan maksimal 14',
  }),

  pesan: Joi.string().required().messages({
    "string.empty": "pesan tidak boleh kosong",
  }),
});

const updateAppointmentSchema = Joi.object({
  nama_klien: Joi.string().optional(),
  jasa: Joi.string().optional(),
  email_klien: Joi.string().optional(),
  no_tlpn_klien: Joi.string().optional(),
  pesan: Joi.string().optional(),
});

const idSchema = Joi.object({
  id_appointment: Joi.number().integer().required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    nama_klien: Joi.alternatives()
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
const post_appointment = async (req, res) => {
  try {
    const { error, value } = appointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      nama_klien,
      jasa,
      email_klien,
      no_tlpn_klien,
      pesan,
    } = value;

    // Cek apakah jasa sudah ada di database
    // const existingJob = await testimoni.findOne({
    //   where: {
    //     [Op.or]: [{ jasa: jasa }, { nama_klien: nama_klien }],
    //   },
    // });

    // // Jika jasa sudah ada, kirim respons error
    // if (existingJob) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "jasa sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const create_appointment = await appointment.create({
      nama_klien: nama_klien,
      jasa: jasa,
      email_klien: email_klien,
      no_tlpn_klien: no_tlpn_klien,
      pesan: pesan,
    });

    if (!create_appointment) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data appointment",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data appointment",
      data: {
        nama_klien: create_appointment.nama_klien,
        jasa: create_appointment.jasa,
        email_klien: create_appointment.email_klien,
        no_tlpn_klien: create_appointment.no_tlpn_klien,
        pesan: create_appointment.pesan,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_appointment = async (req, res) => {
  try {
    const id_appointment = req.params.id_appointment;
    const { error, value } = updateAppointmentSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // const existingJob =
    //   value.nama_klien || value.jasa
    //     ? await testimoni.findOne({
    //         where: {
    //           [Op.and]: [
    //             {
    //               [Op.or]: [
    //                 ...(value.nama_klien
    //                   ? [{ nama_klien: value.nama_klien }]
    //                   : []),
    //                 ...(value.jasa ? [{ jasa: value.jasa }] : []),
    //               ],
    //             },
    //           ],
    //         },
    //       })
    //     : null;

    // if (existingJob) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "jasa sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const update_appointment = await appointment.findOne({
      where: { id_appointment },
    });

    if (!update_appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment tidak ditemukan",
        data: null,
      });
    }

    await update_appointment.update({
      nama_klien: value.nama_klien || update_appointment.nama_klien,
      jasa: value.jasa || update_appointment.jasa,
      email_klien: value.email_klien || update_appointment.email_klien,
      no_tlpn_klien: value.no_tlpn_klien || update_appointment.no_tlpn_klien,
      pesan: value.pesan || update_appointment.pesan,
      updateAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        nama_klien: update_appointment.nama_klien,
        jasa: update_appointment.jasa,
        email_klien: update_appointment.email_klien,
        no_tlpn_klien: update_appointment.no_tlpn_klien,
        pesan: update_appointment.pesan,
        createdAt: update_appointment.createdAt,
        updateAt: update_appointment.updateAt,
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

const delete_appointment = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_appointment } = value;

    const delete_appointment = await appointment.findOne({
      where: { id_appointment },
    });

    if (!delete_appointment) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data appointment",
        data: null,
      });
    }

    // Menghapus testimoni secara permanen
    await appointment.destroy({
      where: { id_appointment },
    });

    //   await tbl_media.update(
    //     { media_delete_at: new Date() },
    //     { where: { media_uuid_table: id_appointment, media_table: "testimoni" } }
    //   );

    res.json({
      success: true,
      message: "Sukses menghapus data appointment",
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

const get_detail_appointment = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_appointment } = value;

    const detail_appointment = await appointment.findOne({
      where: {
        id_appointment,
      },
    });

    if (!detail_appointment) {
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
        nama_klien: detail_appointment.nama_klien,
        jasa: detail_appointment.jasa,
        email_klien: detail_appointment.email_klien,
        no_tlpn_klien: detail_appointment.no_tlpn_klien,
        pesan: detail_appointment.pesan,
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

const get_all_appointment = async (req, res) => {
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
      order = { id_appointment: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {};

    if (filter.nama_klien) {
      const filterNames = Array.isArray(filter.nama_klien)
        ? filter.nama_klien
        : filter.nama_klien.split(",");

      if (filterNames.length > 0) {
        whereClause.nama_klien = {
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

      whereClause.nama_klien = whereClause.nama_klien
        ? { [Sequelize.Op.and]: [whereClause.nama_klien, keywordClause] }
        : keywordClause;
    }

    const data = await appointment.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((appointment) => ({
        nama_klien: appointment.nama_klien,
        jasa: appointment.jasa,
        email_klien: appointment.email_klien,
        no_tlpn_klien: appointment.no_tlpn_klien,
        pesan: appointment.pesan,
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
  post_appointment,
  put_appointment,
  delete_appointment,
  get_all_appointment,
  get_detail_appointment,
};
