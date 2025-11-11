$envPath = ".env"
$content = Get-Content $envPath -Raw
$newUrl = 'DATABASE_URL="postgresql://neondb_owner:npg_HeYafdV3i6QC@ep-lively-sound-agfp605h-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"'
$content = $content -replace 'DATABASE_URL="postgresql://username:password@ep-xxxxx\.us-east-1\.aws\.neon\.tech/neondb\?sslmode=require"', $newUrl
Set-Content $envPath -Value $content -NoNewline
Write-Host "✅ DATABASE_URL updated successfully!"
