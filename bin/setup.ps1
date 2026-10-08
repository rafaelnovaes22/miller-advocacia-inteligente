# Setup idempotente para Windows. Pode rodar N vezes.
$ErrorActionPreference = "Stop"

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Error "ERRO: node >=20 nao encontrado. Instale https://nodejs.org"
  exit 1
}

$major = (& node -p "process.versions.node.split('.')[0]")
if ([int]$major -lt 20) {
  Write-Error ("ERRO: node " + (& node -v) + " < 20")
  exit 1
}

npm ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run typecheck
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm test
