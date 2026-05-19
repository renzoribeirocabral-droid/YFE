# Ler .env
$envPath = Join-Path -Path $PSScriptRoot -ChildPath "..\.env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^(.*?)=(.*)$') {
            Set-Content "env:\$($Matches[1])" $Matches[2]
        }
    }
} else {
    Write-Host "Arquivo .env nao encontrado."
    exit 1
}

$apiKey = $env:GOOGLE_API_KEY
$yfeFolderId = $env:DRIVE_YFE_FOLDER_ID
$cacheDir = Join-Path -Path $PSScriptRoot -ChildPath "..\content\drive-cache\YFE"

if (-not (Test-Path $cacheDir)) {
    New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
}

$url = "https://www.googleapis.com/drive/v3/files?q='$yfeFolderId'+in+parents&key=$apiKey&fields=files(id,name,mimeType)"

Write-Host "Sincronizando com Google Drive (YFE)..."

try {
    $response = Invoke-RestMethod -Uri $url -Method Get
    $files = $response.files

    if ($null -ne $files -and $files.Count -gt 0) {
        Write-Host "Foram encontrados $($files.Count) arquivos."
        $manifestPath = Join-Path -Path $cacheDir -ChildPath "manifest.json"
        $files | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath
        Write-Host "Manifesto gerado em: $manifestPath"
    } else {
        Write-Host "Nenhum arquivo encontrado na pasta."
    }
} catch {
    Write-Host "Erro durante a sincronizacao: $_"
}
