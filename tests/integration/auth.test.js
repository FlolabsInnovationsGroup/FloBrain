const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../models');

describe('Authentication and Authorization Flow', () => {
  let userToken;
  let adminToken;
  const uniqueEmail = `newuser-${Date.now()}@example.com`;

  beforeAll(async () => {
    // The database is seeded before the test runs, so we can log in directly.
    const userRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(userRes.statusCode).toBe(200);
    expect(userRes.body.data).toHaveProperty('token');
    userToken = userRes.body.data.token;

    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'adminpassword' });

    expect(adminRes.statusCode).toBe(200);
    expect(adminRes.body.data).toHaveProperty('token');
    adminToken = adminRes.body.data.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // Test Case: Register success
  it('should register a new user successfully and return a token (POST /register)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        full_name: 'New Test User',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  // ... (the rest of the test file is correct and unchanged) ...
  // Test Case: Register duplicate email
  it('should fail to register a user with an existing email (POST /register)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  // Test Case: Login wrong password
  it('should fail to login with incorrect credentials (POST /login)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test Case: Protected route without header
  it('should fail to access a protected route without a token', async () => {
    const res = await request(app).get('/api/v1/ping-protected');
    expect(res.statusCode).toBe(401);
  });
  
  // Test Case: Protected route with valid user token
  it('should access a protected route with a valid token', async () => {
    const res = await request(app)
      .get('/api/v1/ping-protected')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('user_id');
  });

  // Test Case: Admin route with user token
  it('should prevent access to an admin route with a non-admin token', async () => {
    const res = await request(app)
      .get('/api/v1/admin/ping')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  // Test Case: Admin route with admin token
  it('should allow access to an admin route with a valid admin token', async () => {
    const res = await request(app)
      .get('/api/v1/admin/ping')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.message).toBe('Access granted to admin.');
  });
});