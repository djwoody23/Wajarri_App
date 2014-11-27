@ECHO OFF

SET HOME=%~dp0

CALL "%~d0\Libs\setup.bat" > NUL

CD %HOME%\www
CALL phonegap build android

CD %HOME%
COPY "platforms\android\ant-build\*-debug.apk" "."

PAUSE