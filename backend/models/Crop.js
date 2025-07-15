const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Crop name is required'],
    enum: {
      values: ['Maize', 'Beans', 'Sukuma Wiki', 'Tomatoes', 'Onions', 'Carrots', 'Cabbage', 'Other'],
      message: 'Please select a valid crop type'
    }
  },
  plantingDate: {
    type: Date,
    required: [true, 'Planting date is required']
  },
  expectedHarvestDate: {
    type: Date,
    required: [true, 'Expected harvest date is required'],
    validate: {
      validator: function(value) {
        return value > this.plantingDate;
      },
      message: 'Harvest date must be after planting date'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['Growing', 'Ready to Harvest', 'Harvested'],
    default: 'Growing'
  }
}, {
  timestamps: true
});

// Virtual field for days until harvest
cropSchema.virtual('daysUntilHarvest').get(function() {
  const now = new Date();
  const harvest = new Date(this.expectedHarvestDate);
  const diffTime = harvest - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual field for growth progress
cropSchema.virtual('growthProgress').get(function() {
  const now = new Date();
  const planted = new Date(this.plantingDate);
  const harvest = new Date(this.expectedHarvestDate);
  
  const totalGrowthTime = harvest - planted;
  const elapsedTime = now - planted;
  
  const progress = Math.min(Math.max((elapsedTime / totalGrowthTime) * 100, 0), 100);
  return Math.round(progress);
});

// Include virtuals when converting to JSON
cropSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Crop', cropSchema);