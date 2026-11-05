@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul || (echo Потрібен Node.js 20.9 або новіший: https://nodejs.org & pause & exit /b 1)
if not exist node_modules (echo Встановлюю залежності... & call npm install)
if not exist .next\BUILD_ID (echo Збираю сайт... & call npm run build)
start "" http://localhost:3000
call npm start
