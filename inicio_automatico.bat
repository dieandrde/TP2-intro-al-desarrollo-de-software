:: esto es basicamente un pequeño script para no tener que levantar los contenedores de manera manual.
:: ademas tanto backend como front son accesibles en un solo click

@echo off
echo ===================================================
echo   INICIANDO SISTEMA DE GESTION DE CANCHAS (no soy un virus)
echo ===================================================
echo.

docker compose up -d

echo.
echo   EL SISTEMA YA ESTA CORRIENDO
echo ---------------------------------------------------
echo   FRONTEND:  http://localhost:8081
echo   BACKEND:   http://localhost:3000
echo ---------------------------------------------------
echo.
echo (_8(I)  omero
)
echo.
echo presiona cualquier tecla para ver los logs o cerra la ventana
pause
docker compose logs -f