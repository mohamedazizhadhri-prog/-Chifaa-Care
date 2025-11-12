@echo off
set "CONN_STR=postgresql://neondb_owner:npg_HeYafdV3i6QC@ep-old-dream-agtnppur-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
psql "%CONN_STR%" -f "%~dp0add-doctors-neon.sql"
pause
