@ECHO OFF

CALL "%~d0\Libs\setup.bat" > NUL

CALL Git pull

PAUSE