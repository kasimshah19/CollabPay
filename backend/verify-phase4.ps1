$ErrorActionPreference = "Stop"
$BASE_URL = "http://localhost:5000/api"

function Write-Step {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Invoke-JsonReq {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Token = $null
    )
    $Uri = "$BASE_URL$Path"
    $Headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $Headers["Authorization"] = "Bearer $Token" }
    
    $Params = @{
        Uri = $Uri
        Method = $Method
        Headers = $Headers
        SkipHttpErrorCheck = $true
    }
    if ($Body) { $Params.Body = ($Body | ConvertTo-Json -Depth 10) }
    
    Invoke-RestMethod @Params -ResponseHeadersVariable headers | Out-Null
    $StatusCode = $headers["StatusCode"]
    if (-not $StatusCode) { $StatusCode = "200" } # Invoke-RestMethod sometimes doesn't expose it easily in PS5 without Try/Catch, let's use Invoke-WebRequest instead for better status code visibility.
}

function Send-Req {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Token = $null
    )
    $Uri = "$BASE_URL$Path"
    $Headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $Headers["Authorization"] = "Bearer $Token" }
    
    $Params = @{
        Uri = $Uri
        Method = $Method
        Headers = $Headers
        UseBasicParsing = $true
    }
    if ($Body) { $Params.Body = ($Body | ConvertTo-Json -Depth 10) }
    
    try {
        $Response = Invoke-WebRequest @Params
        $Content = if ($Response.Content) { $Response.Content | ConvertFrom-Json } else { $null }
        return @{ StatusCode = $Response.StatusCode; Body = $Content }
    } catch {
        $Response = $_.Exception.Response
        $Content = ""
        if ($Response) {
            $Reader = New-Object System.IO.StreamReader($Response.GetResponseStream())
            $Content = $Reader.ReadToEnd() | ConvertFrom-Json
        }
        return @{ StatusCode = [int]$Response.StatusCode; Body = $Content }
    }
}

Write-Step "Registering users"
$B = Send-Req -Method POST -Path "/auth/signup" -Body @{ name="Brand"; email="brand4@test.com"; password="password123"; role="brand" }
$brandToken = $B.Body.token
Write-Host "Brand registered: $($B.StatusCode)"

$C1 = Send-Req -Method POST -Path "/auth/signup" -Body @{ name="Creator1"; email="creator4_1@test.com"; password="password123"; role="creator" }
$c1Token = $C1.Body.token
Write-Host "Creator 1 registered: $($C1.StatusCode)"

$C2 = Send-Req -Method POST -Path "/auth/signup" -Body @{ name="Creator2"; email="creator4_2@test.com"; password="password123"; role="creator" }
$c2Token = $C2.Body.token
Write-Host "Creator 2 registered: $($C2.StatusCode)"

Write-Step "Test RBAC: Creator tries to create campaign"
$rb = Send-Req -Method POST -Path "/campaigns" -Token $c1Token -Body @{ title="Test"; budgetPaise=1000; feePerCreatorPaise=100; slots=1; applicationDeadline="2030-01-01T00:00:00Z"; submissionDeadline="2030-01-02T00:00:00Z" }
Write-Host "Status: $($rb.StatusCode)"
Write-Host "Body: $($rb.Body | ConvertTo-Json)"

Write-Step "Brand creates campaign (1 slot)"
$res = Send-Req -Method POST -Path "/campaigns" -Token $brandToken -Body @{ title="Campaign 1"; budgetPaise=50000; feePerCreatorPaise=20000; slots=1; applicationDeadline="2030-01-01T00:00:00Z"; submissionDeadline="2030-01-02T00:00:00Z" }
Write-Host "Status: $($res.StatusCode)"
$campaignId = $res.Body._id
Write-Host "Campaign ID: $campaignId"

Write-Step "Creator lists open campaigns"
$res = Send-Req -Method GET -Path "/campaigns" -Token $c1Token
Write-Host "Status: $($res.StatusCode)"
Write-Host "First campaign payoutPreview: $($res.Body[0].payoutPreview | ConvertTo-Json)"

Write-Step "Creator 1 applies"
$res = Send-Req -Method POST -Path "/campaigns/$campaignId/apply" -Token $c1Token -Body @{ note="Hi" }
Write-Host "Status: $($res.StatusCode)"
$app1Id = $res.Body._id

Write-Step "Creator 1 duplicate apply (expect 409)"
$res = Send-Req -Method POST -Path "/campaigns/$campaignId/apply" -Token $c1Token -Body @{ note="Again" }
Write-Host "Status: $($res.StatusCode)"
Write-Host "Error Code: $($res.Body.error.code)"

Write-Step "Creator 2 applies"
$res = Send-Req -Method POST -Path "/campaigns/$campaignId/apply" -Token $c2Token -Body @{ note="Me too" }
$app2Id = $res.Body._id
Write-Host "Status: $($res.StatusCode)"

Write-Step "Brand lists applicants"
$res = Send-Req -Method GET -Path "/campaigns/$campaignId/applications" -Token $brandToken
Write-Host "Status: $($res.StatusCode)"
Write-Host "Applicants count: $($res.Body.Length)"

Write-Step "Brand approves Creator 1"
$res = Send-Req -Method POST -Path "/applications/$app1Id/approve" -Token $brandToken
Write-Host "Status: $($res.StatusCode)"

Write-Step "Check campaign reservedPaise and slotsLeft"
$res = Send-Req -Method GET -Path "/campaigns/$campaignId" -Token $brandToken
Write-Host "Status: $($res.StatusCode)"
Write-Host "slotsLeft: $($res.Body.slotsLeft), reservedPaise: $($res.Body.reservedPaise)"

Write-Step "Brand approves Creator 2 beyond slots (expect error)"
$res = Send-Req -Method POST -Path "/applications/$app2Id/approve" -Token $brandToken
Write-Host "Status: $($res.StatusCode)"
Write-Host "Error Message: $($res.Body.error.message)"

Write-Step "Brand tries to edit slots to 0 (expect error)"
$res = Send-Req -Method PATCH -Path "/campaigns/$campaignId" -Token $brandToken -Body @{ slots=0 }
Write-Host "Status: $($res.StatusCode)"
Write-Host "Error details: $($res.Body | ConvertTo-Json -Depth 5)"

Write-Step "Creator 1 withdraws"
$res = Send-Req -Method POST -Path "/applications/$app1Id/withdraw" -Token $c1Token
Write-Host "Status: $($res.StatusCode)"

Write-Step "Check campaign reservedPaise and slotsLeft after withdraw"
$res = Send-Req -Method GET -Path "/campaigns/$campaignId" -Token $brandToken
Write-Host "slotsLeft: $($res.Body.slotsLeft), reservedPaise: $($res.Body.reservedPaise)"

Write-Step "Brand cancels campaign"
$res = Send-Req -Method POST -Path "/campaigns/$campaignId/cancel" -Token $brandToken
Write-Host "Status: $($res.StatusCode)"

Write-Step "Check Creator 2 application status (should be rejected)"
$res = Send-Req -Method GET -Path "/applications/mine" -Token $c2Token
Write-Host "Status: $($res.StatusCode)"
Write-Host "App 2 status: $($res.Body[0].status), reason: $($res.Body[0].rejectionReason)"
