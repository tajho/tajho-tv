@echo off
title FUTBOL TV PRO
cd /d "%~dp0"
start "" /b node server.js >nul 2>&1
timeout /t 1 /nobreak >nul
start http://localhost:8080
exit
