const District = require('../models/District');
const Ward = require('../models/Ward');

/**
 * @desc    Get all Gujarat districts
 * @route   GET /api/location/districts
 * @access  Public
 */
const getDistricts = async (req, res, next) => {
  try {
    const districts = await District.find({ isActive: true })
      .select('name code')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: districts.length,
      data: districts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get wards by district ID
 * @route   GET /api/location/wards/:districtId
 * @access  Public
 */
const getWards = async (req, res, next) => {
  try {
    const { districtId } = req.params;

    // Verify district exists
    const district = await District.findById(districtId);
    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'District not found'
      });
    }

    const wards = await Ward.find({ district: districtId, isActive: true })
      .select('wardNumber wardName areaNames')
      .sort({ wardNumber: 1 });

    res.json({
      success: true,
      count: wards.length,
      district: district.name,
      data: wards
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDistricts, getWards };
