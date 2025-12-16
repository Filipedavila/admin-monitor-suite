@echo off
setlocal

REM === Configurações ===
set "USER=dev"
set "SERVER=10.55.37.17"
set "DEST_PATH=/var/www/html/ams"
set "LOCAL_ZIP=C:\Users\bento.julio\Documents\projects\AMA\AMS(React)\dist.zip"

REM === Verifica se o arquivo zip existe ===
if not exist "%LOCAL_ZIP%" (
    echo Arquivo "%LOCAL_ZIP%" não encontrado!
    pause
    exit /b
)

echo Enviando o arquivo ZIP para o servidor...
scp "%LOCAL_ZIP%" %USER%@%SERVER%:%DEST_PATH%

echo Extraindo o ZIP no destino final...
ssh %USER%@%SERVER% "unzip -o %DEST_PATH%/dist.zip -d %DEST_PATH% && rm %DEST_PATH%/dist.zip"

echo ---
echo Deploy finalizado com sucesso!
pause
