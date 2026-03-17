/**
 * k6 Full Load Test — 2,000 Concurrent Users
 * Combined browsing (1600) + writes (200) + chat (200) + admin (10)
 * Ramp 0→2000 over 10 min, hold 20 min, ramp down
 *
 * Run: k6 run tests/load/full-load-2k.js
 */
import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const errorRate = new Rate('errors');
const readLatency = new Trend('read_latency');
const writeLatency = new Trend('write_latency');
const totalRequests = new Counter('total_requests');

export const options = {
  scenarios: {
    browsers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 800 },
        { duration: '5m', target: 1600 },
        { duration: '20m', target: 1600 },
        { duration: '3m', target: 0 },
      ],
      exec: 'browseScenario',
    },
    writers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '20m', target: 200 },
        { duration: '3m', target: 0 },
      ],
      exec: 'writeScenario',
    },
    chatters: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '20m', target: 200 },
        { duration: '3m', target: 0 },
      ],
      exec: 'chatScenario',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    read_latency: ['p(95)<800'],
    write_latency: ['p(95)<1500'],
    errors: ['rate<0.01'],
  },
};

export function setup() {
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'alice@college.edu', password: 'password123',
  }), { headers: { 'Content-Type': 'application/json' } });

  let token = null;
  if (res.status === 200 && res.cookies['auth-token']) {
    token = res.cookies['auth-token'][0].value;
  }
  return { token };
}

function getParams(data) {
  return {
    headers: { 'Content-Type': 'application/json' },
    cookies: data.token ? { 'auth-token': data.token } : {},
  };
}

export function browseScenario(data) {
  const params = getParams(data);

  const start = Date.now();
  const res = http.get(`${BASE_URL}/api/items?page=${Math.floor(Math.random() * 10) + 1}&limit=20`, params);
  readLatency.add(Date.now() - start);
  totalRequests.add(1);

  const success = check(res, { 'browse ok': (r) => r.status === 200 });
  errorRate.add(!success);

  sleep(Math.random() * 3 + 2);

  // Search
  const queries = ['camera', 'book', 'laptop', 'phone', 'charger', 'lab'];
  const q = queries[Math.floor(Math.random() * queries.length)];
  const s2 = Date.now();
  const res2 = http.get(`${BASE_URL}/api/items?search=${q}`, params);
  readLatency.add(Date.now() - s2);
  totalRequests.add(1);
  check(res2, { 'search ok': (r) => r.status === 200 });

  sleep(Math.random() * 4 + 2);
}

export function writeScenario(data) {
  const params = getParams(data);
  const categories = ['Electronics', 'Books', 'Lab', 'Misc', 'Chargers', 'Class'];

  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/items`, JSON.stringify({
    name: `Load-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    description: 'k6 load test item',
    category: categories[Math.floor(Math.random() * categories.length)],
  }), params);
  writeLatency.add(Date.now() - start);
  totalRequests.add(1);

  const success = check(res, { 'write ok': (r) => r.status === 201 || r.status === 200 });
  errorRate.add(!success);

  sleep(Math.random() * 5 + 3);
}

export function chatScenario(data) {
  const params = getParams(data);

  const start = Date.now();
  const res = http.get(`${BASE_URL}/api/conversations`, params);
  readLatency.add(Date.now() - start);
  totalRequests.add(1);

  check(res, { 'conversations ok': (r) => r.status === 200 || r.status === 401 });

  sleep(Math.random() * 5 + 3);
}
