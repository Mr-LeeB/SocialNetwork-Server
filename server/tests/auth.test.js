require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

/* Connect to the database before tests */
beforeAll(async () => {
  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ktjepad.mongodb.net/SocialNetworkTestAuth`,
  );
});

/* Remove all documents and close database connection after tests */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

let userID = '';
let accessToken = '';

/**
 * Testing the register route.
 */
describe('POST /api/users', () => {
  it('should return accessToken', async () => {
    await request(app)
      .post('/api/users')
      .send({
        email: 'test@gmail.com',
        password: '123456',
        firstname: 'Test',
        lastname: 'User',
      })
      .then((response) => {
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('content.accessToken');
      });
  });
});

/**
 * Testing the login route.
 */
describe('POST /api/login', () => {
  it('should return accessToken', async () => {
    await request(app)
      .post('/api/login')
      .send({
        email: 'test@gmail.com',
        password: '123456',
      })
      .then((response) => {
        userID = response.body.content._id;
        accessToken = response.body.content.accessToken;
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content.accessToken');
      });
  });
});

/**
 * Testing the checkLogin route.
 */
describe('POST /api/checklogin', () => {
  it('should return authentication boolean', async () => {
    const response = await request(app).post('/api/checklogin').set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('authentication', true);
  });
});

/**
 * Testing the getUserID route.
 */
describe('GET /api/getUserID', () => {
  it('should return userID', async () => {
    await request(app)
      .get('/api/getUserID')
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content', userID);
      });
  });
});

/**
 * Testing the logout route.
 */
describe('POST /api/logout', () => {
  it('should return success boolean', async () => {
    const response = await request(app).post('/api/logout').set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});

/**
 * Testing the forgot route.
 */
describe('POST /api/forgot', () => {
  it('should return success boolean', async () => {
    const response = await request(app).post('/api/forgot').send({
      email: 'test@gmail.com',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});

/**
 * Testing the verify route.
 */
describe('POST /api/verify', () => {
  it('should return success boolean', async () => {
    const response = await request(app).post('/api/verify').send({
      email: 'test@gmail.com',
      code: '0000',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});

/**
 * Testing the checkVerify route.
 */
describe('POST /api/checkVerify', () => {
  it('should return success boolean', async () => {
    const response = await request(app).post('/api/checkVerify').send({
      email: 'test@gmail.com',
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });
});

/**
 * Testing the reset route.
 */
describe('POST /api/reset', () => {
  it('should return success boolean', async () => {
    const response = await request(app).post('/api/reset').send({
      email: 'test@gmail.com',
      password: '123456',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});

/**
 * Testing the checkReset route.
 */
describe('POST /api/checkReset', () => {
  it('should return success boolean', async () => {
    const response = await request(app).post('/api/checkReset').send({
      email: 'test@gmail.com',
    });
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });
});
