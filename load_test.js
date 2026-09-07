import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics
const successfulLogins = new Counter('successful_logins');
const chatResponseTime = new Trend('chat_response_time');
const errorRate = new Rate('custom_error_rate');

// Target server configuration
let rawBaseUrl = __ENV.BASE_URL || 'http://127.0.0.1:5000';
if (rawBaseUrl.includes('your-production-app.com')) {
  console.warn('⚠️ WARNING: "your-production-app.com" is a placeholder! Falling back to local server http://127.0.0.1:5000');
  rawBaseUrl = 'http://127.0.0.1:5000';
}
const BASE_URL = rawBaseUrl.replace(/\/+$/, ''); // Remove trailing slash

// Scenario selection via CLI or Environment Variable:
// Available scenarios:
//   1. smoke       - k6 run -e SCENARIO=smoke load_test.js
//   2. load        - k6 run -e SCENARIO=load load_test.js
//   3. stress      - k6 run -e SCENARIO=stress load_test.js
//   4. spike       - k6 run -e SCENARIO=spike load_test.js
//   5. endurance   - k6 run -e SCENARIO=endurance load_test.js
//   6. breakpoint  - k6 run -e SCENARIO=breakpoint load_test.js
//   7. volume      - k6 run -e SCENARIO=volume load_test.js
//   8. scalability - k6 run -e SCENARIO=scalability load_test.js
//   9. capacity    - k6 run -e SCENARIO=capacity load_test.js
//   10. 500users   - k6 run -e SCENARIO=500users load_test.js
//   11. 1000users  - k6 run -e SCENARIO=1000users load_test.js
const SCENARIO = (__ENV.SCENARIO || (__ENV.VUS ? 'custom' : 'load')).toLowerCase();

function getOptions(scenario) {
  const highConcurrencyThresholds = {
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    http_req_failed: ['rate<0.02'],
    custom_error_rate: ['rate<0.02'],
  };

  const standardThresholds = {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
    custom_error_rate: ['rate<0.01'],
  };

  switch (scenario) {
    // 1. SMOKE TEST: Sanity check minimal traffic (2 VUs, 30s)
    case 'smoke':
      return {
        vus: 2,
        duration: '30s',
        thresholds: standardThresholds,
      };

    // 2. LOAD TEST: Normal expected production traffic (up to 50-100 VUs)
    case 'load':
      return {
        stages: [
          { duration: '15s', target: 30 },  // Ramp up
          { duration: '1m', target: 75 },   // Sustained average load
          { duration: '15s', target: 0 },   // Ramp down
        ],
        thresholds: standardThresholds,
      };

    // 3. STRESS TEST: Pushing beyond normal limits (up to 250-300 VUs)
    case 'stress':
      return {
        stages: [
          { duration: '20s', target: 50 },  // Step 1: Normal
          { duration: '30s', target: 150 }, // Step 2: High
          { duration: '45s', target: 250 }, // Step 3: Extreme stress
          { duration: '15s', target: 0 },   // Cool down
        ],
        thresholds: highConcurrencyThresholds,
      };

    // 4. SPIKE TEST: Sudden violent surge in traffic (ticket drop simulation)
    case 'spike':
      return {
        stages: [
          { duration: '10s', target: 10 },  // Low baseline
          { duration: '10s', target: 350 }, // Sudden surge in 10s
          { duration: '40s', target: 350 }, // Stay at surge peak
          { duration: '10s', target: 10 },  // Drop back to baseline
          { duration: '10s', target: 0 },   // Ramp down
        ],
        thresholds: highConcurrencyThresholds,
      };

    // 5. ENDURANCE (SOAK) TEST: Sustained moderate-heavy load for extended time (15m - 30m)
    case 'endurance':
    case 'soak':
      return {
        stages: [
          { duration: '1m', target: 150 },   // Ramp up
          { duration: '13m', target: 150 },  // Hold for 13 minutes
          { duration: '1m', target: 0 },     // Ramp down
        ],
        thresholds: highConcurrencyThresholds,
      };

    // 6. BREAKPOINT TEST: Incremental ramp to find the exact breaking point
    case 'breakpoint':
      return {
        stages: [
          { duration: '30s', target: 100 },
          { duration: '30s', target: 250 },
          { duration: '30s', target: 450 },
          { duration: '30s', target: 700 },
          { duration: '30s', target: 1000 },
          { duration: '15s', target: 0 },
        ],
        thresholds: highConcurrencyThresholds,
      };

    // 7. VOLUME TEST: High-throughput data & database query stress
    case 'volume':
      return {
        stages: [
          { duration: '20s', target: 100 },
          { duration: '2m', target: 200 },  // High volume queries
          { duration: '20s', target: 0 },
        ],
        thresholds: highConcurrencyThresholds,
      };

    // 8. SCALABILITY TEST: Stepped plateaus to observe response time scaling (50 -> 100 -> 200 -> 400)
    case 'scalability':
      return {
        stages: [
          { duration: '30s', target: 50 },  // Plateau 1: 50 VUs
          { duration: '30s', target: 100 }, // Plateau 2: 100 VUs
          { duration: '30s', target: 200 }, // Plateau 3: 200 VUs
          { duration: '30s', target: 400 }, // Plateau 4: 400 VUs
          { duration: '15s', target: 0 },   // Cool down
        ],
        thresholds: highConcurrencyThresholds,
      };

    // 9. CAPACITY TEST: Max target capacity test (500 - 1000 VUs)
    case 'capacity':
    case '500users':
    case '500':
      return {
        stages: [
          { duration: '30s', target: 500 }, // Smooth 30s ramp up
          { duration: '9m', target: 500 },  // 9 minutes at 500 VUs
          { duration: '30s', target: 0 },   // Cool down
        ],
        thresholds: highConcurrencyThresholds,
      };

    case '1000users':
    case '1000':
      return {
        stages: [
          { duration: '1m', target: 1000 },  // 1-minute ramp up
          { duration: '13m', target: 1000 }, // 13-minute sustained 1000 VU load
          { duration: '1m', target: 0 },     // Cool down
        ],
        thresholds: highConcurrencyThresholds,
      };

    case 'custom':
    default:
      const customVus = parseInt(__ENV.VUS, 10) || 50;
      const customDuration = __ENV.DURATION || '1m';
      return {
        stages: [
          { duration: '10s', target: customVus },
          { duration: customDuration, target: customVus },
          { duration: '10s', target: 0 },
        ],
        thresholds: customVus >= 200 ? highConcurrencyThresholds : standardThresholds,
      };
  }
}

