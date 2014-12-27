@ECHO OFF
CALL "%~d0\Libs\Setup.bat" > NUL
::SETLOCAL ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION
SET CURRENT_FILE=%0
SET CURRENT_DRIVE=%~d0
CHCP 437 > NUL

TITLE PhoneGap Helper

SET ADB="%ANDROID_HOME%\platform-tools\adb.exe"
SET EMULATOR="%ANDROID_HOME%\tools\emulator.exe"

SET PROJECT_NAME=
SET APK=
SET APK_ZIP=
SET APK_PACKAGE=
SET APK_ACTIVITY=
SET APK_SIZE=
SET PGB_ID=

CALL :GENERATESEPARATOR _ " " 80
CALL :GENERATESEPARATOR - "�" 80
CALL :GENERATESEPARATOR # "�" 80
CALL :GENERATESEPARATOR @ "�" 80


:START
CALL :MAINMENU_INIT
CALL :UPDATE
GOTO :MAINMENU



:MAINMENU
CALL :MAINMENU_TEXT
CALL :PARSE :MAINMENU_COMMAND
GOTO :MAINMENU



:MAINMENU_INIT

CALL :MENUITEMLABEL PROJECT	  		"PROJECT:       !PROJECT_NAME!"
CALL :MENUITEMLABEL DIRECTORY		"DIRECTORY:     "!__CD__!""
CALL :MENUITEMLABEL APK	  			"APK:           !APK!"
CALL :MENUITEMLABEL APK_ZIP	  		"ZIP:           !APK_ZIP!"
CALL :MENUITEMLABEL APK_PACKAGE	  	"PACKAGE:       !APK_PACKAGE!"
CALL :MENUITEMLABEL APK_ACTIVITY	"ACTIVITY:      !APK_ACTIVITY!"
CALL :MENUITEMLABEL APK_SIZE		"SIZE:          !APK_SIZE!"
CALL :MENUITEMLABEL PGB_ID			"PHONEGAP ID:   !PGB_ID!"

CALL :MENUITEM EMULATOR		E "Start Emulator"
CALL :MENUITEM LOGAPK		L "Start Log APK"
CALL :MENUITEM LOGERROR		X "Start Log Error           (Useful if APK is crashing)"
CALL :MENUITEM SETDIR		S "Set Current Dir"
CALL :MENUITEM SETAPK		A "Set APK"
CALL :MENUITEM BUILDRES		B "Build Resources           (Builds the splash and icons)"
CALL :MENUITEM INITPLATFORM	I "Initialize Platform       (For local build)"
CALL :MENUITEM COMPRESS		U "Upload To Phonegap        (Zip and Upload)"
CALL :MENUITEM DOWNLOAD		D "Download From Phonegap"
CALL :MENUITEM BUILDAPK		8 "Build APK"
CALL :MENUITEM INSTAPK		9 "Install APK"
CALL :MENUITEM RUNAPK		0 "Run APK"
CALL :MENUITEM PROMPT		P "Command Prompt"
CALL :MENUITEM GITGUI		G "Git GUI"
CALL :MENUITEM HELP			H "Help"
CALL :MENUITEM RESTART		R "Restart"
CALL :MENUITEM QUIT			Q "Quit"

CALL :MENUITEM COMMAND		C "Run Command"

SET MAINMENU_LIST="# # _ PROJECT DIRECTORY APK APK_ZIP APK_PACKAGE APK_ACTIVITY APK_SIZE PGB_ID _ - _ SETDIR SETAPK _ - _ EMULATOR LOGAPK LOGERROR _ - _ BUILDRES INITPLATFORM _ COMPRESS DOWNLOAD _ BUILDAPK INSTAPK RUNAPK _ - _ COMMAND PROMPT _ GITGUI _ - _ HELP RESTART QUIT _ @ _"


GOTO :EOF

:MAINMENU_TEXT
CALL :MENUITEMPRINT %MAINMENU_LIST%
GOTO :EOF

:MAINMENU_COMMAND
CALL :MENUITEMCHECK %MAINMENU_LIST% %1
GOTO :EOF




