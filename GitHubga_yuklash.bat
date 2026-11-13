@echo off
chcp 65001 > nul
title GitHub ga yuklash
echo =======================================================
echo   GitHub ga loyihani yuklash (Push qilish)
echo =======================================================
echo.
git add .
git commit -m "feat: 3D Virtual Romantic Museum with Zulfiya and photo gallery"
echo.
echo GitHubga yuklanmoqda...
git push -u origin main
echo.
if %errorlevel% neq 0 (
    echo =======================================================
    echo [ESLATMA] Agar 'Repository not found' xatoligi chiqsa:
    echo 1. Brauzerda https://github.com/new manzilini oching
    echo 2. Repository name maydoniga 'museum' deb yozing
    echo 3. 'Create repository' tugmasini bosing
    echo 4. Ushbu bat faylni qayta ishga tushiring!
    echo =======================================================
) else (
    echo =======================================================
    echo TABRIKLAYMIZ! Loyiha GitHub profilingizga muvaffaqiyatli yuklandi!
    echo =======================================================
)
pause
