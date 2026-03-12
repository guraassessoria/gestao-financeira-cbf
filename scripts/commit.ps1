param(
  [Parameter(Mandatory=$true)]
  [string]$Message,
  [Parameter(Mandatory=$false)]
  [string]$Branch = ""
)
$ErrorActionPreference = "Stop"
try {
  $status = git status --short
  if (-not $status) {
    Write-Host "Nada para commitar." -ForegroundColor Gray
    exit 0
  }
  git add .
  git commit -m $Message
  Write-Host "OK Commit: $Message" -ForegroundColor Green
  $currentBranch = if ($Branch) { $Branch } else { git rev-parse --abbrev-ref HEAD }
  git push origin $currentBranch
  Write-Host "OK Sync para origin/$currentBranch" -ForegroundColor Cyan
} catch {
  Write-Host "ERRO: $_" -ForegroundColor Red
  exit 1
}