@echo off
chcp 1251 > nul
setlocal

set ASM_FILE=%~f1
set ASM_NAME=%~n1
set EXT_ROOT=%~2
set FILE_DIR=%~3

set DOSBOX=%EXT_ROOT%\bin\dosbox-x.exe
set CONF=%EXT_ROOT%\bin\dosbox-x.conf
set BUILD=%FILE_DIR%\_build
set LOG=%BUILD%\_build.log
set DOS_BAT=%BUILD%\_build.bat
set DONE_FLAG=%BUILD%\_done.flg

if not exist "%BUILD%" mkdir "%BUILD%"
if exist "%LOG%"        del "%LOG%"
if exist "%DONE_FLAG%"  del "%DONE_FLAG%"

(
    echo @echo off
    echo cd _build
    echo tasm /zi ..\%ASM_NAME%.asm ^> C:\_build\_build.log
    echo if errorlevel 1 goto done
    echo tlink /v %ASM_NAME%.obj ^>^> C:\_build\_build.log
    echo :done
    echo flag ^> C:\_build\_done.flg
    echo exit
) > "%DOS_BAT%"

"%DOSBOX%" -conf "%CONF%" ^
  -c "mount c %FILE_DIR%" ^
  -c "mount t %EXT_ROOT%\bin" ^
  -c "set PATH=T:\;%%PATH%%" ^
  -c "c:" ^
  -c "call _build\_build.bat" ^
  > nul 2>&1

set /a i=0
:wait
if exist "%DONE_FLAG%" goto ready
if %i% geq 15 goto timeout
timeout /t 1 /nobreak > nul
set /a i=%i%+1
goto wait

:timeout
echo [build timeout]
exit /b 1

:ready
del "%DONE_FLAG%"
exit /b 0