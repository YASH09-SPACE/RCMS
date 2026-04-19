const express = require('express');
const router = express.Router();
const { getDistricts, getWards, getPublicHeatmap, reverseGeocode } = require('../controllers/locationController');

router.get('/districts', getDistricts);
router.get('/wards/:districtId', getWards);
router.get('/heatmap', getPublicHeatmap);
router.post('/reverse-geocode', reverseGeocode);

module.exports = router;
