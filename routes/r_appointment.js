const express = require("express");
const router = express.Router();
const {
    post_appointment,
    put_appointment,
    delete_appointment,
    get_detail_appointment,
    get_all_appointment,
} = require("../controllers/c_appointment");

router.post("/appointment", post_appointment);
router.put("/appointment/:id_appointment", put_appointment);
router.delete("/appointment/:id_appointment", delete_appointment);
router.get("/appointment/:id_appointment", get_detail_appointment);
router.get("/appointment", get_all_appointment);

module.exports = router;