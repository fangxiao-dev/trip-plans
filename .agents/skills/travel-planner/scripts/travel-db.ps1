param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillDirectory = Split-Path -Parent $scriptDirectory
$projectRoot = (Resolve-Path (Join-Path $skillDirectory "..\..\..")).Path
$env:TRAVEL_PLANNER_DATA_DIR = Join-Path $projectRoot ".codex-travel\travel-planner"
$databaseScript = Join-Path $scriptDirectory "travel_db.py"

if (-not (Test-Path -LiteralPath $databaseScript)) {
    throw "travel_db.py was not found."
}

$python = Get-Command python -ErrorAction SilentlyContinue
if ($null -ne $python) {
    & $python.Source $databaseScript @Arguments
}
else {
    $pythonLauncher = Get-Command py -ErrorAction SilentlyContinue
    if ($null -eq $pythonLauncher) {
        throw "Python 3 was not found. Install Python 3, then rerun this command."
    }
    & $pythonLauncher.Source -3 $databaseScript @Arguments
}

exit $LASTEXITCODE
