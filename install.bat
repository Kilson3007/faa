@echo off
echo ========================================
echo    INSTALACAO DO CHATBOT MILITAR
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js primeiro.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js encontrado!

echo.
echo [2/4] Instalando dependencias do backend...
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha na instalacao das dependencias do backend!
    pause
    exit /b 1
)

echo.
echo [3/4] Criando pasta uploads...
if not exist "uploads" mkdir uploads

echo.
echo [4/4] Instalando dependencias do mobile...
cd mobile
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha na instalacao das dependencias do mobile!
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo    INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo PRÓXIMOS PASSOS:
echo 1. Configure sua chave da API Gemini no arquivo .env
echo 2. Adicione seus documentos PDF na pasta uploads/
echo 3. Execute: npm run dev (para o backend)
echo 4. Execute: cd mobile && npm start (para o mobile)
echo.
echo Para mais informacoes, consulte o README.md
echo.
pause 