const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const { getAlumniByYear, getAlumniByDepartment, getAlumniByStream } = require("../controllers/adminReportsController");

//router.use(adminAuth); // Protect all routes below

router.get("/alumni-data-by-year", getAlumniByYear);
router.get("/alumni-data-by-department", getAlumniByDepartment);
router.get("/alumni-data-by-stream", getAlumniByStream);


module.exports = router;
