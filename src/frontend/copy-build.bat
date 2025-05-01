@echo off
echo Copying build files to static directory...
xcopy /E /I /Y build\* ..\main\resources\static\
echo Done! 