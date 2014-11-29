@ECHO OFF

CALL %~d0\Libs\Setup.bat > NUL

7z a -tzip Phonegap_App.zip config.xml res\ www\