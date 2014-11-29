<<<<<<< HEAD
@ECHO OFF

SET HOME=%~dp0

CALL "%~d0\Libs\setup.bat" > NUL

CALL START /B "AWESOME CMD" CMD /K CLS
=======
@CMD /K "%~d0\Libs\setup.bat"
>>>>>>> b1bcb6c797f3c79bd0d52415ceb21e6241c1aa18
