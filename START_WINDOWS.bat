@echo off
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel% equ 0 (
  py -3 RUN_GAME.py
) else (
  python RUN_GAME.py
)
pause
