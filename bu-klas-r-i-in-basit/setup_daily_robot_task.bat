@echo off
setlocal EnableExtensions

cd /d "%~dp0"
set "ROBOT_HOME=%CD%"
set "TASK_NAME=FutbolLaboratuvariRobotGunluk"
set "RUN_TIME=08:30"

echo Futbol Laboratuvari gunluk robot gorevi kuruluyor...
echo Gorev adi: %TASK_NAME%
echo Calisma saati: %RUN_TIME%
echo Calisacak dosya: %ROBOT_HOME%\run_robot.bat
echo.

schtasks /Create /TN "%TASK_NAME%" /TR "\"%ROBOT_HOME%\run_robot.bat\"" /SC DAILY /ST %RUN_TIME% /F

if errorlevel 1 (
    echo.
    echo HATA: Gorev olusturulamadi.
    echo Bu dosyayi yonetici olarak calistirmayi deneyebilirsin.
    echo.
    pause
    exit /b 1
)

echo.
echo Gunluk robot gorevi kuruldu.
echo Robot her gun %RUN_TIME% saatinde calisir ve web site veri esitlemesini yapar.
echo GitHub Pages'e yansimasi icin GitHub Desktop ile commit/push gerekir.
echo.
pause
