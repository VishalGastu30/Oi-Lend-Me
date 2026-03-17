/**
 * k6 Load Test — Browsing Scenario
 * 1,600 virtual users reading pages, searching, viewing item details
 * Thresholds: p95 < 800ms, error rate < 1%
 * 
 * Run: k6 run tests/load/browsing-scenario.js
 * Override base URL: k6 run -e BASE_URL=http://staging:3000 tests/load/browsing-scenario.js
 */
import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Custom metrics
const errorRate = new Rate('errors');
const itemsLatency = new Trend('items_latency');
const searchLatency = new Trend('search_latency');

export const options = {
  scenarios: {
    browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 400 },   // Ramp up
        { duration: '3m', target: 1600 },   // Full load
        { duration: '10m', target: 1600 },  // Hold
        { duration: '2m', target: 0 },      // Ramp down
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800'],   // 95th percentile < 800ms
    errors: ['rate<0.01'],              // Error rate < 1%
    items_latency: ['p(95)<800'],
    search_latency: ['p(95)<1000'],
  },
};

// Login helper — returns auth cookie
function login(email, password) {
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email, password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (res.status === 200) {
    // Extract auth-token cookie
    const cookies = res.cookies;
    if (cookies['auth-token'] && cookies['auth-token'].length > 0) {
      return cookies['auth-token'][0].value;
    }
  }
  return null;
}

export function setup() {
  // Login once and get token for shared use
  const token = login('alice@college.edu', 'password123');
  return { token };
}

export default function (data) {
  const params = {
    headers: {},
    cookies: {},
  };
  
  if (data.token) {
    params.cookies['auth-token'] = data.token;
  }

  group('Browse Items', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/items?page=1&limit=20`, params);
    itemsLatency.add(Date.now() - start);
    
    const success = check(res, {
      'items status 200': (r) => r.status === 200,
      'items body has data': (r) => {
        try { return JSON.parse(r.body).data !== undefined; } catch { return false; }
      },
    });
    errorRate.add(!success);
  });

  sleep(Math.random() * 2 + 1); // 1-3s think time

  group('Search Items', () => {
    const queries = ['camera', 'book', 'headphones', 'arduino', 'tent', 'charger'];
    const query = queries[Math.floor(Math.random() * queries.length)];
    
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/items?search=${query}&page=1&limit=10`, params);
    searchLatency.add(Date.now() - start);
    
    const success = check(res, {
      'search status 200': (r) => r.status === 200,
    });
    errorRate.add(!success);
  });

  sleep(Math.random() * 2 + 1);

  group('View Notifications', () => {
    const res = http.get(`${BASE_URL}/api/notifications`, params);
    const success = check(res, {
      'notifications status 200 or 401': (r) => r.status === 200 || r.status === 401,
    });
    errorRate.add(!success);
  });

  sleep(Math.random() * 3 + 2); // 2-5s think time between page views
}
