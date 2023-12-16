require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

/* Connect to the database before tests */
beforeAll(async () => {
  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ktjepad.mongodb.net/SocialNetworkTestPost`,
  );
});

/* Remove all documents and close database connection after tests */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

let userID = '';
let accessToken = '';
let postID = '';
let postShareID = '';
let commentID = '';
let commentShareID = '';

/**
 * Create user to create post
 */
describe('Create user to create post', () => {
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

/**
 * Get post
 */
describe('GET /api/posts/:id', () => {
  it('should return post', async () => {
    await request(app)
      .get(`/api/posts/${postID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Share post
 */
describe('POST /api/posts/:id/share', () => {
  it('should return post', async () => {
    await request(app)
      .post(`/api/posts/${postID}/share`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Test post share',
        title: 'Test post share',
      })
      .then((response) => {
        postShareID = response.body.content.shares[0]._id;
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Get post share
 */
describe('GET /api/postshares/:id', () => {
  it('should return post', async () => {
    await request(app)
      .get(`/api/postshares/${postShareID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Get posts of user
 */
describe('GET /api/:id/posts', () => {
  it('should return posts', async () => {
    await request(app)
      .get(`/api/${userID}/posts`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Get all posts
 */
describe('GET /api/posts', () => {
  it('should return posts', async () => {
    await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Update post
 */
describe('PUT /api/posts/:id', () => {
  it('should return post', async () => {
    await request(app)
      .put(`/api/posts/${postID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Test post update',
        title: 'Test post update',
      })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Like post
 */
describe('POST /api/posts/:id/like', () => {
  it('should return post', async () => {
    await request(app)
      .post(`/api/posts/${postID}/like`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Like post share
 */
describe('POST /api/postshare/:idShare/like', () => {
  it('should return post', async () => {
    await request(app)
      .post(`/api/postshare/${postShareID}/like`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Save post
 */
describe('POST /api/posts/:id/save', () => {
  it('should return post', async () => {
    await request(app)
      .post(`/api/posts/${postID}/save`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Comment post
 */
describe('POST /api/posts/:id/comment', () => {
  it('should return comment', async () => {
    await request(app)
      .post(`/api/posts/${postID}/comment`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        contentComment: 'Test comment',
      })
      .then((response) => {
        commentID = response.body.content.comments[0]._id;
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Comment post share
 */
describe('POST /api/postshare/:idShare/comment', () => {
  it('should return comment', async () => {
    await request(app)
      .post(`/api/postshare/${postShareID}/comment`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        contentComment: 'Test comment',
      })
      .then((response) => {
        commentShareID = response.body.content.comments[0]._id;
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Reply comment
 */
describe('POST /api/posts/:id/comment/:idComment', () => {
  it('should return comment', async () => {
    await request(app)
      .post(`/api/posts/${postID}/comment/${commentID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        contentComment: 'Test reply comment',
      })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Reply comment post share
 */
describe('POST /api/postshare/:idShare/comment/:idComment', () => {
  it('should return comment', async () => {
    await request(app)
      .post(`/api/postshare/${postShareID}/comment/${commentShareID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        contentComment: 'Test reply comment',
      })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Like comment
 */
describe('POST /comment/:idComment/like', () => {
  it('should return comment', async () => {
    await request(app)
      .post(`/api/comment/${commentID}/like`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Dislike comment
 */
describe('POST /comment/:idComment/dislike', () => {
  it('should return comment', async () => {
    await request(app)
      .post(`/api/comment/${commentID}/dislike`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * Delete comment
 */
describe('DELETE /api/posts/:id/comment/:idComment', () => {
  it('should return comment', async () => {
    await request(app)
      .delete(`/api/posts/${postID}/comment/${commentID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
  });
});

/**
 * View post
 */
describe('POST /api/posts/:postId/views', () => {
  it('should return success', async () => {
    await request(app)
      .post(`/api/posts/${postID}/views`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      });
  });
});

/**
 * View post share
 */
describe('POST /api/postshare/:postId/views', () => {
  it('should return success', async () => {
    await request(app)
      .post(`/api/postshare/${postShareID}/views`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      });
  });
});

/**
 * Delete post
 */
describe('DELETE /api/posts/:id', () => {
  it('should return success', async () => {
    await request(app)
      .delete(`/api/posts/${postID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      });
  });
});
