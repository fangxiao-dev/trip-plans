param(
    [switch]$Restart
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillDirectory = Split-Path -Parent $scriptDirectory
$projectRoot = (Resolve-Path (Join-Path $skillDirectory "..\..\..")).Path
$configPath = Join-Path $skillDirectory "config\windows-codex.json"

if (-not (Test-Path -LiteralPath $configPath)) {
    throw "windows-codex.json was not found."
}

$config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
$profileDirectory = Join-Path $projectRoot $config.chromeProfileDirectory
New-Item -ItemType Directory -Force -Path $profileDirectory | Out-Null

$port = $config.remoteDebuggingPort
$existingListener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($existingListener) {
    Write-Output "[OK] Chrome CDP is already listening on http://127.0.0.1:$port"
    exit 0
}

$projectChromeProcesses = @(Get-CimInstance Win32_Process -Filter "Name = 'chrome.exe'" | Where-Object { $_.CommandLine -like "*$profileDirectory*" })
if (($projectChromeProcesses.Count -gt 0) -and $Restart) {
    foreach ($process in $projectChromeProcesses) {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}
elseif ($projectChromeProcesses.Count -gt 0) {
    throw "A project Chrome process is running without a CDP listener. Rerun with -Restart."
}

$candidatePaths = @(
    (Join-Path $env:ProgramFiles "Google\Chrome\Application\chrome.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Google\Chrome\Application\chrome.exe"),
    (Join-Path $env:LOCALAPPDATA "Google\Chrome\Application\chrome.exe")
)
$chromePath = $candidatePaths | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $chromePath) {
    throw "Google Chrome was not found. Install Chrome, then rerun this command."
}

$startupUrl = $config.startupUrl
$arguments = @(
    "--user-data-dir=$profileDirectory",
    "--profile-directory=Default",
    "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=$port",
    $startupUrl
)

$chromeProcess = Start-Process -FilePath $chromePath -ArgumentList $arguments -WindowStyle Hidden -PassThru
$isListening = $false
for ($attempt = 1; $attempt -le 10; $attempt++) {
    Start-Sleep -Seconds 1
    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        $isListening = $true
        break
    }
}

if (-not $isListening) {
    $chromeProcess.Refresh()
    if ($chromeProcess.HasExited) {
        throw "Chrome exited before CDP started."
    }
    throw "Chrome started, but CDP did not listen on port $port."
}

Write-Output "[OK] Chrome CDP is listening on http://127.0.0.1:$port"
