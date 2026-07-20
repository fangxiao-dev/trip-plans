param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
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
$openCliPath = Join-Path $projectRoot ($config.openCliDirectory + "\node_modules\.bin\opencli.cmd")
if (-not (Test-Path -LiteralPath $openCliPath)) {
    throw "Project-local OpenCLI is not installed. Run .\scripts\setup-windows-codex.ps1 -InstallOpenCli first."
}

& $openCliPath @Arguments
exit $LASTEXITCODE
