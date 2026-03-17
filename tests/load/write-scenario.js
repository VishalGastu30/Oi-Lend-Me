/**
 * k6 Load Test — Write Scenario
 * 200 concurrent users performing create items, requests, approvals
 * Thresholds: p95 < 1500ms for writes
 *
 * Run: k6 run tests/load/write-scenario.js
 */
import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const errorRate = new Rate('errors');
const writeLatency = new Trend('write_latency');

export const options = {
  scenarios: {
    writes: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    errors: ['rate<0.01'],
    write_latency: ['p(95)<1500'],
  },
};

export function setup() {
  // Login
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'alice@college.edu', password: 'password123',
  }), { headers: { 'Content-Type': 'application/json' } });

  let token = null;
  if (res.status === 200 && res.cookies['auth-token']) {
    token = res.cookies['auth-token'][0].value;
  }
  return { token };
}

export default function (data) {
  const params = {
    headers: { 'Content-Type': 'application/json' },
    cookies: {},
  };
  if (data.token) params.cookies['auth-token'] = data.token;

  group('Create Item', () => {
    const categories = ['Electronics', 'Books', 'Lab', 'Misc', 'Chargers', 'Class'];
    const cat = categories[Math.floor(Math.random() * categories.length)];

    const payload = JSON.stringify({
      name: `Load Test Item ${Date.now()}-${Math.random().toString(36).slice(2)}`,
      description: 'Created during k6 load test',
      category: cat,
    });

    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/items`, payload, params);
    writeLatency.add(Date.now() - start);

    const success = check(res, {
      'create item status 201 or 200': (r) => r.status === 201 || r.status === 200,
    });
    errorRate.add(!success);
  });

  sleep(Math.random() * 3 + 2);

  group('Submit Feedback', () => {
    const payload = JSON.stringify({
      category: 'SUGGESTION',
      message: `Load test feedback ${Date.now()}`,
    });

    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/feedback`, payload, params);
    writeLatency.add(Date.now() - start);

    check(res, {
      'feedback status ok': (r) => r.status < 500,
    });
  });

  sleep(Math.random() * 2 + 1);
}
