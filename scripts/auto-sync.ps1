param(
  [Parameter(Mandatory = $false)]
  [int]$IntervalSeconds = 12,
  [Parameter(Mandatory = $false)]
  [string]$Branch = ""
)

$ErrorActionPreference = "Continue"

function Test-GitBusyState {
  if (Test-Path ".git\MERGE_HEAD") { return $true }
  if (Test-Path ".git\rebase-merge") { return $true }
  if (Test-Path ".git\rebase-apply") { return $true }
  return $false
}

Write-Host "[auto-sync] iniciado (intervalo: $IntervalSeconds s)" -ForegroundColor Cyan

while ($true) {
  try {
    if (Test-GitBusyState) {
      Write-Host "[auto-sync] git ocupado (merge/rebase em andamento), aguardando..." -ForegroundColor Yellow
      Start-Sleep -Seconds $IntervalSeconds
      continue
    }

    $status = git status --porcelain
    if (-not $status) {
      Start-Sleep -Seconds $IntervalSeconds
      continue
    }

    git add -A

    $commitMessage = "chore(auto-sync): $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage | Out-Null

    if ($LASTEXITCODE -ne 0) {
      Start-Sleep -Seconds $IntervalSeconds
      continue
    }

    $currentBranch = if ($Branch) { $Branch } else { (git rev-parse --abbrev-ref HEAD).Trim() }

    git pull --rebase --autostash origin $currentBranch | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Host "[auto-sync] falha no pull --rebase. Resolva conflitos e reinicie o auto-sync." -ForegroundColor Red
      Start-Sleep -Seconds $IntervalSeconds
      continue
    }

    git push origin $currentBranch | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Host "[auto-sync] falha no push para origin/$currentBranch" -ForegroundColor Red
      Start-Sleep -Seconds $IntervalSeconds
      continue
    }

    Write-Host "[auto-sync] commit + sync concluido: $commitMessage" -ForegroundColor Green
  } catch {
    Write-Host "[auto-sync] erro: $_" -ForegroundColor Red
  }

  Start-Sleep -Seconds $IntervalSeconds
}
