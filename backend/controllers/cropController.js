const Crop = require('../models/Crop');
const Task = require('../models/Task');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { dbLogger } = require('../middleware/logger');

// Get all crops for authenticated user
const getCrops = catchAsync(async(req, res, _next) => {
  const userId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { userId };
  if (status) {
    query.status = status;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  const startTime = Date.now();
  const crops = await Crop.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Crop.countDocuments(query);
  const duration = Date.now() - startTime;

  dbLogger.logQuery('find', 'crops', query, duration);

  res.status(200).json({
    success: true,
    message: 'Crops retrieved successfully',
    data: {
      crops,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

// Get single crop by ID
const getCrop = catchAsync(async(req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const startTime = Date.now();
  const crop = await Crop.findOne({ _id: id, userId });
  const duration = Date.now() - startTime;

  if (!crop) {
    return next(new AppError('Crop not found', 404));
  }

  // Get associated tasks count
  const taskCount = await Task.countDocuments({ cropId: id, userId });

  dbLogger.logQuery('findOne', 'crops', { _id: id, userId }, duration);

  res.status(200).json({
    success: true,
    message: 'Crop retrieved successfully',
    data: {
      crop: {
        ...crop.toJSON(),
        taskCount
      }
    }
  });
});

// Create new crop
const createCrop = catchAsync(async(req, res, next) => {
  const userId = req.user._id;
  const cropData = { ...req.body, userId };

  // Validate expected harvest date vs planting date
  if (cropData.plantingDate && cropData.expectedHarvestDate) {
    const plantingDate = new Date(cropData.plantingDate);
    const harvestDate = new Date(cropData.expectedHarvestDate);

    if (harvestDate <= plantingDate) {
      return next(new AppError('Expected harvest date must be after planting date', 400));
    }
  }

  const startTime = Date.now();
  const crop = new Crop(cropData);
  await crop.save();
  const duration = Date.now() - startTime;

  dbLogger.logQuery('create', 'crops', cropData, duration);

  res.status(201).json({
    success: true,
    message: 'Crop created successfully',
    data: {
      crop
    }
  });
});

// Update crop
const updateCrop = catchAsync(async(req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updateData = req.body;

  // Validate expected harvest date vs planting date
  const existingCrop = await Crop.findOne({ _id: id, userId });
  if (!existingCrop) {
    return next(new AppError('Crop not found', 404));
  }

  const plantingDate = updateData.plantingDate || existingCrop.plantingDate;
  const harvestDate = updateData.expectedHarvestDate || existingCrop.expectedHarvestDate;

  if (plantingDate && harvestDate) {
    const plantingDateObj = new Date(plantingDate);
    const harvestDateObj = new Date(harvestDate);

    if (harvestDateObj <= plantingDateObj) {
      return next(new AppError('Expected harvest date must be after planting date', 400));
    }
  }

  const startTime = Date.now();
  const crop = await Crop.findOneAndUpdate(
    { _id: id, userId },
    updateData,
    {
      new: true,
      runValidators: true
    }
  );
  const duration = Date.now() - startTime;

  if (!crop) {
    return next(new AppError('Crop not found', 404));
  }

  dbLogger.logQuery('findOneAndUpdate', 'crops', { _id: id, userId }, duration);

  res.status(200).json({
    success: true,
    message: 'Crop updated successfully',
    data: {
      crop
    }
  });
});

// Delete crop
const deleteCrop = catchAsync(async(req, res, _next) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Check if crop has associated tasks
  const taskCount = await Task.countDocuments({ cropId: id, userId });
  if (taskCount > 0) {
    return _next(new AppError('Cannot delete crop with associated tasks. Please delete tasks first.', 400));
  }

  const startTime = Date.now();
  const crop = await Crop.findOneAndDelete({ _id: id, userId });
  const duration = Date.now() - startTime;

  if (!crop) {
    return _next(new AppError('Crop not found', 404));
  }

  dbLogger.logQuery('findOneAndDelete', 'crops', { _id: id, userId }, duration);

  res.status(200).json({
    success: true,
    message: 'Crop deleted successfully'
  });
});

// Get crop statistics
const getCropStats = catchAsync(async(req, res, _next) => {
  const userId = req.user._id;

  const startTime = Date.now();

  // Get crop counts by status
  const statusStats = await Crop.aggregate([
    { $match: { userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // Get total area by unit
  const areaStats = await Crop.aggregate([
    { $match: { userId, area: { $exists: true, $ne: null } } },
    { $group: { _id: '$areaUnit', totalArea: { $sum: '$area' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // Get crops planted this year
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31);

  const thisYearCrops = await Crop.countDocuments({
    userId,
    plantingDate: { $gte: yearStart, $lte: yearEnd }
  });

  const duration = Date.now() - startTime;
  dbLogger.logQuery('aggregate', 'crops', { userId }, duration);

  res.status(200).json({
    success: true,
    message: 'Crop statistics retrieved successfully',
    data: {
      statusStats,
      areaStats,
      thisYearCrops,
      totalCrops: await Crop.countDocuments({ userId })
    }
  });
});

module.exports = {
  getCrops,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop,
  getCropStats
};
