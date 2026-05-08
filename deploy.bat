@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   DEPLOY QUAN LY CONG VIEC
echo ========================================
echo.

echo [1/3] Dang commit code...
git add -A
git commit -m "Update %date% %time%"
git push

echo.
echo [2/3] Dang deploy len Vercel...
call npx vercel --prod

echo.
echo ========================================
echo   DEPLOY XONG!
echo ========================================
echo.
pause
