async function runTests() {
  const log = (...args) => console.log(...args, '\n');
  const base = 'http://localhost:5000/api';
  
  log("=== 1. GET /api/health ===");
  const healthRes = await fetch(`${base}/health`);
  log(await healthRes.text());
  
  log("=== 2. GET /api/health/ready ===");
  const readyRes = await fetch(`${base}/health/ready`);
  log(await readyRes.text());
  
  log("=== 3. Signup as Brand ===");
  const brandSignup = await fetch(`${base}/auth/signup`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name: 'Brand', email: 'brand1@example.com', password: 'SecurePass123', role: 'brand' })
  });
  const brandData = await brandSignup.json();
  log(brandSignup.status, JSON.stringify(brandData));
  const brandToken = brandData.token;
  
  log("=== 4. Signup as Creator ===");
  const creatorSignup = await fetch(`${base}/auth/signup`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name: 'Creator', email: 'creator1@example.com', password: 'SecurePass123', role: 'creator' })
  });
  const creatorData = await creatorSignup.json();
  log(creatorSignup.status, JSON.stringify(creatorData));
  const creatorToken = creatorData.token;
  
  log("=== 5. Duplicate Email (409) ===");
  const dup = await fetch(`${base}/auth/signup`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name: 'Creator 2', email: 'creator1@example.com', password: 'SecurePass123', role: 'creator' })
  });
  log(dup.status, await dup.text());
  
  log("=== 6. Weak Password (400) ===");
  const weak = await fetch(`${base}/auth/signup`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name: 'Creator 3', email: 'creator3@example.com', password: '123', role: 'creator' })
  });
  log(weak.status, await weak.text());
  
  log("=== 7. Login Correct Password ===");
  const loginOk = await fetch(`${base}/auth/login`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email: 'brand1@example.com', password: 'SecurePass123' })
  });
  log(loginOk.status, await loginOk.text());
  
  log("=== 8. Login Wrong Password (401) ===");
  const loginWrong = await fetch(`${base}/auth/login`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email: 'brand1@example.com', password: 'WrongPass123' })
  });
  log(loginWrong.status, await loginWrong.text());
  
  log("=== 9. GET /api/auth/me with token ===");
  const meOk = await fetch(`${base}/auth/me`, {
    headers: { 'Authorization': `Bearer ${brandToken}` }
  });
  log(meOk.status, await meOk.text());
  
  log("=== 10. GET /api/auth/me without token (401) ===");
  const meFail = await fetch(`${base}/auth/me`);
  log(meFail.status, await meFail.text());
  
  log("=== 11. Brand token on creator-only route (403) ===");
  const creatorOnlyFail = await fetch(`${base}/_debug/creator-only`, {
    headers: { 'Authorization': `Bearer ${brandToken}` }
  });
  log(creatorOnlyFail.status, await creatorOnlyFail.text());
  
  log("=== 12. Creator token on creator-only route (200) ===");
  const creatorOnlyOk = await fetch(`${base}/_debug/creator-only`, {
    headers: { 'Authorization': `Bearer ${creatorToken}` }
  });
  log(creatorOnlyOk.status, await creatorOnlyOk.text());
}
runTests();
