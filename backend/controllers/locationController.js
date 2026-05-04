const District = require('../models/District');
const Ward = require('../models/Ward');
const axios = require('axios');
const Complaint = require('../models/Complaint');

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

/**
 * @desc    Get all public heatmap points
 * @route   GET /api/location/heatmap
 * @access  Public
 */
const getPublicHeatmap = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({})
      .select('title latitude longitude priority status')
      .lean();

    const validPoints = complaints.filter(c => c.latitude && c.longitude);
    res.json({ success: true, data: validPoints, count: validPoints.length });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reverse geocode lat/long to District/Ward magically
 * @route   POST /api/location/reverse-geocode
 * @access  Public
 */
const reverseGeocode = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) return res.status(400).json({ success: false, message: 'Missing coordinates' });

    // Boundary check for Gujarat roughly (20.1 to 24.7 N, 68.1 to 74.4 E)
    if (latitude < 20.1 || latitude > 24.7 || longitude < 68.1 || longitude > 74.4) {
      return res.status(400).json({ success: false, message: 'Location selected is outside Gujarat jurisdiction. Please select a valid location inside Gujarat.' });
    }

    // Contact OpenStreetMap
    const osmResponse = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { format: 'json', lat: latitude, lon: longitude },
      headers: { 'User-Agent': 'RCMS-Gujarat-Bot/1.0' }
    });

    if (!osmResponse.data || !osmResponse.data.address) {
      return res.status(400).json({ success: false, message: 'Could not fetch address data from OSM' });
    }

    const { address, display_name } = osmResponse.data;
    const fullAddress = display_name ? display_name.toLowerCase() : '';

    // Robust District Matching: Find if any of our district names exist in the OSM full address
    const allDistricts = await District.find({ isActive: true });
    let assignedDistrict = null;
    
    for (const dist of allDistricts) {
      if (fullAddress.includes(dist.name.toLowerCase())) {
        assignedDistrict = dist;
        break;
      }
    }

    // Fallback District
    if (!assignedDistrict) {
      assignedDistrict = await District.findOne({ name: 'Ahmedabad' });
    }

    // Robust Ward/Taluka Matching
    let assignedWard = null;
    if (assignedDistrict) {
      const districtWards = await Ward.find({ district: assignedDistrict._id });
      
      for (const w of districtWards) {
        // Remove "Ward" or "Taluka" suffix for matching if present in DB
        const cleanDbWardName = w.wardName.replace(/taluka|ward|zone/gi, '').trim().toLowerCase();
        
        // Check if OSM address pieces match
        const osmPieces = [
          (address.suburb || '').toLowerCase(),
          (address.town || '').toLowerCase(),
          (address.village || '').toLowerCase(),
          (address.county || '').toLowerCase(),
          (address.city_district || '').toLowerCase()
        ].filter(Boolean);

        if (osmPieces.some(piece => piece.includes(cleanDbWardName) || cleanDbWardName.includes(piece))) {
          assignedWard = w;
          break;
        }
      }

      // Stronger fallback: just match against full address string
      if (!assignedWard) {
        for (const w of districtWards) {
          const cleanDbWardName = w.wardName.replace(/taluka|ward|zone/gi, '').trim().toLowerCase();
          if (fullAddress.includes(cleanDbWardName)) {
            assignedWard = w;
            break;
          }
        }
      }

      // Final fallback: First ward of that district
      if (!assignedWard && districtWards.length > 0) {
        assignedWard = districtWards[0];
      }
    }

    res.json({
      success: true,
      data: {
        districtId: assignedDistrict ? assignedDistrict._id : null,
        districtName: assignedDistrict ? assignedDistrict.name : null,
        wardId: assignedWard ? assignedWard._id : null,
        wardName: assignedWard ? assignedWard.wardName : null
      }
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { getDistricts, getWards, getPublicHeatmap, reverseGeocode };
