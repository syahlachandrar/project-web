const db = require("../models");
const tim = db.Tim;
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");
const upload = require("../middleware/upload");
const fs = require("fs");

// Validasi Schema
const timSchema = Joi.object({
  nama: Joi.string().required().messages({
    "string.empty": "Nama tim tidak boleh kosong",
  }),
  posisi: Joi.string().required().messages({
    "string.empty": "Posisi tidak boleh kosong",
  }),
});

const updatetimSchema = Joi.object({
  nama: Joi.string().optional(),
  posisi: Joi.string().optional(),
});

const idSchema = Joi.object({
  id_tim: Joi.number().integer().required(),
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

const post_tim = async (req, res) => {
  try {
    upload.single("foto")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          data: null,
        });
      }

      const { error, value } = timSchema.validate(req.body);
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

      const { nama, posisi } = value;

      const create_tim = await tim.create({
        nama: nama,
        posisi: posisi,
        foto: req.file.filename, // Simpan nama file
      });

      res.status(200).json({
        success: true,
        message: "Berhasil menambahkan data tim",
        data: {
          nama: create_tim.nama,
          posisi: create_tim.posisi,
          foto: create_tim.foto,
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

// const post_tim = async (req, res) => {
//   try {
//     const { error, value } = jobSchema.validate(req.body);
//     if (error) {
//       return res.status(400).json({
//         success: false,
//         message: error.details[0].message,
//         data: null,
//       });
//     }

//     const { nama, posisi, foto } = value;

//     // Cek apakah posisi sudah ada di database
//     // const existingJob = await tim.findOne({
//     //   where: {
//     //     [Op.or]: [{ posisi: posisi }, { nama: nama }],
//     //   },
//     // });

//     // // Jika posisi sudah ada, kirim respons error
//     // if (existingJob) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message:
//     //       "posisi sudah digunakan, silakan gunakan yang lain.",
//     //     data: null,
//     //   });
//     // }

//     const create_tim = await tim.create({
//       nama: nama,
//       posisi: posisi,
//       foto: foto,
//     });

//     if (!create_tim) {
//       return res.status(404).json({
//         success: false,
//         message: "Gagal menambahkan data tim",
//         data: null,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Berhasil menambahkan data tim",
//       data: {
//         nama: create_tim.nama,
//         posisi: create_tim.posisi,
//         foto: create_tim.foto,
//       },
//     });
//   } catch (error) {
//     console.log(error, "Data Error");
//   }
// };

const put_tim = async (req, res) => {
    try {
      const id_tim = req.params.id_tim;
    
      // Validasi input body
      const { error, value } = updatetimSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
          data: null,
        });
      }
  
      // Cari tim berdasarkan ID
      const update_tim = await tim.findOne({
        where: { id_tim },
      });
  
      if (!update_tim) {
        return res.status(404).json({
          success: false,
          message: "Tim tidak ditemukan",
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
      
      // Update data tim
      await update_tim.update({
        nama: value.nama || update_tim.nama,
        posisi: value.posisi || update_tim.posisi,
        foto: value.foto || update_tim.foto, // Foto baru disimpan di sini
        updateAt: new Date(),
      });
      
      res.status(200).json({
        success: true,
        message: "Berhasil merubah data tim",
        data: {
          id_tim: update_tim.id_tim,
          nama: update_tim.nama,
          posisi: update_tim.posisi,
          foto: update_tim.foto,
          createdAt: update_tim.createdAt,
          updateAt: update_tim.updateAt,
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
  

const delete_tim = async (req, res) => {
  try {
    // Validasi ID
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_tim } = value;

    // Cari tim berdasarkan ID
    const delete_tim = await tim.findOne({
      where: { id_tim },
    });

    if (!delete_tim) {
      return res.status(404).json({
        success: false,
        message: "Tim tidak ditemukan",
        data: null,
      });
    }

    // Hapus file foto jika ada
    const photoPath = `uploads/img/${delete_tim.foto}`;
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath); // Hapus foto
    }

    // Hapus data dari database
    await tim.destroy({
      where: { id_tim },
    });

    res.status(200).json({
      success: true,
      message: "Sukses menghapus data tim",
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

const get_detail_tim = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { id_tim } = value;

    const detail_tim = await tim.findOne({
      where: {
        id_tim,
      },
    });

    if (!detail_tim) {
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
        nama: detail_tim.nama,
        posisi: detail_tim.posisi,
        foto: detail_tim.foto,
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

const get_all_tim = async (req, res) => {
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
      order = { id_tim: "desc" },
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

    const data = await tim.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((tim) => ({
        nama: tim.nama,
        posisi: tim.posisi,
        foto: tim.foto,
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
    const excludePagesUrl = "http://localhost:5000/api/v6/tim/get_all";

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
  post_tim,
  put_tim,
  delete_tim,
  get_all_tim,
  get_detail_tim,
};
