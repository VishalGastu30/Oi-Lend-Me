/**
 * k6 Stress Test — Beyond 2,000 Users
 * Pushes past limits to find breaking points
 *
 * Run: k6 run tests/load/stress-test.js
 */
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const errorRate = new Rate('errors');
const latency = new Trend('response_latency');

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 500 },
        { duration: '3m', target: 1000 },
        { duration: '3m', target: 2000 },
        { duration: '3m', target: 3000 },  // Beyond target
        { duration: '3m', target: 4000 },  // Stress
        { duration: '5m', target: 5000 },  // Breaking point
        { duration: '3m', target: 0 },
      ],
    },
  },
  thresholds: {
    // Relaxed thresholds for stress — we want to find the breaking point
    http_req_duration: ['p(95)<3000'],
    errors: ['rate<0.05'],   // Allow up to 5% errors during stress
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

export default function (data) {
  const params = {
    cookies: data.token ? { 'auth-token': data.token } : {},
  };

  const start = Date.now();
  const res = http.get(`${BASE_URL}/api/items?page=1&limit=20`, params);
  latency.add(Date.now() - start);

  const success = check(res, {
    'status ok': (r) => r.status < 500,
  });
  errorRate.add(!success);

  sleep(Math.random() * 2 + 1);
}
