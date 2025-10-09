@echo off
echo Advanced PEM permissions fix...

:: Remove all permissions
icacls "ssh\turntaptravel.pem" /inheritance:r /grant:r "%USERNAME%:(R)" /remove "NT AUTHORITY\Authenticated Users" /remove "BUILTIN\Users" /remove "Everyone"

:: Set owner
takeown /f "ssh\turntaptravel.pem"

echo Done! Try deploy.bat again