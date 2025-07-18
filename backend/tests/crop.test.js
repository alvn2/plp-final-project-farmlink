const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Crop = require('../models/Crop');

describe('Crop Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async() => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/farmlink_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async() => {
    // Clean up database
    await User.deleteMany({});
    await Crop.deleteMany({});

    // Create test user and get auth token
    const userData = {
      name: 'John Doe',
      email: `test${Date.now()}@example.com`,
      password: 'Test123!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = response.body.data && response.body.data.token;
    userId = response.body.data && response.body.data.user.id;
  });

  afterAll(async() => {
    await User.deleteMany({});
    await Crop.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/crops', () => {
    beforeEach(async() => {
      // Register a new user and get token
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      };
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      authToken = response.body.data.token;
      userId = response.body.data.user.id;
    });

    const validCropData = {
      name: 'Maize',
      variety: 'White Dent',
      plantingDate: '2024-03-15',
      expectedHarvestDate: '2024-07-15',
      area: 2.5,
      areaUnit: 'acres',
      status: 'Planning',
      notes: 'Test crop for spring season'
    };

    it('should create a new crop successfully', async() => {
      const response = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCropData)
        .expect(201);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.crop.name).toBe(validCropData.name);
      expect(response.body.data.crop.userId).toBe(userId);
    });

    it('should not create crop without authentication', async() => {
      const response = await request(app)
        .post('/api/crops')
        .send(validCropData)
        .expect(401);

      expect(response.body && response.body.success).toBe(false);
    });

    it('should not create crop without required fields', async() => {
      const invalidData = { ...validCropData };
      delete invalidData.name;

      const response = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body && response.body.success).toBe(false);
    });
  });

  describe('GET /api/crops', () => {
    beforeEach(async() => {
      // Register a new user and get token
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      };
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      authToken = response.body.data.token;
      userId = response.body.data.user.id;
      // Create test crops for this user
      const crops = [
        { name: 'Maize', userId, status: 'Planning', plantingDate: '2024-03-01', expectedHarvestDate: '2024-07-01', variety: 'A', area: 1, areaUnit: 'acres' },
        { name: 'Beans', userId, status: 'Planted', plantingDate: '2024-03-02', expectedHarvestDate: '2024-07-02', variety: 'B', area: 1, areaUnit: 'acres' },
        { name: 'Tomatoes', userId, status: 'Growing', plantingDate: '2024-03-03', expectedHarvestDate: '2024-07-03', variety: 'C', area: 1, areaUnit: 'acres' }
      ];
      await Crop.insertMany(crops);
    });

    it('should get all crops for authenticated user', async() => {
      const response = await request(app)
        .get('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.crops).toHaveLength(3);
    });

    it('should filter crops by status', async() => {
      const response = await request(app)
        .get('/api/crops?status=Planning')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.crops).toHaveLength(1);
      expect(response.body.data.crops[0].status).toBe('Planning');
    });

    it('should not get crops without authentication', async() => {
      const response = await request(app)
        .get('/api/crops')
        .expect(401);

      expect(response.body && response.body.success).toBe(false);
    });
  });

  describe('GET /api/crops/:id', () => {
    let cropId;
    beforeEach(async() => {
      // Register a new user and get token
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      };
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      authToken = response.body.data.token;
      userId = response.body.data.user.id;
      // Create a crop for this user
      const crop = new Crop({ name: 'Maize', userId, status: 'Planning', plantingDate: '2024-03-01', expectedHarvestDate: '2024-07-01', variety: 'A', area: 1, areaUnit: 'acres' });
      await crop.save();
      cropId = crop._id.toString();
    });

    it('should get specific crop by ID', async() => {
      const response = await request(app)
        .get(`/api/crops/${cropId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.crop.name).toBe('Maize');
    });

    it('should return 404 for non-existent crop', async() => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/crops/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body && response.body.success).toBe(false);
    });
  });

  describe('PUT /api/crops/:id', () => {
    let cropId;
    beforeEach(async() => {
      // Register a new user and get token
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      };
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      authToken = response.body.data.token;
      userId = response.body.data.user.id;
      // Create a crop for this user
      const crop = new Crop({ name: 'Maize', userId, status: 'Planning', plantingDate: '2024-03-01', expectedHarvestDate: '2024-07-01', variety: 'A', area: 1, areaUnit: 'acres' });
      await crop.save();
      cropId = crop._id.toString();
    });

    it('should update crop successfully', async() => {
      const updateData = { name: 'Beans', status: 'Planted' };

      const response = await request(app)
        .put(`/api/crops/${cropId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.crop.name).toBe('Beans');
      expect(response.body.data.crop.status).toBe('Planted');
    });
  });

  describe('DELETE /api/crops/:id', () => {
    let cropId;
    beforeEach(async() => {
      // Register a new user and get token
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      };
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      authToken = response.body.data.token;
      userId = response.body.data.user.id;
      // Create a crop for this user
      const crop = new Crop({ name: 'Maize', userId, status: 'Planning', plantingDate: '2024-03-01', expectedHarvestDate: '2024-07-01', variety: 'A', area: 1, areaUnit: 'acres' });
      await crop.save();
      cropId = crop._id.toString();
    });

    it('should delete crop successfully', async() => {
      const response = await request(app)
        .delete(`/api/crops/${cropId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.message).toBe('Crop deleted successfully');
    });
  });
});
