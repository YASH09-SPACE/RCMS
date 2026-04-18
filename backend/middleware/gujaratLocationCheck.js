/**
 * Middleware to validate that complaint location is within Gujarat state
 * Gujarat boundaries: N:24.7, S:20.1, E:74.5, W:68.1
 */
const validateGujaratLocation = (req, res, next) => {
  const { latitude, longitude } = req.body;

  // Skip validation if no coordinates provided (manual address entry)
  if (!latitude || !longitude) {
    return next();
  }

  const gujaratBounds = {
    north: 24.7,
    south: 20.1,
    east: 74.5,
    west: 68.1
  };

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (
    lat < gujaratBounds.south ||
    lat > gujaratBounds.north ||
    lng < gujaratBounds.west ||
    lng > gujaratBounds.east
  ) {
    return res.status(400).json({
      success: false,
      message: 'Location must be within Gujarat state'
    });
  }

  next();
};

module.exports = { validateGujaratLocation };
