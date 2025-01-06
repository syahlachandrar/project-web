const express = require("express");
const router = express.Router();
const {
    post_testimoni,
    put_testimoni,
    delete_testimoni,
    get_detail_testimoni,
    get_all_testimoni,
} = require("../controllers/c_testimoni");

router.post("/testimoni", post_testimoni);
router.put("/testimoni/:id_testimoni", put_testimoni);
router.delete("/testimoni/:id_testimoni", delete_testimoni);
router.get("/testimoni/:id_testimoni", get_detail_testimoni);
router.get("/testimoni", get_all_testimoni);

module.exports = router;