export const options = getOptions(SCENARIO);

export default function () {
  // Scenario 1: Browse Landing & Login Page
  group('01. Public Pages & Static Assets', () => {
    const resHome = http.get(`${BASE_URL}/`, { redirects: 1 });
    const homeOk = check(resHome, {
      'Home page status 200': (r) => r.status === 200 || r.status === 302,
      'Contains valid page content': (r) => r.body && (r.body.includes('action') || r.body.includes('Upcoming Events') || r.body.includes('Events') || r.body.includes('Welcome Back') || r.body.includes('Login')),
    });
    errorRate.add(!homeOk);

    // Static CSS check
    const resCss = http.get(`${BASE_URL}/static/style.css`);
    check(resCss, {
      'Static CSS accessible': (r) => r.status === 200 || r.status === 304,
    });

    sleep(1);
  });

  // Scenario 2: AI Chat Assistant API
  group('02. AI Assistant API', () => {
    const chatPayload = JSON.stringify({
      message: 'Are there any free upcoming hackathons or workshops?',
    });

    const chatParams = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const start = Date.now();
    const resChat = http.post(`${BASE_URL}/api/chat`, chatPayload, chatParams);
    chatResponseTime.add(Date.now() - start);

    const chatOk = check(resChat, {
      'AI Chat status 200': (r) => r.status === 200,
      'AI returns JSON reply': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.reply !== undefined && body.reply.length > 0;
        } catch (_) {
          return false;
        }
      },
    });
    errorRate.add(!chatOk);

    sleep(1);
  });

  // Scenario 3: User Authentication & Authenticated Flow
  group('03. User Login & Dashboard Flow', () => {
    // Authenticate as Admin user
    const loginPayload = {
      action: 'login',
      username: 'admin',
      password: 'password123',
    };

    const resLogin = http.post(`${BASE_URL}/`, loginPayload, {
      redirects: 1, // Follow redirect to /dashboard
    });

    const loginOk = check(resLogin, {
      'Login redirects or returns 200': (r) => r.status === 200 || r.status === 302,
      'Dashboard loaded': (r) => r.body && (r.body.includes('Upcoming Events') || r.body.includes('Events') || r.body.includes('admin')),
    });
    
    if (loginOk) {
      successfulLogins.add(1);
    }
    errorRate.add(!loginOk);

    // Scenario 4: Browse Specific Event Detail
    const eventId = Math.floor(Math.random() * 15) + 1; // Pick random event 1-15
    const resDetail = http.get(`${BASE_URL}/event/${eventId}`);
    const detailOk = check(resDetail, {
      'Event details status 200': (r) => r.status === 200,
    });
    if (!detailOk) {
      console.warn(`[WARN] /event/${eventId} check failed: status=${resDetail.status}`);
    }

    // Scenario 5: Admin Recent Check-ins API
    const resCheckins = http.get(`${BASE_URL}/api/recent_checkins`);
    const checkinsOk = check(resCheckins, {
      'Recent check-ins API status 200': (r) => r.status === 200,
    });
    if (!checkinsOk) {
      console.warn(`[WARN] /api/recent_checkins check failed: status=${resCheckins.status}`);
    }

    sleep(2);
  });
}
