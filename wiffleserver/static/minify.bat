:combine and min js
echo js
call minify-js.bat "jquery-1.7.2.js" "jquery-ui-1.8.20.custom.js" "jquery.ui.touch-punch.js" "jquery.mobile-1.1.0.js" "jquery.tablesorter.js" "overthrow.0.1.0.js" "bigleague.config.js" "bigleague.recreate.js" "bigleague.stats.js" "bigleague.classes.js" "bigleague.scoregameui.js" "bigleague.newgame.js" "bigleague.home.js" "bigleague.gamelist.js" "bigleague.scoregamelogic.js" "bigleague.gamestats.js" "bigleague.seasonstats.js" "bigleague.main.js"
echo css
call minify-css.bat "themes\pepper-grinder\jquery-ui-1.8.20.custom.css" "themes\BLWB.css" "jquery.mobile.structure-1.1.0.css" "main.css"
	