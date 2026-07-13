@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8080
  py -m http.server 8080
) else (
  echo Python was not found. Open index.html directly, or run a local web server in this folder.
  pause
)
