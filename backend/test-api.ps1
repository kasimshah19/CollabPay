function Test-Curl {
    param ($Name, $Command)
    Write-Host "=== $Name ==="
    Invoke-Expression $Command
    Write-Host "`n"
}

Test-Curl "1. GET /api/health" "curl.exe -s http://localhost:5000/api/health"
Test-Curl "2. GET /api/health/ready" "curl.exe -s http://localhost:5000/api/health/ready"

Write-Host "3. Signup as Brand"
$brandRes = curl.exe -s -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d '{\"name\":\"Brand\",\"email\":\"brand@example.com\",\"password\":\"SecurePass123\",\"role\":\"brand\"}'
Write-Host $brandRes
$brandToken = ($brandRes | ConvertFrom-Json).token

Write-Host "`n4. Signup as Creator"
$creatorRes = curl.exe -s -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d '{\"name\":\"Creator\",\"email\":\"creator@example.com\",\"password\":\"SecurePass123\",\"role\":\"creator\"}'
Write-Host $creatorRes
$creatorToken = ($creatorRes | ConvertFrom-Json).token

Write-Host "`n5. Duplicate Email (409)"
curl.exe -s -w "`nHTTP Code: %{http_code}" -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d '{\"name\":\"Creator 2\",\"email\":\"creator@example.com\",\"password\":\"SecurePass123\",\"role\":\"creator\"}'

Write-Host "`n`n6. Weak Password (400)"
curl.exe -s -w "`nHTTP Code: %{http_code}" -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d '{\"name\":\"Creator 3\",\"email\":\"creator3@example.com\",\"password\":\"123\",\"role\":\"creator\"}'

Write-Host "`n`n7. Login Correct Password"
curl.exe -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"brand@example.com\",\"password\":\"SecurePass123\"}'

Write-Host "`n`n8. Login Wrong Password"
curl.exe -s -w "`nHTTP Code: %{http_code}" -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"brand@example.com\",\"password\":\"WrongPass123\"}'

Write-Host "`n`n9. GET /api/auth/me with token"
curl.exe -s -H "Authorization: Bearer $brandToken" http://localhost:5000/api/auth/me

Write-Host "`n`n10. GET /api/auth/me without token"
curl.exe -s -w "`nHTTP Code: %{http_code}" http://localhost:5000/api/auth/me

Write-Host "`n`n11. Brand token on creator-only route (403)"
curl.exe -s -w "`nHTTP Code: %{http_code}" -H "Authorization: Bearer $brandToken" http://localhost:5000/api/_debug/creator-only

Write-Host "`n`n12. Creator token on creator-only route (200)"
curl.exe -s -w "`nHTTP Code: %{http_code}" -H "Authorization: Bearer $creatorToken" http://localhost:5000/api/_debug/creator-only
