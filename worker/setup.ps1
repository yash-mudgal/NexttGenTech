# =============================================================================
# One-shot setup for the enquiry Worker.
#
#   Run it:   cd "F:\NextGen Software Technologies\worker"
#             .\setup.ps1
#
# It installs dependencies, signs you in to Cloudflare, stores your Resend API
# key as an encrypted secret, and deploys. Safe to re-run — every step checks
# whether it's already done.
#
# The two interactive steps (Cloudflare sign-in, pasting the API key) are
# deliberately yours: the key should go straight from Resend into Cloudflare
# without passing through anything else.
# =============================================================================

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Step($n, $text) { Write-Host "`n[$n] $text" -ForegroundColor Cyan }
function Ok($text)       { Write-Host "    $text" -ForegroundColor Green }
function Warn($text)     { Write-Host "    $text" -ForegroundColor Yellow }

Write-Host "NextGen enquiry Worker - setup" -ForegroundColor White
Write-Host "==============================" -ForegroundColor DarkGray

# ── 1. Dependencies ──────────────────────────────────────────────────────────
Step 1 "Installing dependencies..."
if (Test-Path "node_modules\wrangler") {
    Ok "Already installed, skipping."
} else {
    npm install --no-fund --no-audit
    if ($LASTEXITCODE -ne 0) { throw "npm install failed." }
    Ok "Done."
}

# ── 2. Cloudflare sign-in ────────────────────────────────────────────────────
Step 2 "Checking Cloudflare sign-in..."
$who = npx wrangler whoami 2>&1 | Out-String
if ($who -match "not authenticated") {
    Warn "Not signed in. A browser window will open."
    Warn "Sign in (or create a free account - no card needed), then click Allow."
    Write-Host ""
    npx wrangler login
    if ($LASTEXITCODE -ne 0) { throw "Cloudflare sign-in failed or was cancelled." }
    Ok "Signed in."
} else {
    Ok "Already signed in."
}

# ── 3. Resend API key ────────────────────────────────────────────────────────
Step 3 "Storing the Resend API key..."
Write-Host ""
Write-Host "    Get one at https://resend.com/api-keys" -ForegroundColor Gray
Write-Host "    Create -> permission 'Sending access' -> copy the key (starts 're_')." -ForegroundColor Gray
Write-Host "    Paste it at the prompt below. It is stored encrypted at Cloudflare" -ForegroundColor Gray
Write-Host "    and never written into this repository." -ForegroundColor Gray
Write-Host ""
npx wrangler secret put RESEND_API_KEY
if ($LASTEXITCODE -ne 0) { throw "Storing the secret failed." }
Ok "Stored."

# ── 4. Deploy ────────────────────────────────────────────────────────────────
Step 4 "Deploying the Worker..."
$deploy = npx wrangler deploy 2>&1 | Out-String
Write-Host $deploy
if ($LASTEXITCODE -ne 0) { throw "Deploy failed." }

# ── 5. Report the URL ────────────────────────────────────────────────────────
$url = ([regex]::Match($deploy, "https://[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev")).Value

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Green
if ($url) {
    Write-Host " Deployed:  $url" -ForegroundColor Green
    Write-Host ""
    Write-Host " Health check:" -ForegroundColor Gray
    try {
        $health = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 20
        Write-Host "   $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
    } catch {
        Warn "  Could not reach it yet - it can take a few seconds to go live."
    }
    Write-Host ""
    Write-Host " NEXT: paste that URL into workerEndpoint in" -ForegroundColor White
    Write-Host "       src\config\links.ts, then commit and push." -ForegroundColor White
    Write-Host "       Or just send the URL to Claude and it will do it." -ForegroundColor White
} else {
    Warn "Deployed, but the URL could not be read from the output above."
    Warn "Look for the 'https://....workers.dev' line and use that."
}
Write-Host "=============================================================" -ForegroundColor Green
