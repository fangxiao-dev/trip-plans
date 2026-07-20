param(
    [switch]$InstallOpenCli
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillDirectory = Split-Path -Parent $scriptDirectory
$projectRoot = (Resolve-Path (Join-Path $skillDirectory "..\..\..")).Path
$dataDirectory = Join-Path $projectRoot ".codex-travel\trip-map-builder"
$profileDirectory = Join-Path $dataDirectory "chrome-profile"
$toolsDirectory = Join-Path $dataDirectory "tools"
$extensionDirectory = Join-Path $dataDirectory "opencli-extension"

foreach ($directory in @($dataDirectory, $profileDirectory, $toolsDirectory, $extensionDirectory)) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
}

if ($InstallOpenCli) {
    $npm = Get-Command npm -ErrorAction SilentlyContinue
    if ($null -eq $npm) {
        throw "npm was not found. Install Node.js LTS, then rerun this command."
    }
    & $npm.Source install --prefix $toolsDirectory "@jackwener/opencli"
    if ($LASTEXITCODE -ne 0) {
        throw "OpenCLI installation failed."
    }
}

Write-Output "[OK] Project-local directories are ready: $dataDirectory"
Write-Output "[INFO] Load the Browser Bridge extension from: $extensionDirectory"
