require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

/* Connect to the database before tests */
beforeAll(async () => {
  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ktjepad.mongodb.net/SocialNetworkTestConversation`,
  );
});

/* Remove all documents and close database connection after tests */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

let userID = '';
let userID2 = '';
let accessToken = '';
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
        accessToken = response.body.content.accessToken;
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
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('content.accessToken');
      });
  });
});

/**
 * Testing the create conversation route.
 */
describe('POST /api/conversations', () => {
  it('should return conversation', async () => {
    await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${accessToken}`)
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

/**
 * Testing the get conversation by id route.
 */
describe('GET /api/conversations/:conversationId', () => {
  it('should return conversation', async () => {
    await request(app)
      .get(`/api/conversations/${conversationID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content.conversation');
      });
  });
});

/**
 * Testing the send conversation route.
 */
describe('POST /api/conversations/:conversationId/seen', () => {
  it('should return conversation', async () => {
    await request(app)
      .post(`/api/conversations/${conversationID}/seen`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content.conversation');
      });
  });
});

/**
 * Testing the get all conversations route.
 */
describe('GET /api/conversations', () => {
  it('should return conversations', async () => {
    await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content.conversations');
      });
  });
});

/**
 * Testing the delete conversation route.
 */
describe('DELETE /api/conversations/:conversationId', () => {
  it('should return success message', async () => {
    await request(app)
      .delete(`/api/conversations/${conversationID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Conversation deleted successfully');
      });
  });
});
