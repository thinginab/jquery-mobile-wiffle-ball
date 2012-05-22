:combine and min js
cd js
del all.js
del all.min.js
FOR %%A IN (%*) DO (
type %%A >> all.js
echo. >> all.js
)
"%HOMEDRIVE%%HOMEPATH%\Downloads\jsmin\jsmin.exe" <all.js >all.min.js
cd ..