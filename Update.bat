@ECHO OFF

SET HOME=%~dp0

CALL "%~d0\Libs\setup.bat" > NUL

CALL Git pull

PAUSE