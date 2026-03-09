@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  start_dev.bat - Dragon Gold Android Development Launcher
REM  Wrapper for start_dev.py
REM
REM  Usage:
REM    start_dev.bat             - Use default AVD (Pixel_9)
REM    start_dev.bat Pixel_9     - Specify AVD name explicitly
REM
REM  Location: r:\Coding_Projects\_dragonGold\scripts\start_dev.bat
REM ============================================================

REM Resolve the directory this .bat file lives in (works from any cwd)
set "SCRIPT_DIR=%~dp0"
set "PYTHON_SCRIPT=%SCRIPT_DIR%start_dev.py"

REM -------------------------------------------------------
REM  Verify Python is available
REM -------------------------------------------------------
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found in PATH.
    echo         Install Python 3.9+ from https://www.python.org/
    echo         Ensure "Add to PATH" was checked during installation.
    exit /b 1
)

REM -------------------------------------------------------
REM  Verify the Python script exists
REM -------------------------------------------------------
if not exist "%PYTHON_SCRIPT%" (
    echo [ERROR] Python script not found: %PYTHON_SCRIPT%
    echo         Expected location: r:\Coding_Projects\_dragonGold\scripts\start_dev.py
    exit /b 1
)

REM -------------------------------------------------------
REM  Run the Python script, forwarding all arguments
REM  %* passes all command-line arguments as-is
REM -------------------------------------------------------
python "%PYTHON_SCRIPT%" %*

REM Forward the exit code from the Python script
exit /b %errorlevel%
