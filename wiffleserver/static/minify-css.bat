::combine and min css
cd css
del all.css
::del all.min.css
FOR %%A IN (%*) DO (
type %%A >> all.css
echo. >> all.css
)
::"C:\Users\thinginab\Downloads\jsmin\jsmin.exe" <all.css >all.min.css
cd ..