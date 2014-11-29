@ECHO OFF

<<<<<<< HEAD
SET HOME=%~dp0

=======
>>>>>>> b1bcb6c797f3c79bd0d52415ceb21e6241c1aa18
CALL "%~d0\Libs\setup.bat" > NUL

CALL Git pull

PAUSE