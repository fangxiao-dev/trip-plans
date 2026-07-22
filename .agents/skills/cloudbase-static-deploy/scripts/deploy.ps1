[CmdletBinding()]
param(
    [string]$EnvId = 'cloud1-2g1x6jkhb2b6aa8d',
    [string]$SourceDir = (Join-Path $PSScriptRoot '..\..\..\..\outputs'),
    [int]$Concurrency = 5,
    [int]$RetryCount = 3
)

$ErrorActionPreference = 'Stop'

function Invoke-Tcb {
    param([Parameter(Mandatory)][string[]]$Arguments)
    & npx.cmd --yes --package '@cloudbase/cli@latest' tcb @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "CloudBase CLI failed (exit code $LASTEXITCODE): tcb $($Arguments -join ' ')"
    }
}

function Get-TcbText {
    param([Parameter(Mandatory)][string[]]$Arguments)
    $lines = @(& npx.cmd --yes --package '@cloudbase/cli@latest' tcb @Arguments 2>&1)
    if ($LASTEXITCODE -ne 0) {
        throw "CloudBase CLI failed (exit code $LASTEXITCODE): tcb $($Arguments -join ' ')"
    }
    return ($lines -join "`n")
}

$source = [IO.Path]::GetFullPath($SourceDir)
if (-not (Test-Path -LiteralPath $source -PathType Container)) {
    throw "Static source directory does not exist: $source"
}
if (-not (Test-Path -LiteralPath (Join-Path $source 'index.html') -PathType Leaf)) {
    throw "Static source must contain index.html: $source"
}
if ($Concurrency -lt 1 -or $RetryCount -lt 0) {
    throw 'Concurrency must be at least 1 and RetryCount cannot be negative.'
}

$stage = Join-Path ([IO.Path]::GetTempPath()) ('cloudbase-static-site-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $stage | Out-Null

try {
    $sourceRoot = [IO.Path]::GetFullPath($source).TrimEnd('\')
    Get-ChildItem -LiteralPath $sourceRoot -Recurse -Force |
        Where-Object { $_.FullName -notmatch '[\\/]\.chrome-profile([\\/]|$)' } |
        ForEach-Object {
            if (-not $_.PSIsContainer -and $_.Length -gt 50MB) {
                throw "Refusing to upload file larger than 50 MB: $($_.FullName)"
            }
            $relative = $_.FullName.Substring($sourceRoot.Length).TrimStart('\', '/')
            $destination = Join-Path $stage $relative
            if ($_.PSIsContainer) {
                New-Item -ItemType Directory -Force -Path $destination | Out-Null
            } else {
                New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
                Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
            }
        }

    $files = @(Get-ChildItem -LiteralPath $stage -Recurse -File)
    if ($files.Count -eq 0) {
        throw 'The staging directory is empty.'
    }
    $totalMB = [math]::Round((($files | Measure-Object Length -Sum).Sum / 1MB), 2)

    try {
        Get-TcbText @('hosting', 'list', '-e', $EnvId) | Out-Null
    } catch {
        Write-Host 'CloudBase CLI is not authorized. Starting device login...' -ForegroundColor Yellow
        Invoke-Tcb @('login', '--flow', 'device')
    }

    Write-Host "Uploading $($files.Count) files ($totalMB MB) to $EnvId..."
    Invoke-Tcb @('hosting', 'deploy', $stage, '-e', $EnvId, '--concurrency', "$Concurrency", '--retry-count', "$RetryCount", '--retry-interval', '2000')

    $detail = Get-TcbText @('hosting', 'detail', '-e', $EnvId, '--json')
    $domainMatch = [regex]::Match($detail, '"cdnDomain"\s*:\s*"([^"]+)"')
    if (-not $domainMatch.Success) {
        throw 'Deployment succeeded but CloudBase did not return a CDN domain.'
    }
    $baseUrl = 'https://' + $domainMatch.Groups[1].Value.TrimEnd('/')

    foreach ($path in @('/', '/thailand-honeymoon-map.html')) {
        $response = Invoke-WebRequest -Uri ($baseUrl + $path) -MaximumRedirection 0 -SkipHttpErrorCheck
        if ($response.StatusCode -ne 200) {
            throw "HTTP verification failed for $($path): $($response.StatusCode)"
        }
    }

    [pscustomobject]@{
        EnvId = $EnvId
        UploadedFiles = $files.Count
        UploadedMB = $totalMB
        Url = $baseUrl + '/'
        Verified = $true
    } | Format-List
} finally {
    if (Test-Path -LiteralPath $stage) {
        Remove-Item -LiteralPath $stage -Recurse -Force
    }
}
