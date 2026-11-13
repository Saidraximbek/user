@echo off
chcp 65001 > nul
title 3D Qizchali Virtual Muzey
echo =======================================================
echo   🏛️ 3D Qizchali Virtual Muzey va Rasmlar Galereyasi
echo =======================================================
echo.
echo Server ishga tushirilmoqda, brauzer avtomatik ochiladi...
echo Muzeyni to'xtatish uchun ushbu oynani yopishingiz mumkin.
echo.
start http://localhost:5173
npm run dev -- --host
pause
