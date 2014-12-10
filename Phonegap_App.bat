@ECHO OFF

CALL %~d0\Libs\Setup.bat > NUL
DEL Phonegap_App.zip
7z a -tzip Phonegap_App.zip config.xml res\ www\
:: -xr!www\images\dictionary