const express = require("express");
const router = express.Router();
const {
    post_layanan,
    put_layanan,
    delete_layanan,
    get_all_layanan,
    get_detail_layanan,
} = require("../controllers/c_layanan");

router.post("/layanan", post_layanan);
router.put("/layanan/:id_layanan", put_layanan);
router.delete("/layanan/:id_layanan", delete_layanan);
router.get("/layanan/:id_layanan", get_detail_layanan);
router.get("/layanan", get_all_layanan);

module.exports = router