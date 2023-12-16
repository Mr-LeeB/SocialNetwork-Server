require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

// Connect to the database before each test.
beforeAll(async () => {
  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ktjepad.mongodb.net/SocialNetworkTestNotification`,
  );
});

// Remove all documents and close database connection after each test.
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

let userID = '';
let userID2 = '';
let accessToken = '';
let postID = '';

// Create user1
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

// Create user2
describe('Create user to create conversation', () => {
  it('should return accessToken', async () => {
    await request(app)
      .post('/api/users')
      .send({
        email: 'tedsvsdst@gmail.com',
        password: '123dsvsd456',
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

// Get Notification
describe('GET /api/notifications', () => {
  it('should return 200 OK', async () => {
    await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        // console.log('Get Notifications: ', response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content.userInfo');
        expect(response.body).toHaveProperty('content.notifications');
      });
  });
});

/**
 * Create post
 */
describe('POST /api/posts', () => {
  it('should return post', async () => {
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Test post',
        title: 'Test post',
      })
      .then((response) => {
        postID = response.body.content._id;
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('content');
      });
  });
});

// Create Notification
describe('POST /api/notifications', () => {
  it('should return 201 OK', async () => {
    await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        user: userID,
        triggerUser: userID2,
        post: postID,
        comment: null,
        like: null,
        share: null,
      })
      .then((response) => {
        console.log('Create Notification: ', response.body);
        expect(response.statusCode).toBe(201);
      });
  });
});
