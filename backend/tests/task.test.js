// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Crop = require('../models/Crop');
const Task = require('../models/Task');

describe('Task Endpoints', () => {
  let authToken;
  let userId;
  let cropId;

  beforeAll(async() => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/farmlink_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async() => {
    // Clean up database
    await User.deleteMany({});
    await Crop.deleteMany({});
    await Task.deleteMany({});

    // Create test user and get auth token
    const userData = {
      name: 'John Doe',
      email: `test${Date.now()}@example.com`,
      password: 'Test123!'
    };

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = userResponse.body.data.token;
    userId = userResponse.body.data.user.id;

    // Create test crop
    const crop = new Crop({ name: 'Maize', userId, status: 'Planning', plantingDate: '2024-03-01', expectedHarvestDate: '2024-07-01', variety: 'A', area: 1, areaUnit: 'acres' });
    await crop.save();
    cropId = crop._id.toString();
  });

  afterAll(async() => {
    await User.deleteMany({});
    await Crop.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/tasks', () => {
    beforeEach(async() => {
      // Register a new user and get token
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      };
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      authToken = userResponse.body.data.token;
      userId = userResponse.body.data.user.id;
      // Create a crop for this user
      const crop = new Crop({ name: 'Maize', userId, status: 'Planning', plantingDate: '2024-03-01', expectedHarvestDate: '2024-07-01', variety: 'A', area: 1, areaUnit: 'acres' });
      await crop.save();
      cropId = crop._id.toString();
    });

    const validTaskData = {
      description: 'Water the crops',
      dueDate: '2024-12-31',
      priority: 'Medium',
      category: 'Watering',
      estimatedDuration: 60,
      notes: 'Water thoroughly in the morning'
    };

    it('should create a new task successfully', async() => {
      const taskData = { ...validTaskData, cropId };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.task.description).toBe(validTaskData.description);
      expect(response.body.data.task.userId).toBe(userId);
      expect(response.body.data.task.cropId._id).toBe(cropId);
    });

    it('should not create task without authentication', async() => {
      const taskData = { ...validTaskData, cropId };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);

      expect(response.body && response.body.success).toBe(false);
    });

    it('should not create task without required fields', async() => {
      const invalidData = { ...validTaskData, cropId };
      delete invalidData.description;

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body && response.body.success).toBe(false);
    });

    it('should not create task with invalid cropId', async() => {
      const invalidCropId = new mongoose.Types.ObjectId();
      const taskData = { ...validTaskData, cropId: invalidCropId };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(404);

      expect(response.body && response.body.success).toBe(false);
      expect(response.body.message).toBe('Crop not found or does not belong to you');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async() => {
      // Re-create user and crop for this test
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      };
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      authToken = userResponse.body.data.token;
      userId = userResponse.body.data.user.id;
      const crop = new Crop({ name: 'Maize', userId, status: 'Planning', plantingDate: '2024-03-01', expectedHarvestDate: '2024-07-01', variety: 'A', area: 1, areaUnit: 'acres' });
      await crop.save();
      cropId = crop._id.toString();
      // Create test tasks
      const tasks = [
        { description: 'Water crops', dueDate: '2024-12-31', status: 'Pending', priority: 'High', category: 'Watering', userId, cropId },
        { description: 'Fertilize crops', dueDate: '2025-01-15', status: 'Completed', priority: 'Medium', category: 'Fertilizing', userId, cropId },
        { description: 'Harvest crops', dueDate: '2024-07-01', status: 'Overdue', priority: 'Critical', category: 'Harvesting', userId, cropId }
      ];
      await Task.insertMany(tasks);
    });

    it('should get all tasks for authenticated user', async() => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
    });

    it('should filter tasks by status', async() => {
      const response = await request(app)
        .get('/api/tasks?status=Pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].status).toBe('Pending');
    });

    it('should filter tasks by priority', async() => {
      const response = await request(app)
        .get('/api/tasks?priority=Critical')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].priority).toBe('Critical');
    });

    it('should search tasks by description', async() => {
      const response = await request(app)
        .get('/api/tasks?search=water')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].description.toLowerCase()).toContain('water');
    });
  });

  describe('GET /api/tasks/:id', () => {
    let taskId;
    beforeEach(async() => {
      // Re-create user and crop for this test
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      };
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      authToken = userResponse.body.data.token;
      userId = userResponse.body.data.user.id;
      const crop = new Crop({ name: 'Maize', userId, status: 'Planning', plantingDate: '2024-03-01', expectedHarvestDate: '2024-07-01', variety: 'A', area: 1, areaUnit: 'acres' });
      await crop.save();
      cropId = crop._id.toString();
      const task = new Task({ description: 'Test Task', dueDate: '2024-12-31', userId, cropId });
      await task.save();
      taskId = task._id.toString();
    });

    it('should get specific task by ID', async() => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.task.description).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async() => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body && response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    let taskId;
    beforeEach(async() => {
      // Re-create user and crop for this test
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      };
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      authToken = userResponse.body.data.token;
      userId = userResponse.body.data.user.id;
      const crop = new Crop({ name: 'Maize', userId, status: 'Planning', plantingDate: '2024-03-01', expectedHarvestDate: '2024-07-01', variety: 'A', area: 1, areaUnit: 'acres' });
      await crop.save();
      cropId = crop._id.toString();
      const task = new Task({ description: 'Test Task', dueDate: '2024-12-31', status: 'Pending', userId, cropId });
      await task.save();
      taskId = task._id.toString();
    });

    it('should mark task as completed', async() => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Task completed successfully' })
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.task.status).toBe('Completed');
      expect(response.body.data.task.completedAt).toBeDefined();
    });
  });

  describe('GET /api/tasks/overdue', () => {
    beforeEach(async() => {
      // Re-create user and crop for this test
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      };
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      authToken = userResponse.body.data.token;
      userId = userResponse.body.data.user.id;
      const crop = new Crop({ name: 'Maize', userId, status: 'Planning', plantingDate: '2024-03-01', expectedHarvestDate: '2024-07-01', variety: 'A', area: 1, areaUnit: 'acres' });
      await crop.save();
      cropId = crop._id.toString();
      // Create overdue task
      const overdueTask = new Task({ description: 'Overdue Task', dueDate: '2020-01-01', status: 'Pending', userId, cropId });
      await overdueTask.save();
    });

    it('should get overdue tasks', async() => {
      const response = await request(app)
        .get('/api/tasks/overdue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.count).toBeGreaterThan(0);
    });
  });

  describe('GET /api/tasks/stats', () => {
    beforeEach(async() => {
      // Re-create user and crop for this test
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!'
      };
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      authToken = userResponse.body.data.token;
      userId = userResponse.body.data.user.id;
      const crop = new Crop({ name: 'Maize', userId, status: 'Planning', plantingDate: '2024-03-01', expectedHarvestDate: '2024-07-01', variety: 'A', area: 1, areaUnit: 'acres' });
      await crop.save();
      cropId = crop._id.toString();
      // Create various tasks for statistics
      const tasks = [
        { description: 'Task 1', dueDate: '2024-12-31', status: 'Pending', priority: 'High', category: 'Watering', userId, cropId },
        { description: 'Task 2', dueDate: '2024-12-31', status: 'Completed', priority: 'Medium', category: 'Fertilizing', userId, cropId },
        { description: 'Task 3', dueDate: '2024-12-31', status: 'Overdue', priority: 'Low', category: 'Harvesting', userId, cropId }
      ];
      await Task.insertMany(tasks);
    });

    it('should get task statistics', async() => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body && response.body.success).toBe(true);
      expect(response.body.data.totalTasks).toBe(3);
      expect(response.body.data.statusStats).toBeDefined();
      expect(response.body.data.priorityStats).toBeDefined();
      expect(response.body.data.categoryStats).toBeDefined();
    });
  });
});