:PARSE
CALL :MENUITEMPRINT "_ _ @"
CALL CursorPos.exe 1,-3
SET QUERY=
SET /P QUERY=Input: 
CALL :MENUITEMPRINT "_ @ _"

IF "%QUERY%"=="" GOTO :EOF
IF NOT "%QUERY:~0,1%"=="-" GOTO :PARSEONE
SET "QUERY=%QUERY:~1%"

:PARSELOOP
IF "%QUERY%"=="" GOTO :PARSEEND
CALL %1 %QUERY:~0,1%
SET "QUERY=%QUERY:~1%"
IF NOT "%QUERY%"=="" CALL :MENUITEMPRINT "_ - _"
GOTO :PARSELOOP

:PARSEONE
CALL %1 %QUERY%

:PARSEEND

CALL :MENUITEMPRINT "_"
SET QUERY=
GOTO :EOF





:MENUITEMLABEL
SET "_%1_TEXT= %~2"
GOTO :EOF

:MENUITEM
::%1 = ID; %2 = Command; %3 = Text
SET "_%1_COMMAND=%2"
SET "_%1_TEXT= (%2) %~3"
GOTO :EOF


:MENUITEMPRINT
SETLOCAL ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION
FOR %%I IN (%~1) DO (
	FOR /F "eol=;delims=" %%A IN ("!_%%I_TEXT!") DO (
		ECHO.%%~A
	)
)
ENDLOCAL
GOTO :EOF

:MENUITEMCHECK
SETLOCAL ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION
FOR %%I IN (%~1) DO (
	IF /I "!_%%I_COMMAND!"=="%2" (
		ENDLOCAL
		CALL :MENUITEMPRINT %%I & ECHO. & GOTO :%%I
	)
)
ECHO UNKNOWN COMMAND "%2"
ENDLOCAL
GOTO :EOF


:MENUSEPARATOR
CALL :MENUITEMPRINT "_ - _"
GOTO :EOF

:GENERATESEPARATOR
SET "VAL=%~2"
FOR /L %%A IN (1,1,%3) DO CALL SET "VAL=%%VAL%%%~2"
SET "_%~1_TEXT=%VAL%"
SET VAL=
GOTO :EOF





:UPDATE
SET PATTERN="/^\s*<name>/s/^\s*<name>\s*\([^<]*\)\s*<\/name>\s*$/\1/p"
FOR /F "delims=" %%A IN ('sed -n -e %PATTERN% config.xml') DO (
	CALL :UPDATE_NAME "%%A"
	GOTO :EOF
)
GOTO :EOF

:UPDATE_NAME
SET "PROJECT_NAME=%~1"
SET "APK=%__CD__%%PROJECT_NAME: =%"
SET APK_ZIP="%APK%.zip"
SET APK="%APK%-debug.apk"

CALL :UPDATE_APK
CALL :UPDATE_ID
GOTO :EOF


:UPDATE_APK
IF NOT EXIST %APK% (
	SET APK_PACKAGE=
	SET APK_ACTIVITY=
	SET APK_SIZE=
	GOTO :EOF
)

CALL :COMMA %APK% APK_SIZE

SET "APK_SED=aapt dump badging %APK% ^| sed -n -e"
SET APK_PACKAGE_PATTERN="/^package: /s/.*name='\([^']*\)'.*$/\1/p"
SET APK_ACTIVITY_PATTERN="/^launchable-activity:/s/.*name='\([^']*\)'.*$/\1/p"
FOR /F %%A IN ('%APK_SED% %APK_PACKAGE_PATTERN%') DO (SET "APK_PACKAGE=%%A")
FOR /F %%A IN ('%APK_SED% %APK_ACTIVITY_PATTERN%') DO (SET "APK_ACTIVITY=%%A")
SET APK_SED=
SET APK_PACKAGE_PATTERN=
SET APK_ACTIVITY_PATTERN=

::ECHO.
::ECHO Updated APK: %APK%
::ECHO Size: %APK_SIZE%
::ECHO Package: %APK_PACKAGE%
::ECHO Activity: %APK_ACTIVITY%
GOTO :EOF

