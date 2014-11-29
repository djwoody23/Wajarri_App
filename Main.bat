@ECHO OFF

CALL %~d0\Libs\Setup.bat > NUL

SET ADB="%ANDROID_HOME%\platform-tools\adb.exe"
SET EMULATOR="%ANDROID_HOME%\tools\emulator.exe"

SET APK=
SET APK_PACKAGE=
SET APK_ACTIVITY=
SET APK_SIZE=

CALL :UPDATE "%~1"
ECHO.


:START

ECHO CURRENT DIR:   %CD%
ECHO.
ECHO CURRENT APK:   %APK%
ECHO PACKAGE:       %APK_PACKAGE%
ECHO ACTIVITY:      %APK_ACTIVITY%
ECHO SIZE:          %APK_SIZE%KB
ECHO.
ECHO.------------------------------------------------------------------------
ECHO.
ECHO (1) Start Emulator
ECHO (2) Start Log APK
ECHO (3) Start Log Error           (Useful if program crashing)
ECHO.
ECHO (4) Set Current Dir
ECHO (5) Set APK
ECHO.
ECHO (7) Initialize Platform       (PHONEGAP)
ECHO.
ECHO (8) Build APK                 (PHONEGAP)
ECHO (9) Install APK
ECHO (0) Run APK
ECHO.
ECHO.------------------------------------------------------------------------
ECHO.
ECHO (H) Help
ECHO (Q) Quit
ECHO.
ECHO.------------------------------------------------------------------------
ECHO.

SET /P QUERY=Input: 

CLS
ECHO.

CALL :PARSE

GOTO :START



:UPDATE

SET APK=%~f1

IF NOT EXIST "%APK%" (
	SET APK_PACKAGE=
	SET APK_ACTIVITY=
	SET APK_SIZE=
	GOTO :EOF
)
SET /A APK_SIZE=%~z1 / 1024

::SETLOCAL
SET "APK_SED=aapt dump badging %APK% ^| sed -n -e "
SET APK_PACKAGE_PATTERN="/^package: /s/.*name='\([^']*\)'.*$/\1/p"
SET APK_ACTIVITY_PATTERN="/^launchable-activity:/s/.*name='\([^']*\)'.*$/\1/p"
FOR /F %%A IN ('%APK_SED%%APK_PACKAGE_PATTERN%') DO (SET "APK_PACKAGE=%%A")
FOR /F %%A IN ('%APK_SED%%APK_ACTIVITY_PATTERN%') DO (SET "APK_ACTIVITY=%%A")
::ENDLOCAL
GOTO :EOF



:PARSE
IF "%QUERY%"=="" GOTO :EOF
SET CHAR=%QUERY:~0,1%
SET QUERY=%QUERY:~1%
IF %CHAR%==1 CALL :EMULATOR
IF %CHAR%==2 CALL :LOGAPK
IF %CHAR%==3 CALL :LOGERROR
IF %CHAR%==4 CALL :SETDIR
IF %CHAR%==5 CALL :SETAPK
IF %CHAR%==7 CALL :INITPLATFORM
IF %CHAR%==8 CALL :BUILDAPK
IF %CHAR%==9 CALL :INSTAPK
IF %CHAR%==0 CALL :RUNAPK
IF /I %CHAR%==h CALL :HELP
IF /I %CHAR%==q EXIT
ECHO.
ECHO.------------------------------------------------------------------------
ECHO.
GOTO :PARSE





:EMULATOR
ECHO RUN EMULATOR
SET /P AVD=Enter device name: 
START "Emulator" %EMULATOR% -avd %AVD%
GOTO :EOF

:LOGAPK
ECHO START   LOG APK
START "Log CordovaLog" %ADB% logcat CordovaLog:D *:S
GOTO :EOF

:LOGERROR
ECHO START   LOG ERROR
START "Log Error" %ADB% logcat *:E
GOTO :EOF

:SETDIR
ECHO SET DIR
SETLOCAL
SET /P DIR=Enter Project Directory: 
CD %DIR%
ENDLOCAL
CALL :UPDATE %APK%
GOTO :EOF

:SETAPK
ECHO SET APK
SET /P APK=Drag apk file here: 
CALL :UPDATE %APK%
GOTO :EOF


:INITPLATFORM
ECHO INITIALIZE PLATFORM

IF "%CD%"=="%ANDROID_HOME%" (
	ECHO INCORRECT PROJECT DIR
	GOTO :EOF
)

IF EXIST "platforms\" ( RD /S /Q "platforms\" )
IF EXIST "plugins\" ( RD /S /Q "plugins\" )

SETLOCAL
SET PATTERN="/^\s*<gap:plugin /s/.*name=['""]\([^'""]*\)['""].*$/\1/gp"
FOR /F %%A IN ('sed -n -e %PATTERN% config.xml') DO (
	ECHO.------------------------------------------------------------------------
	ECHO INSTALLING: %%A
	ECHO.------------------------------------------------------------------------
	CALL phonegap plugin add %%A
)
ENDLOCAL

ECHO.------------------------------------------------------------------------
ECHO ADDING ANDROID PLATFORM
ECHO.------------------------------------------------------------------------
CALL phonegap platform add android

GOTO :EOF


:BUILDAPK
ECHO BUILD APK
CALL phonegap build android
:: --verbose
COPY "platforms\android\ant-build\*-debug.apk" "."
CALL :UPDATE %APK%
GOTO :EOF


:INSTAPK
ECHO UNINSTALL APK
CALL %ADB% uninstall %APK_PACKAGE%
ECHO.
ECHO INSTALL APK
CALL %ADB% install -r %APK%
GOTO :EOF


:RUNAPK
ECHO RUN APK
ECHO PACKAGE: %APK_PACKAGE%/%APK_ACTIVITY%
ECHO.
CALL %ADB% shell am start -S -n %APK_PACKAGE%/%APK_ACTIVITY%
GOTO :EOF


:HELP
ECHO HELP
ECHO NOTE: Can enter multiple values (i.e. 890)
GOTO :EOF
