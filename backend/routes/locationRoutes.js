const express = require('express');
const router = express.Router();
const { getDistricts, getWards } = require('../controllers/locationController');

router.get('/districts', getDistricts);
router.get('/wards/:districtId', getWards);

module.exports = router;
