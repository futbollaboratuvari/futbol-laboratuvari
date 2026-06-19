@echo off
setlocal EnableExtensions

cd /d "%~dp0"
set "ROBOT_HOME=%CD%"

echo Futbol Laboratuvari V1 robotu baslatiliyor...
echo.

if not exist "%ROBOT_HOME%\outputs" mkdir "%ROBOT_HOME%\outputs"
if not exist "%ROBOT_HOME%\data" mkdir "%ROBOT_HOME%\data"

set "PYTHON_CMD="

if exist ".venv\Scripts\python.exe" (
    set "PYTHON_CMD=""%ROBOT_HOME%\.venv\Scripts\python.exe"""
) else (
    if exist "venv\Scripts\python.exe" (
        set "PYTHON_CMD=""%ROBOT_HOME%\venv\Scripts\python.exe"""
    )
)

if "%PYTHON_CMD%"=="" (
    if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" (
        set "PYTHON_CMD=""%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"""
    )
)

if "%PYTHON_CMD%"=="" (
    where.exe py >nul 2>nul && py -3 --version >nul 2>nul && set "PYTHON_CMD=py -3"
)

if "%PYTHON_CMD%"=="" (
    where.exe python >nul 2>nul && python --version >nul 2>nul && set "PYTHON_CMD=python"
)

if "%PYTHON_CMD%"=="" (
    echo HATA: Python bulunamadi.
    echo Lutfen Python 3 kur veya proje icinde .venv olustur.
    echo.
    pause
    exit /b 1
)

echo API anahtari kontrol sirasi:
echo 1. FOOTBALL_DATA_API_KEY
echo 2. API_FOOTBALL_KEY
echo 3. API_FOOTBALL_KEY2
echo.
echo API durumu robot tarafindan kontrol edilecek.
echo.

echo Kullanilan Python: %PYTHON_CMD%
echo.

%PYTHON_CMD% "%ROBOT_HOME%\src\robot.py"

if errorlevel 1 (
    echo.
    echo HATA: Robot calisirken sorun olustu. Yukaridaki hata mesajini kontrol et.
    echo.
    pause
    exit /b 1
)

echo.
echo Web site veri esitlemesi baslatiliyor...
%PYTHON_CMD% "%ROBOT_HOME%\src\web_site_esitleyici.py" --push --message "Canli veri otomatik guncellendi"

if errorlevel 1 (
    echo.
    echo UYARI: Web site veri esitlemesi tamamlanamadi. Robot raporlari yerel klasorde duruyor.
)

echo.
echo Rapor hedefi: outputs\bugunun_en_guclu_maclari.md
echo.

if exist "%ROBOT_HOME%\outputs\bugunun_en_guclu_maclari.md" (
    echo Rapor aciliyor...
    start "" notepad "%ROBOT_HOME%\outputs\bugunun_en_guclu_maclari.md"
) else (
    echo UYARI: Rapor dosyasi bulunamadi.
)

pause
