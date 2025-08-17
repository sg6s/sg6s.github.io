@echo off
echo 正在停止开发服务器...

REM 查找并停止3000端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 停止进程 PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo 等待进程完全停止...
timeout /t 2 /nobreak >nul

echo 启动开发服务器...
npm run dev
