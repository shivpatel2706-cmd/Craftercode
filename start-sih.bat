@echo off
setlocal EnableDelayedExpansion

title METROVERIFY 360 - SIH Launcher

echo.
echo ============================================================
echo              METROVERIFY 360 - SIH PROJECT
echo ============================================================
echo.

set "ROOT=%~dp0"
set "CLIENT=%ROOT%Client"
set "BACKEND=%ROOT%Server\MetroVerify360"
set "ML_ENGINE=%ROOT%Server\ML"

echo [1/4] Node.js
node --version
echo.

echo [2/4] npm
call npm --version
echo.

echo [3/4] .NET
dotnet --version
echo.

echo [4/4] Checking project files...

if not exist "%BACKEND%" (
    echo.
    echo ERROR: MetroVerify360 backend folder was not found.
    echo Expected:
    echo %BACKEND%
    echo.
    pause
    exit /b
)
if not exist "%ML_ENGINE%" (
    echo.
    echo ERROR: Legal Metrology ML Engine was not found.
    echo Expected:
    echo %ML_ENGINE%
    echo.
    pause
    exit /b
)

if not exist "%CLIENT%\package.json" (
    echo.
    echo ERROR: package.json was not found.
    echo Expected:
    echo %CLIENT%\package.json
    echo.
    pause
    exit /b
)

echo Project files found.
echo.

if not exist "%CLIENT%\node_modules" (
    echo node_modules not found.
    echo Installing frontend dependencies...
    echo.

    cd /d "%CLIENT%"
    call npm install

    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed.
        echo.
        pause
        exit /b
    )
)

echo.
echo ============================================================
echo Starting ASP.NET Backend + ML Engine
echo ============================================================
echo.

start "METROVERIFY Backend + ML" cmd /k "cd /d ""%BACKEND%"" && set ""MlEngine__WorkingDirectory=%ML_ENGINE%"" && dotnet run --urls http://0.0.0.0:5051"
echo.
echo Waiting for ASP.NET + ML...
echo.

set /a COUNT=0

:WAIT_BACKEND

powershell -NoProfile -Command "try { Invoke-WebRequest -Uri 'http://localhost:5051/api/ml/health' -UseBasicParsing -TimeoutSec 5 | Out-Null; exit 0 } catch { exit 1 }"

if not errorlevel 1 goto BACKEND_READY

set /a COUNT+=1

echo Waiting for backend... !COUNT!/30

if !COUNT! GEQ 30 (
    echo.
    echo ERROR: ASP.NET backend did not become available.
    echo Check the Backend + ML terminal.
    echo.
    pause
    exit /b
)

timeout /t 2 /nobreak >nul
goto WAIT_BACKEND

:BACKEND_READY

echo.
echo ============================================================
echo BACKEND + ML ENGINE ONLINE
echo ============================================================
echo.

echo Starting React frontend...
echo.

start "METROVERIFY Frontend" cmd /k "cd /d ""%CLIENT%"" && call npm run dev -- --host 0.0.0.0"

echo.
echo Waiting for React...
echo.

set /a COUNT=0

:WAIT_FRONTEND

powershell -NoProfile -Command "try { $r=Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { exit 0 } else { exit 1 } } catch { exit 1 }"

if not errorlevel 1 goto FRONTEND_READY

set /a COUNT+=1

echo Waiting for frontend... !COUNT!/30

if !COUNT! GEQ 30 (
    echo.
    echo ERROR: React frontend did not become available.
    echo Check the Frontend terminal.
    echo.
    pause
    exit /b
)

timeout /t 2 /nobreak >nul
goto WAIT_FRONTEND

:FRONTEND_READY

echo.
echo ============================================================
echo             METROVERIFY 360 IS READY
echo ============================================================
echo.
echo Frontend : http://localhost:3000
echo Backend  : http://localhost:5051
echo ML       : Automatically started by ASP.NET
echo.
echo Opening browser...
echo ============================================================
echo.

start "" "http://localhost:3000"

echo.
echo Keep the Backend and Frontend windows open.
echo.
pause

