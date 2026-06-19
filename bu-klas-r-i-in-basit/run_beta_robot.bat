@echo off
setlocal EnableExtensions

cd /d "%~dp0"
set "ROBOT_HOME=%CD%"

echo Futbol Laboratuvari Beta robotu baslatiliyor...
echo.

if not exist "%ROBOT_HOME%\outputs" mkdir "%ROBOT_HOME%\outputs"
if not exist "%ROBOT_HOME%\data" mkdir "%ROBOT_HOME%\data"

set "PYTHON_CMD="

if exist ".venv\Scripts\python.exe" set "PYTHON_CMD=""%ROBOT_HOME%\.venv\Scripts\python.exe"""
if "%PYTHON_CMD%"=="" if exist "venv\Scripts\python.exe" set "PYTHON_CMD=""%ROBOT_HOME%\venv\Scripts\python.exe"""
if "%PYTHON_CMD%"=="" where.exe py >nul 2>nul && py -3 --version >nul 2>nul && set "PYTHON_CMD=py -3"
if "%PYTHON_CMD%"=="" where.exe python >nul 2>nul && python --version >nul 2>nul && set "PYTHON_CMD=python"

if "%PYTHON_CMD%"=="" (
    echo HATA: Python bulunamadi.
    pause
    exit /b 1
)

echo Kullanilan Python: %PYTHON_CMD%
echo.

%PYTHON_CMD% "%ROBOT_HOME%\src\robot.py"
if errorlevel 1 (
    echo HATA: Robot calisirken sorun olustu.
    pause
    exit /b 1
)

%PYTHON_CMD% "%ROBOT_HOME%\src\beta_modu.py"
%PYTHON_CMD% "%ROBOT_HOME%\src\web_site_esitleyici.py" --push --message "Beta robot verileri web sitesine aktarildi"

echo.
echo Beta robot akisi tamamlandi.
echo Rapor: outputs\bugunun_en_guclu_maclari.md
pause
