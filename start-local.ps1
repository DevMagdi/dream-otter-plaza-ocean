# AEGIS - SQL Server user FGS / 123456 (not Windows Auth)
cd $PSScriptRoot
if (-not (Test-Path ".\aegis.local.json")) {
  Copy-Item ".\aegis.local.example.json" ".\aegis.local.json"
}
if (-not (Test-Path "node_modules")) { npm install }
Write-Host "SQL login: FGS  instance: DESKTOP-A0QINRF\MSSQLSERVERTEST"
npx vite dev --host 0.0.0.0 --port 5173
