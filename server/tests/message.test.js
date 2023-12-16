require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

// Connect to the database before each test.
beforeAll(async () => {
  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ktjepad.mongodb.net/SocialNetworkTestUser`,
  );
});

// Remove all documents and close database connection after each test.
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

let userID = '';
let userID2 = '';
let accessToken1 = '';
let accessToken2 = '';
let conversationID = '';

/**
 * Register 2 new users before testing the create conversation route.
 */
describe('Create user to create conversation', () => {
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
        userID = response.body.content._id;
        accessToken1 = response.body.content.accessToken;
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('content.accessToken');
      });
  });
});
describe('Create user to create conversation', () => {
  it('should return accessToken', async () => {
    await request(app)
      .post('/api/users')
      .send({
        email: 'test2@gmail.com',
        password: '123456',
        firstname: 'Test2',
        lastname: 'User2',
      })
      .then((response) => {
        userID2 = response.body.content._id;
        accessToken2 = response.body.content.accessToken;
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('content.accessToken');
      });
  });
});

// Create conversation
describe('POST /api/conversations', () => {
  it('should return conversation', async () => {
    await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${accessToken1}`)
      .send({
        name: 'Test Conversation',
        isGroup: false,
        users: [userID2],
      })
      .then((response) => {
        conversationID = response.body.content.conversation._id;
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content.conversation');
      });
  });
});

// Create message1
describe('POST /api/messages', () => {
  it('should return message', async () => {
    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${accessToken1}`)
      .send({
        body: 'Test Message1',
        image: null,
        conversationID,
      })
      .then((response) => {
        // console.log(response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content.message');
      });
  });
});
// Create message2
describe('POST /api/messages', () => {
  it('should return message', async () => {
    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${accessToken2}`)
      .send({
        body: 'Test Message2',
        image: null,
        conversationID,
      })
      .then((response) => {
        // console.log(response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content.message');
      });
  });
});

// Get all message
describe('GET /api/:conversationId/messages', () => {
  it('should return 2 messages from 2 user', async () => {
    await request(app)
      .get(`/api/${conversationID}/messages`)
      .set('Authorization', `Bearer ${accessToken1}`)
      .then((response) => {
        // console.log(response.body.content.messages[0].sender._id);
        // console.log(response.body.content.messages[1].sender._id);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content.messages[0].sender._id', userID);
        expect(response.body).toHaveProperty('content.messages[1].sender._id', userID2);
      });
  });
});
