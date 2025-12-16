@echo off
setlocal


REM === Configurações ===

powershell -Command "npm run build"

REM Caminho da pasta que você quer zipar
set "sourceFolder=C:\Users\bento.julio\Documents\projects\AMA\AMS(React)\dist"

REM Caminho e nome do arquivo zip de saída
set "zipFile=C:\Users\bento.julio\Documents\projects\AMA\AMS(React)\dist.zip"

REM === Comando PowerShell para criar o zip ===
powershell -Command "Compress-Archive -Path '%sourceFolder%\*' -DestinationPath '%zipFile%' -Force"

echo Pasta zipada com sucesso para: %zipFile%

pause