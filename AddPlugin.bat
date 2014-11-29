@ECHO OFF

CALL "%~d0\Libs\setup.bat" > NUL

IF EXIST %1 DO (
	SET PLUGIN=%1
	GOTO :install
)

SET /P PLUGIN=Paste plugin address here: 

:install

phonegap plugins add %PLUGIN%

PAUSE