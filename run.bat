@echo off
title ApexPrep JEE Dev Server
echo ====================================================
echo Starting ApexPrep JEE Server...
echo ====================================================

:: Navigate to this script's directory
cd /d "%~dp0"

:: Check if node_modules exists, install if missing
if not exist "node_modules" (
    echo Dependencies missing. Running npm install...
    call npm install
)

:: Launch the default web browser to the local dev URL
echo Opening http://localhost:5173 in browser...
start http://localhost:5173

:: Start the Vite server
echo Starting Vite...
npm run dev

pause