:UPDATE_ID
IF NOT "%PGB_ID%"=="" GOTO :EOF
FOR /F %%A IN ('CALL pgbuild list ^<^&1 2^> NUL ^| sed -n -e "/^id:.*%PROJECT_NAME%/s/^id:\s*\([0-9]*\).*$/\1/p"') DO (SET "PGB_ID=%%A")
IF NOT "%PGB_ID%"=="" GOTO :EOF
CALL pgbuild list
GOTO :EOF


:COMMA
SET "VALUE=%~z1"
SET "%2= Bytes"
:COMMALOOP
CALL SET "%2=%VALUE:~-3%%%%2%%"
SET "VALUE=%VALUE:~0,-3%"
IF "%VALUE%"=="" GOTO :EOF
CALL SET "%2=,%%%2%%"
GOTO :COMMALOOP




:EMULATOR
ECHO RUN EMULATOR
START "" "%ANDROID_HOME%\AVD Manager.exe"
::SET /P AVD=Enter device name: 
::START "Emulator" %EMULATOR% -avd %AVD%
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
CALL :UPDATE_APK
GOTO :EOF

:SETAPK
ECHO SET APK
SET /P APK=Drag apk file here: 
CALL :UPDATE_APK
GOTO :EOF


:COMPRESS
CALL :UPDATE_ID
IF EXIST %APK_ZIP% ( DEL /S /Q %APK_ZIP% & ECHO. )
ECHO COMPRESSING
ECHO.
ECHO "-x!"  means exclude
ECHO "-xr!" means exclude recursively
ECHO.
SETLOCAL
SET "INCLUDE_FILES=config.xml www\config.xml res\ www\"
SET "EXCLUDE_FILES=-x^!res\*\*\*land* -xr^!*.db"
ECHO INCLUDING: %INCLUDE_FILES% %EXCLUDE_FILES%
CALL 7z a -tzip %APK_ZIP% -mx9 %INCLUDE_FILES% %EXCLUDE_FILES% > NUL
ENDLOCAL
ECHO.
ECHO UPLOADING
ECHO.
CALL pgbuild update %PGB_ID% %APK_ZIP%
ECHO.
ECHO COMPLETED
GOTO :EOF


:DOWNLOAD_WAIT
FOR /F "delims=" %%A IN ('CALL pgbuild buildstatus %PGB_ID% ^| sed -n "/^\s*pending:.*android.*/p"') DO (
	ECHO Waiting 5 seconds for build to be ready
	TIMEOUT /T 5 > NUL
	GOTO :DOWNLOAD_WAIT
)
GOTO :EOF

:DOWNLOAD
CALL :UPDATE_ID
CALL :DOWNLOAD_WAIT
ECHO.
ECHO DOWNLOADING
ECHO.
CALL pgbuild download %PGB_ID% android
ECHO.
ECHO COMPLETED
CALL :UPDATE_APK
GOTO :EOF


:BUILDRES
CALL XCOPY "Libs overrides\*" "%CURRENT_DRIVE%\Libs\" /S /Y > NUL
CALL cordova-gen
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
CALL phonegap build android --verbose
COPY "platforms\android\ant-build\CordovaApp-debug.apk" %APK%
CALL :UPDATE_APK
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


:COMMAND
SET COMMAND=
SET /P COMMAND=%CD%^>
ECHO.
CALL %COMMAND%
SET COMMAND=
GOTO :EOF


:PROMPT
ECHO OPEN COMMAND PROMPT
START "Libs Prompt" /I "%~d0\Libs\Setup.bat"
:: "%~d0\Libs\setup.bat"
GOTO :EOF

:GITGUI
ECHO RUN GIT GUI
CMD /C START /MIN Git gui
GOTO :EOF


:HELP
ECHO NOTE: Can enter multiple values when prefixing with '-' (i.e. -890)
ECHO.
ECHO EXAMPLE: -BUD90 (Builds resources, uploads, downloads, installs and runs on device)
GOTO :EOF

:RESTART
ENDLOCAL
CMD /C %CURRENT_FILE%

:QUIT
EXIT
