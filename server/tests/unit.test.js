const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const { getJwtSecret } = require('../config/jwt');
const { createRateLimiter } = require('../middleware/rateLimit');
const { protect, admin } = require('../middleware/auth');
const { SAFE_PICKUP_ZONES } = require('../config/pickupZones');
const Item = require('../models/Item');
const BorrowRequest = require('../models/BorrowRequest');

describe('CampusLoop Server Unit Tests', () => {
  it('enforces JWT_SECRET in production and returns dev secret otherwise', () => {
    const prevEnv = process.env.NODE_ENV;
    const prevSecret = process.env.JWT_SECRET;

    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'development';
    assert.equal(getJwtSecret(), 'dev_only_campusloop_secret');

    process.env.NODE_ENV = 'production';
    assert.throws(() => getJwtSecret(), /JWT_SECRET/);

    process.env.JWT_SECRET = 'custom_secret';
    assert.equal(getJwtSecret(), 'custom_secret');

    process.env.NODE_ENV = prevEnv;
    if (prevSecret !== undefined) process.env.JWT_SECRET = prevSecret;
    else delete process.env.JWT_SECRET;
  });

  it('rate limiter blocks requests exceeding max in non-test mode', () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const limiter = createRateLimiter({ windowMs: 60000, max: 2, message: 'Rate limited' });
    const req = { ip: '10.0.0.1' };
    let nextCalls = 0;
    const next = () => { nextCalls += 1; };
    const res = {
      statusCode: 200,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; },
    };

    limiter(req, res, next);
    limiter(req, res, next);
    assert.equal(nextCalls, 2);

    limiter(req, res, next);
    assert.equal(nextCalls, 2);
    assert.equal(res.statusCode, 429);
    assert.equal(res.body.message, 'Rate limited');

    process.env.NODE_ENV = prevEnv;
  });

  it('auth middleware validates Bearer tokens and admin role', async () => {
    const prevSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'unit_test_secret';

    const makeRes = () => ({
      statusCode: 200,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; },
    });

    // Missing token -> 401
    const res1 = makeRes();
    await protect({ headers: {} }, res1, () => {});
    assert.equal(res1.statusCode, 401);

    // Valid student token -> next() called, admin() returns 403
    const token = jwt.sign({ id: 'u1', role: 'student' }, 'unit_test_secret');
    const req2 = { headers: { authorization: `Bearer ${token}` } };
    let passed = false;
    await protect(req2, makeRes(), () => { passed = true; });
    assert.equal(passed, true);
    assert.equal(req2.user.id, 'u1');

    const resAdmin = makeRes();
    admin(req2, resAdmin, () => {});
    assert.equal(resAdmin.statusCode, 403);

    // Admin role -> next() called
    let adminPassed = false;
    admin({ user: { id: 'a1', role: 'admin' } }, makeRes(), () => { adminPassed = true; });
    assert.equal(adminPassed, true);

    if (prevSecret !== undefined) process.env.JWT_SECRET = prevSecret;
    else delete process.env.JWT_SECRET;
  });

  it('validates Item pickupLocation against SAFE_PICKUP_ZONES and BorrowRequest.isOverdue', () => {
    const badItem = new Item({
      owner: '507f1f77bcf86cd799439011',
      name: 'Calculator',
      description: 'TI-84',
      category: 'electronics',
      condition: 'good',
      pickupLocation: 'Unauthorized Alley',
    });
    const err = badItem.validateSync();
    assert.ok(err.errors.pickupLocation);

    const goodItem = new Item({
      owner: '507f1f77bcf86cd799439011',
      name: 'Calculator',
      description: 'TI-84',
      category: 'electronics',
      condition: 'good',
      pickupLocation: SAFE_PICKUP_ZONES[0],
    });
    assert.equal(goodItem.validateSync(), undefined);

    const overdueReq = new BorrowRequest({
      borrower: '507f1f77bcf86cd799439011',
      owner: '507f1f77bcf86cd799439012',
      item: '507f1f77bcf86cd799439013',
      startDate: new Date(Date.now() - 10 * 86400000),
      endDate: new Date(Date.now() - 2 * 86400000),
      status: 'handed_over',
    });
    assert.equal(overdueReq.isOverdue, true);
  });
});
