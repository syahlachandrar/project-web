const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
    post_tim,
    put_tim,
    delete_tim,
    get_detail_tim,
    get_all_tim,
} = require("../controllers/c_tim");

router.post("/tim", post_tim);
router.put("/tim/:id_tim", upload.single('foto'), put_tim);
router.delete("/tim/:id_tim", delete_tim);
router.get("/tim/:id_tim", get_detail_tim);
router.get("/tim", get_all_tim);

module.exports = router;