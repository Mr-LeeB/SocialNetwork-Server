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


// let UserID = '';
// let AccessToken = '';

// // Testing the register route.
// describe('POST /api/users', () => {
//   it('should return accessToken', async () => {
//     const response = await request(app)
//       .post('/api/users')
//       .send({
//         email: 'test@gmail.com',
//         password: '123456',
//         firstname: 'Test',
//         lastname: 'User',
//       })
//       .then((res) => {
//         // console.log('Register user: ', res.body);
//         UserID = res.body.content._id;
//         AccessToken = res.body.content.accessToken;
//         expect(res.statusCode).toBe(201);
//         expect(res.body).toHaveProperty('content.accessToken');
//       });
//   });
// });


