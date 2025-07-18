const express = require('express');
const Crop = require('../models/Crop');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/crops
// @desc    Get all crops for authenticated user
// @access  Private
router.get('/', auth, async(req, res) => {
  try {
    const { sort = '-plantingDate', status } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const crops = await Crop.find(query).sort(sort);

    res.json({
      success: true,
      message: 'Crops retrieved successfully',
      data: {
        message: 'Crops retrieved successfully',
        count: crops.length,
        crops
      }
    });

  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching crops.' });
  }
});

// @route   GET /api/crops/:id
// @desc    Get single crop by ID
// @access  Private
router.get('/:id', auth, async(req, res) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found or you do not have permission to view it.' });
    }

    // Get associated tasks
    const tasks = await Task.find({ cropId: crop._id }).sort({ dueDate: 1 });

    res.json({
      success: true,
      message: 'Crop retrieved successfully',
      data: {
        message: 'Crop retrieved successfully',
        crop,
        tasks
      }
    });

  } catch (error) {
    console.error('Get crop error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid crop ID format.' });
    }

    res.status(500).json({ success: false, message: 'Server error while fetching crop.' });
  }
});

// @route   POST /api/crops
// @desc    Create a new crop
// @access  Private
router.post('/', auth, async(req, res) => {
  try {
    const { name, plantingDate, expectedHarvestDate, notes } = req.body;

    // Validation
    if (!name || !plantingDate || !expectedHarvestDate) {
      return res.status(400).json({ success: false, message: 'Crop name, planting date, and expected harvest date are required.' });
    }

    // Date validation
    const plantDate = new Date(plantingDate);
    const harvestDate = new Date(expectedHarvestDate);

    if (harvestDate <= plantDate) {
      return res.status(400).json({ success: false, message: 'Expected harvest date must be after planting date.' });
    }

    const crop = new Crop({
      userId: req.user._id,
      name,
      plantingDate: plantDate,
      expectedHarvestDate: harvestDate,
      notes: notes?.trim() || ''
    });

    await crop.save();

    res.status(201).json({
      success: true,
      message: 'Crop created successfully',
      data: {
        message: 'Crop created successfully',
        crop
      }
    });

  } catch (error) {
    console.error('Create crop error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }

    res.status(500).json({ success: false, message: 'Server error while creating crop.' });
  }
});

// @route   PUT /api/crops/:id
// @desc    Update a crop
// @access  Private
router.put('/:id', auth, async(req, res) => {
  try {
    const { name, plantingDate, expectedHarvestDate, notes, status } = req.body;

    const crop = await Crop.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found or you do not have permission to edit it.' });
    }

    // Update fields if provided
    if (name) crop.name = name;
    if (plantingDate) crop.plantingDate = new Date(plantingDate);
    if (expectedHarvestDate) crop.expectedHarvestDate = new Date(expectedHarvestDate);
    if (notes !== undefined) crop.notes = notes.trim();
    if (status) crop.status = status;

    // Validate dates
    if (crop.expectedHarvestDate <= crop.plantingDate) {
      return res.status(400).json({ success: false, message: 'Expected harvest date must be after planting date.' });
    }

    await crop.save();

    res.json({
      success: true,
      message: 'Crop updated successfully',
      data: {
        message: 'Crop updated successfully',
        crop
      }
    });

  } catch (error) {
    console.error('Update crop error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid crop ID format.' });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }

    res.status(500).json({ success: false, message: 'Server error while updating crop.' });
  }
});

// @route   DELETE /api/crops/:id
// @desc    Delete a crop
// @access  Private
router.delete('/:id', auth, async(req, res) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found or you do not have permission to delete it.' });
    }

    // Delete associated tasks
    await Task.deleteMany({ cropId: crop._id });

    // Delete crop
    await Crop.findByIdAndDelete(crop._id);

    res.json({
      success: true,
      message: 'Crop deleted successfully'
    });

  } catch (error) {
    console.error('Delete crop error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid crop ID format.' });
    }

    res.status(500).json({ success: false, message: 'Server error while deleting crop.' });
  }
});

// @route   GET /api/crops/stats/dashboard
// @desc    Get crop statistics for dashboard
// @access  Private
router.get('/stats/dashboard', auth, async(req, res) => {
  try {
    const crops = await Crop.find({ userId: req.user._id });

    // Status counts
    const statusCounts = {
      Growing: 0,
      'Ready to Harvest': 0,
      Harvested: 0
    };

    crops.forEach(crop => {
      statusCounts[crop.status]++;
    });

    // Upcoming harvests (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    const upcomingHarvests = crops.filter(crop => {
      const harvestDate = new Date(crop.expectedHarvestDate);
      return harvestDate >= now && harvestDate <= thirtyDaysFromNow && crop.status === 'Growing';
    });

    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        message: 'Dashboard stats retrieved successfully',
        stats: {
          totalCrops: crops.length,
          statusCounts,
          upcomingHarvests: upcomingHarvests.length,
          cropsByType: crops.reduce((acc, crop) => {
            acc[crop.name] = (acc[crop.name] || 0) + 1;
            return acc;
          }, {})
        }
      }
    });

  } catch (error) {
    console.error('Get crop stats error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching crop statistics.' });
  }
});

module.exports = router;
