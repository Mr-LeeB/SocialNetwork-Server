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

