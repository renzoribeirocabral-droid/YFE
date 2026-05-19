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
$cacheDir = Join-Path -Path $PSScriptRoot -ChildPath "..\content\drive-cache"

if (-not (Test-Path $cacheDir)) {
    New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
}

function Sync-Folder {
    param (
        [string]$folderId,
        [string]$localPath
    )

    if (-not (Test-Path $localPath)) {
        New-Item -ItemType Directory -Path $localPath -Force | Out-Null
    }

    $url = "https://www.googleapis.com/drive/v3/files?q='$folderId'+in+parents+and+trashed=false&key=$apiKey&fields=files(id,name,mimeType)"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get
        $files = $response.files

        if ($null -ne $files) {
            foreach ($file in $files) {
                $fileName = $file.name
                $fileId = $file.id
                $mimeType = $file.mimeType
                $targetPath = Join-Path -Path $localPath -ChildPath $fileName

                if ($mimeType -eq "application/vnd.google-apps.folder") {
                    Write-Host "Entrando na subpasta: $fileName"
                    Sync-Folder -folderId $fileId -localPath $targetPath
                } else {
                    Write-Host "Baixando arquivo: $fileName"
                    
                    if ($mimeType -eq "application/vnd.google-apps.document") {
                        # Google Docs precisam ser exportados como texto plano ou HTML. Exportaremos como txt.
                        $exportUrl = "https://www.googleapis.com/drive/v3/files/$fileId/export?mimeType=text/plain&key=$apiKey"
                        $exportPath = $targetPath + ".txt"
                        Invoke-RestMethod -Uri $exportUrl -OutFile $exportPath
                    } else {
                        # Arquivos binarios normais (.jpg, .png, .json, .txt)
                        $downloadUrl = "https://www.googleapis.com/drive/v3/files/$fileId?alt=media&key=$apiKey"
                        Invoke-RestMethod -Uri $downloadUrl -OutFile $targetPath
                    }
                }
            }
        }
    } catch {
        Write-Host "Erro ao sincronizar pasta $folderId - $_"
    }
}

Write-Host "Sincronizando com Google Drive..."
Sync-Folder -folderId $yfeFolderId -localPath $cacheDir
Write-Host "Sincronizacao concluida com sucesso!"
