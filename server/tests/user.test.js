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

let UserID = '';
let AccessToken = '';

// Testing the register route.
describe('POST /api/users', () => {
  it('should return accessToken', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@gmail.com',
        password: '123456',
        firstname: 'Test',
        lastname: 'User',
      })
      .then((res) => {
        // console.log('Register user: ', res.body);
        UserID = res.body.content._id;
        AccessToken = res.body.content.accessToken;
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('content.accessToken');
      });
  });
});

// Create User2
let User2ID = '';
let User2AccessToken = '';
describe('POST /api/users', () => {
  it('should return accessToken', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'tranchikien@gmail.com',
        password: 'gj48jtgf843',
        firstname: 'kien',
        lastname: 'tran chi',
      })
      .then((res) => {
        // console.log('Register user: ', res.body);
        User2ID = res.body.content._id;
        User2AccessToken = res.body.content.accessToken;
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('content.accessToken');
      });
  });
});

// Testing get user by id
describe('GET /api/users/:id', () => {
  it('should return user', async () => {
    const response = await request(app)
      .get(`/api/users/${UserID}`)
      .set('Authorization', `Bearer ${AccessToken}`)
      .then((res) => {
        // console.log('Get user: ', res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('content.userInfo');
      });
  });
});

// Testing update user
describe('PUT /api/users/:id', () => {
  it('should return user', async () => {
    const response = await request(app)
      .put(`/api/users/${UserID}`)
      .set('Authorization', `Bearer ${AccessToken}`)
      .send({
        firstname: 'Test1',
        lastname: 'User1',
        tags: ['tag1', 'tag2'],
        contacts: ['contact1', 'contact2'],
        username: 'testuser',
      })
      .then((res) => {
        // console.log('Update user: ', res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('content.userInfo');
        expect(res.body).toHaveProperty('content.ownerInfo');
      });
  });
});

// Update Expertise
describe('POST /api/users/expertise', () => {
  it('should return user', async () => {
    const response = await request(app)
      .post(`/api/users/expertise`)
      .set('Authorization', `Bearer ${AccessToken}`)
      .send({
        des: ['des1', 'des2'],
      })
      .then((res) => {
        // console.log('Update expertise: ', res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('content.ownerInfo');
      });
  });
});

// const followUser = async (req, res) => {
//     const { id } = req.params;

//     const userID = req.id;

//     try {
//       // Call service
//       const result = await userService.followUser_Service(userID, id);

// Follow user
describe('POST /api/users/:id/follow', () => {
  it('should return user', async () => {
    const response = await request(app)
      .post(`/api/users/${User2ID}/follow`)
      .set('Authorization', `Bearer ${AccessToken}`)
      .then((res) => {
        // console.log('Follow user: ', res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Follow user successfully');
      });
  });
});

// Get Followed
describe('GET /api/user/followers', () => {
  it('should return user', async () => {
    const response = await request(app)
      .get(`/api/user/followers`)
      .set('Authorization', `Bearer ${User2AccessToken}`)
      .then((res) => {
        // console.log('Get followers: ', res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('content.followers[0]._id', UserID);
      });
  });
});

// Get Shuold Follow
describe('GET /api/user/shouldFollow', () => {
  it('should return user', async () => {
    const response = await request(app)
      .get(`/api/user/shouldFollow`)
      .set('Authorization', `Bearer ${AccessToken}`)
      .then((res) => {
        console.log('Get should follow: ', res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('content.users');
      });
  });
});
