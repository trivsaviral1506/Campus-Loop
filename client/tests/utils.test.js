import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getImageUrl, cn } from '../src/lib/utils.js';

describe('CampusLoop Client Utility Tests', () => {
  it('resolves relative upload paths against backend origin and preserves full URLs', () => {
    assert.equal(getImageUrl(''), '');
    assert.equal(getImageUrl('https://example.com/pic.jpg'), 'https://example.com/pic.jpg');
    assert.equal(getImageUrl('/uploads/resource-123.png'), 'http://localhost:5000/uploads/resource-123.png');
    assert.equal(getImageUrl('uploads/resource-123.png'), 'http://localhost:5000/uploads/resource-123.png');
  });

  it('merges Tailwind classes cleanly with cn()', () => {
    assert.equal(cn('px-2 py-1', 'px-4'), 'py-1 px-4');
  });
});
