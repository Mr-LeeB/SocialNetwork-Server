require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

/* Connect to the database before each test. */
beforeAll(async () => {
  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ktjepad.mongodb.net/SocialNetworkTest`,
  );
});

/* Remove all documents and close database connection after each test. */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

/**
 * Testing the register route.
 */
describe('POST /api/users', () => {
  it('should return accessToken', async () => {
    const response = await request(app).post('/api/users').send({
      email: 'test@gmail.com',
      password: '123456',
      firstname: 'Test',
      lastname: 'User',
    });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('content.accessToken');
  });
});

/**
 * Testing the login route.
 */
describe('POST /api/login', () => {
  it('should return accessToken', async () => {
    const response = await request(app).post('/api/login').send({
      email: 'test@gmail.com',
      password: '123456',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('content.accessToken');
  });
});

/**
 * Testing the checkLogin route.
 */
describe('POST /api/checklogin', () => {
  it('should return authentication boolean', async () => {
    const response = await request(app)
      .post('/api/checklogin')
      .set('Authorization', `Bearer ${process.env.ACCESS_TOKEN_TEST}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('authentication', true);
  });
});

/**
 * Testing the logout route.
 */
describe('POST /api/logout', () => {
  it('should return success boolean', async () => {
    const response = await request(app)
      .post('/api/logout')
      .set('Authorization', `Bearer ${process.env.ACCESS_TOKEN_TEST}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});
