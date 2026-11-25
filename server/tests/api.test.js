const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_suite';
process.env.ALLOWED_EMAIL_DOMAIN = '.edu';

const app = require('../server');
const User = require('../models/User');

let mongoServer;
let httpServer;
let baseUrl;

const api = async (path, { method = 'GET', body, token } = {}) => {
  const headers = {};
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
};

describe('CampusLoop Backend API Integration Suite', () => {
  let ownerToken;
  let borrowerToken;
  let adminToken;
  let ownerId;
  let borrowerId;
  let itemId;
  let requestId;
  let cancelRequestId;
  let handoverPin;

  before(async () => {
    const localTestUri = process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/campusloop_test';
    try {
      await mongoose.connect(localTestUri, { serverSelectionTimeoutMS: 2000 });
      await mongoose.connection.db.dropDatabase();
    } catch {
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }
    await new Promise((resolve) => {
      httpServer = app.listen(0, () => {
        const { port } = httpServer.address();
        baseUrl = `http://127.0.0.1:${port}/api`;
        resolve();
      });
    });

    // Create an admin user directly
    await User.create({
      name: 'Admin User',
      email: 'admin@campus.edu',
      password: 'password123',
      college: 'Apex Tech',
      department: 'Admin',
      year: 'Staff',
      role: 'admin',
    });
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
    if (httpServer) await new Promise((r) => httpServer.close(r));
  });

  it('rejects non-.edu registration and registers valid campus users', async () => {
    const bad = await api('/auth/register', {
      method: 'POST',
      body: {
        name: 'Bad User',
        email: 'bad@gmail.com',
        password: 'password123',
        college: 'Apex Tech',
        department: 'CS',
        year: '2',
      },
    });
    assert.equal(bad.status, 400);

    const ownerRes = await api('/auth/register', {
      method: 'POST',
      body: {
        name: 'Alice Owner',
        email: 'alice@campus.edu',
        password: 'password123',
        college: 'Apex Tech',
        department: 'CS',
        year: '3',
      },
    });
    assert.equal(ownerRes.status, 201);
    ownerToken = ownerRes.data.token;
    ownerId = ownerRes.data._id;

    const borrowerRes = await api('/auth/register', {
      method: 'POST',
      body: {
        name: 'Bob Borrower',
        email: 'bob@campus.edu',
        password: 'password123',
        college: 'Apex Tech',
        department: 'EE',
        year: '2',
      },
    });
    assert.equal(borrowerRes.status, 201);
    borrowerToken = borrowerRes.data.token;
    borrowerId = borrowerRes.data._id;

    const adminLogin = await api('/auth/login', {
      method: 'POST',
      body: { email: 'admin@campus.edu', password: 'password123' },
    });
    assert.equal(adminLogin.status, 200);
    adminToken = adminLogin.data.token;
  });

  it('enforces auth on protected routes and fetches /auth/me', async () => {
    const unauth = await api('/auth/me');
    assert.equal(unauth.status, 401);

    const me = await api('/auth/me', { token: ownerToken });
    assert.equal(me.status, 200);
    assert.equal(me.data.email, 'alice@campus.edu');
  });

  it('enforces Safe Pickup Zones and item ownership', async () => {
    const zonesRes = await api('/items/pickup-zones');
    assert.equal(zonesRes.status, 200);
    assert.ok(Array.isArray(zonesRes.data) && zonesRes.data.length > 0);

    const invalidItem = await api('/items', {
      method: 'POST',
      token: ownerToken,
      body: {
        name: 'Arduino Kit',
        description: 'Starter kit',
        category: 'electronics',
        condition: 'good',
        deposit: 100,
        pickupLocation: 'Random Unverified Corner',
      },
    });
    assert.equal(invalidItem.status, 400);

    const validItem = await api('/items', {
      method: 'POST',
      token: ownerToken,
      body: {
        name: 'Arduino Kit',
        description: 'Starter kit',
        category: 'electronics',
        condition: 'good',
        deposit: 100,
        pickupLocation: zonesRes.data[0],
      },
    });
    assert.equal(validItem.status, 201);
    itemId = validItem.data._id;

    const myItems = await api('/items/my', { token: ownerToken });
    assert.equal(myItems.status, 200);
    assert.equal(myItems.data.length, 1);

    const forbiddenEdit = await api(`/items/${itemId}`, {
      method: 'PUT',
      token: borrowerToken,
      body: { name: 'Hacked' },
    });
    assert.equal(forbiddenEdit.status, 403);
  });

  it('handles borrow request creation, cancellation, and acceptance', async () => {
    const start = new Date(Date.now() + 86400000).toISOString();
    const end = new Date(Date.now() + 5 * 86400000).toISOString();

    const selfBorrow = await api('/requests', {
      method: 'POST',
      token: ownerToken,
      body: { itemId, startDate: start, endDate: end },
    });
    assert.equal(selfBorrow.status, 400);

    // Create and cancel a pending request
    const reqCancel = await api('/requests', {
      method: 'POST',
      token: borrowerToken,
      body: { itemId, startDate: start, endDate: end },
    });
    assert.equal(reqCancel.status, 201);
    cancelRequestId = reqCancel.data._id;

    const cancelled = await api(`/requests/${cancelRequestId}`, {
      method: 'DELETE',
      token: borrowerToken,
    });
    assert.equal(cancelled.status, 200);
    assert.equal(cancelled.data.request.status, 'cancelled');

    // Create active request and accept it
    const reqActive = await api('/requests', {
      method: 'POST',
      token: borrowerToken,
      body: { itemId, startDate: start, endDate: end },
    });
    assert.equal(reqActive.status, 201);
    requestId = reqActive.data._id;

    const accepted = await api(`/requests/${requestId}/status`, {
      method: 'PUT',
      token: ownerToken,
      body: { status: 'accepted' },
    });
    assert.equal(accepted.status, 200);
    assert.equal(accepted.data.status, 'accepted');
    assert.ok(accepted.data.handoverPin);
    handoverPin = accepted.data.handoverPin;
  });

  it('verifies handover via 6-digit PIN and rejects invalid or repeat verification', async () => {
    const badPin = await api(`/requests/${requestId}/verify-handover`, {
      method: 'POST',
      token: ownerToken,
      body: { pin: '000000' },
    });
    assert.equal(badPin.status, 400);

    const goodPin = await api(`/requests/${requestId}/verify-handover`, {
      method: 'POST',
      token: ownerToken,
      body: { pin: handoverPin },
    });
    assert.equal(goodPin.status, 200);
    assert.equal(goodPin.data.request.status, 'handed_over');

    const repeat = await api(`/requests/${requestId}/verify-handover`, {
      method: 'POST',
      token: ownerToken,
      body: { pin: handoverPin },
    });
    assert.equal(repeat.status, 400);
  });

  it('supports participant-scoped messaging and notifications', async () => {
    const send = await api(`/messages/request/${requestId}`, {
      method: 'POST',
      token: borrowerToken,
      body: { content: 'On my way to the library desk!' },
    });
    assert.equal(send.status, 201);

    const thread = await api(`/messages/request/${requestId}`, { token: ownerToken });
    assert.equal(thread.status, 200);
    assert.equal(thread.data.length, 1);

    const notifs = await api('/notifications', { token: ownerToken });
    assert.equal(notifs.status, 200);
    assert.ok(notifs.data.unreadCount >= 1);

    const readAll = await api('/notifications/read-all', { method: 'PUT', token: ownerToken });
    assert.equal(readAll.status, 200);
  });

  it('enforces return-before-review, prevents duplicate reviews, and serves admin metrics', async () => {
    const earlyReview = await api('/reviews', {
      method: 'POST',
      token: borrowerToken,
      body: { requestId, rating: 5, comment: 'Too early' },
    });
    assert.equal(earlyReview.status, 400);

    const returned = await api(`/requests/${requestId}/status`, {
      method: 'PUT',
      token: ownerToken,
      body: { status: 'returned' },
    });
    assert.equal(returned.status, 200);

    const review = await api('/reviews', {
      method: 'POST',
      token: borrowerToken,
      body: { requestId, rating: 5, comment: 'Great lender!' },
    });
    assert.equal(review.status, 201);

    const dupReview = await api('/reviews', {
      method: 'POST',
      token: borrowerToken,
      body: { requestId, rating: 4, comment: 'Duplicate' },
    });
    assert.equal(dupReview.status, 400);

    const userReviews = await api(`/reviews/user/${ownerId}`);
    assert.equal(userReviews.status, 200);
    assert.equal(userReviews.data.averageRating, 5);

    const nonAdmin = await api('/admin/metrics', { token: borrowerToken });
    assert.equal(nonAdmin.status, 403);

    const adminMetrics = await api('/admin/metrics', { token: adminToken });
    assert.equal(adminMetrics.status, 200);
    assert.equal(adminMetrics.data.completedLoans, 1);
  });
});
