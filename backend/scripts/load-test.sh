#!/bin/bash

# Script de Load Testing pour BABYLONE
# Simule 5000 utilisateurs pour tester la charge
# Prérequis: Installer k6 (https://k6.io/docs/getting-started/installation/)

set -e

API_URL="${API_URL:-http://localhost:3000/api/v1}"
USERS="${USERS:-5000}"
DURATION="${DURATION:-5m}"

echo "🧪 Starting Load Test"
echo "API URL: $API_URL"
echo "Users: $USERS"
echo "Duration: $DURATION"

# Vérifier que k6 est installé
if ! command -v k6 &> /dev/null; then
  echo "❌ k6 is not installed"
  echo "Install it from: https://k6.io/docs/getting-started/installation/"
  exit 1
fi

# Créer le script de test k6
cat > /tmp/babylone-load-test.js <<'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp-up: 0 à 100 utilisateurs en 1min
    { duration: '3m', target: 100 },   // Stabilité: 100 utilisateurs pendant 3min
    { duration: '1m', target: 500 },   // Ramp-up: 100 à 500 utilisateurs en 1min
    { duration: '3m', target: 500 },   // Stabilité: 500 utilisateurs pendant 3min
    { duration: '1m', target: 1000 },  // Ramp-up: 500 à 1000 utilisateurs en 1min
    { duration: '3m', target: 1000 },  // Stabilité: 1000 utilisateurs pendant 3min
    { duration: '1m', target: 0 },     // Ramp-down: 1000 à 0 utilisateurs en 1min
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes doivent être < 500ms
    http_req_failed: ['rate<0.01'],   // Taux d'erreur < 1%
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

export default function () {
  // Test 1: Health Check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // Test 2: Recherche de professionnels (sans auth)
  const searchParams = {
    latitude: '4.0500',
    longitude: '9.7000',
    radius: '5000',
    pays_code: 'CM',
  };
  const searchRes = http.get(`${BASE_URL}/professionals/search`, { params: searchParams });
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  // Test 3: Feed social (sans auth pour test)
  const feedRes = http.get(`${BASE_URL}/social/feed?limit=20`);
  check(feedRes, {
    'feed status is 200': (r) => r.status === 200,
    'feed response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1); // Pause entre les requêtes
}
EOF

# Exécuter le test
echo "🚀 Running load test..."
k6 run --env API_URL="$API_URL" /tmp/babylone-load-test.js

# Nettoyer
rm -f /tmp/babylone-load-test.js

echo "✅ Load test completed"

