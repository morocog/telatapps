<#
.SYNOPSIS
    Automated Git synchronization utility for Telat Group workspace.
    Works dynamically for both personal (moroc) and work (SDVP) environments.
.PARAMETER Action
    Specifies whether to 'push' (save local changes) or 'pull' (retrieve remote changes).
#>
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("push", "pull")]
    [string]$Action
)

# Detect workspace path dynamically based on USERPROFILE
$WorkDir = "$env:USERPROFILE\Documents\GitHub"
if (-not (Test-Path $WorkDir)) {
    Write-Error "Workspace directory not found at: $WorkDir"
    exit 1
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "      TELAT WORKSPACE GIT SYNC - MODE: $($Action.ToUpper())      " -ForegroundColor Cyan
Write-Host "      Target directory: $WorkDir" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Get all directories containing a .git folder
$repos = Get-ChildItem -Path $WorkDir -Directory | Where-Object {
    Test-Path "$($_.FullName)\.git"
}

if ($repos.Count -eq 0) {
    Write-Host "No Git repositories found." -ForegroundColor Yellow
    exit 0
}

if ($Action -eq "push") {
    Write-Host "Scanning for uncommitted changes or unpushed commits..." -ForegroundColor Yellow
    foreach ($repo in $repos) {
        $name = $repo.Name
        $path = $repo.FullName
        
        # Check current branch
        $branch = (git -C $path branch --show-current).Trim()
        if (-not $branch) { $branch = "main" }
        
        # Check git status
        $status = git -C $path status --porcelain
        
        # Check for unpushed commits (only if there is a tracked upstream branch)
        $unpushed = $null
        git -C $path rev-parse --abbrev-ref "@{u}" 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $unpushed = git -C $path cherry -v
        }
        
        if ($status -or $unpushed) {
            Write-Host "`n[+] Repository: $name ($branch)" -ForegroundColor Yellow
            
            if ($status) {
                Write-Host " -> Found uncommitted changes. Staging and committing..." -ForegroundColor DarkYellow
                git -C $path add -A
                git -C $path commit -m "sync: auto-commit before machine switch"
            }
            
            Write-Host " -> Pushing changes to remote..." -ForegroundColor Green
            $pushResult = git -C $path push origin $branch 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host " -> Successfully pushed!" -ForegroundColor Green
            } else {
                Write-Warning " -> Push failed for $name. Error: $pushResult"
            }
        }
    }
    Write-Host "`nAll active repositories have been backed up!" -ForegroundColor Green
}
elseif ($Action -eq "pull") {
    Write-Host "Pulling latest changes for all repositories..." -ForegroundColor Yellow
    foreach ($repo in $repos) {
        $name = $repo.Name
        $path = $repo.FullName
        
        # Check current branch
        $branch = (git -C $path branch --show-current).Trim()
        if (-not $branch) { $branch = "main" }
        
        Write-Host "`n[+] Repository: $name ($branch)" -ForegroundColor Yellow
        Write-Host " -> Pulling from origin..." -ForegroundColor DarkYellow
        $pullResult = git -C $path pull origin $branch 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " -> Successfully updated!" -ForegroundColor Green
        } else {
            Write-Warning " -> Pull failed or merge conflicts. Error: $pullResult"
        }
    }
    Write-Host "`nAll repositories are now synchronized!" -ForegroundColor Green
}
