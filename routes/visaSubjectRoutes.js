const express = require("express");
const { listVisaSubjects, createVisaSubject, deleteVisaSubject } = require("../controllers/visaSubjectController.js");
const router = express.Router();

router.get("/", listVisaSubjects);
router.post("/", createVisaSubject);
router.delete("/:id", deleteVisaSubject);

module.exports = router;
