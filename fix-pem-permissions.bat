@echo off
echo Fixing PEM file permissions...

:: Remove inheritance and all permissions except for current user
icacls "ssh\turntaptravel.pem" /inheritance:r
icacls "ssh\turntaptravel.pem" /grant:r "%USERNAME%:R"

echo PEM permissions fixed!
echo Now run: deploy.bat