@echo off
REM Script to apply the migration to add time to project dates

REM Navigate to the project root
cd /d "%~dp0\..\.."

REM Check if Supabase CLI is installed
where supabase >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Supabase CLI is not installed. Please install it first:
    echo npm install -g supabase
    exit /b 1
)

REM Apply the migration
echo Applying migration to add time to project dates...
supabase db push

REM Check if the migration was successful
if %ERRORLEVEL% equ 0 (
    echo Migration applied successfully!
    echo The project_start_date and project_end_date columns now store both date and time information.
) else (
    echo Failed to apply migration. Please check the error message above.
    exit /b 1
)

echo Done!