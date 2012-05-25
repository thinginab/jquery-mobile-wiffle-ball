/**************** bigleague.main.js ****************/

	var currentGame;
	var currentGameIndex;
	var currentSeasonIndex=-1;
	var games;
	var savedGames;
	var viewMode="wide";
	
	var undos = [];
	var redos  = [];

	var clk = null;
	
	$(function () {
		"use strict";
		
		if('ontouchstart' in document.documentElement)
		{
			CONFIG.isMobile = true;
			//CONFIG.clickEvent = 'tap';
		}
		else
		{
			CONFIG.processDelay = 0;
			//CONFIG.clearDelay = 0;
		}
		if(CONFIG.defaultTransition!=null)
			$.mobile.defaultPageTransition=CONFIG.defaultTransition;
		
		// turn on saving for 'secret' season url
		try
		{
			if(window.navigator.onLine)  
			{
				if(window.location.href.indexOf("season/")!==-1)
				{
					CONFIG.connectToServer = true;
				}
			
			}
		}
		catch(exc){}
		if(CONFIG.connectToServer && window.navigator.onLine)
		{
			if(window.location.protocol!=="http" && window.location.protocol!=="https")
			{ // file:// mode/etc
				LOAD_URL = CONFIG.server+"/"+LOAD_URL;
				POST_URL = CONFIG.server+"/"+POST_URL;
			}
		}
		
	    games = getGames();
		CONFIG = getConfig();
	    getSavedGames();
		
		if(CONFIG.isMobile)
		{
			window.top.scrollTo(0, 1); //hide iOS address bar
			$(document).live("orientationchange", function(ev){
				processSizeChange();
			});
		}
		else
		{
			$(window).bind("resize", function(ev){
				processSizeChange();
			});
		}
		setHomeViewMode();
		setGameViewMode();
		
	    $("#home").live("pageshow", function () {
			showPageLoadingMsg();
			setTimeout(bindHome,
				CONFIG.processDelay);
	    })
		.live("pagebeforeshow",function(){
			showPageLoadingMsg($(this));
		});
		bindHome();
		
	    $("#continue,#stats").live("pageshow", function () {
			showPageLoadingMsg();
			setTimeout(bindGames,
				CONFIG.processDelay);
	    })
		.live("pagebeforeshow",function(){
			showPageLoadingMsg($(this));
		});
	    bindGames();
		
		
		$("#config").live("pageshow",function(){
			showPageLoadingMsg();
			setTimeout(bindConfig,
				CONFIG.processDelay);
		})
		.live("pagebeforeshow",function(){
			showPageLoadingMsg($(this));
		});
		bindConfig();

		$("#newgame").live("pageshow",function(){
			showPageLoadingMsg();
			setTimeout(bindNewGame,
				CONFIG.processDelay);
		})
		.live("pagebeforeshow",function(){
			showPageLoadingMsg($(this));
		});
		bindNewGame();
		
	    // grab and use the 'subpage navigation value' for current game, if any
	    // couldn't find out how to do this directly in jqmobile
	    var gameregex = /.*\#game(stats)?\&ui-page=game(\d*)(\&season(\d*))?/ig;
	    var matches = gameregex.exec(window.location.href);
	    if (matches != null && matches.length > 1) {
			showPageLoadingMsg();
			currentGameIndex = parseInt(matches[2]);
			
			if(matches.length>4 && matches[4]!=null)
				currentSeasonIndex = parseInt(matches[4]);
			else
				currentSeasonIndex = -1;
			
			setTimeout(loadCurrentGame,
				CONFIG.processDelay);
	    }

	    // grab and use the 'subpage navigation value' for current season, if any
	    // couldn't find out how to do this directly in jqmobile
	    var seasonregex = /.*\#seasonstats?\&ui-page=season(\-?\d*)/ig;
		matches = seasonregex.exec(window.location.href);
	    if (matches != null && matches.length > 1) {
			showPageLoadingMsg();
			currentSeasonIndex = parseInt(matches[1]);
			setTimeout(bindSeasonStats,
				CONFIG.processDelay);
	    }
		
	    $("#game").live("pageshow", function () {
			showPageLoadingMsg();
			setTimeout(loadCurrentGame,
				CONFIG.processDelay);
	    })
		.live("pagebeforeshow",function(){
			showPageLoadingMsg($(this));
		});
	    $("#gamestats").live("pageshow", function () {
			showPageLoadingMsg();
			setTimeout(bindGameStats,
				CONFIG.processDelay);
	    })
		.live("pagebeforeshow",function(){
			showPageLoadingMsg($(this));
		});
	    $("#seasonstats").live("pageshow", function () {
			showPageLoadingMsg();
			setTimeout(bindSeasonStats,
				CONFIG.processDelay);
	    })
		.live("pagebeforeshow",function(){
			showPageLoadingMsg($(this));
		});
		gameInit();
		newGameInit();
		configInit();
	});
	
	function loadCurrentGame()
	{
		"use strict";
		if(!savedgamesloaded)
		{
			setTimeout(loadCurrentGame,100);
			return;
		}
		var prevGame = currentGame;
		
		if(currentSeasonIndex===-1 )
			currentGame = games[currentGameIndex];
		else
			currentGame = savedGames[currentSeasonIndex].games[currentGameIndex];
			
			
		redos = [];
		if(prevGame!==currentGame) // only on game init
		{
			undos = [];
			undos[0] = JSON.stringify(currentGame);
			setupRules();
		}
		bindGame();
		bindGameStats();
		setupFielders();
		setGameViewMode();
	}
	
	function processSizeChange()
	{
		"use strict";
		if($("#game:visible").size()>0)
			setGameViewMode();
		else if($("#home:visible").size()>0)
			setHomeViewMode();
	}
	function showPageLoadingMsg($page)
	{
		if($page==null)
			$page = $('.ui-page:visible');
		//$.mobile.showPageLoadingMsg(); //doesn't work
		// http://stackoverflow.com/questions/7420023/jquery-mobile-problems-getting-showpageloadingmsg-to-work-with-pagebeforeshow
		$('body').addClass('ui-loading');
		$page.addClass('disabled');
	}
	function hidePageLoadingMsg($page)
	{
		if($page==null)
			$page = $('.ui-page:visible');
		//$.mobile.hidePageLoadingMsg(); //doesn't work
		// http://stackoverflow.com/questions/7420023/jquery-mobile-problems-getting-showpageloadingmsg-to-work-with-pagebeforeshow
		$('body').removeClass('ui-loading');
		$page.removeClass('disabled');
	}
	function setToggleOption(selector,toggled)
	{
		$(selector+" option[value='"+(toggled?"on":"off")+"']").attr("selected","selected");
		$(selector).slider('refresh');
	}
	
	function getOuterHTML($element)
	{
		return $element.clone().wrap('<div>').parent().html();
	}
		
	function roundNumber(num, dec) {
		"use strict";
		var result;
		if(isNaN(num))
			result = "N/A";
		else if(num.toFixed)
			result = num.toFixed(dec).substring(1);
		else
			result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
		return result;
	}
	
	// Array Remove - By John Resig (MIT Licensed)
	Array.prototype.remove = function(from, to) {
		"use strict";
	  var rest = this.slice((to || from) + 1 || this.length);
	  this.length = from < 0 ? this.length + from : from;
	  return this.push.apply(this, rest);
	};
	// Array (deep) clone
	Array.prototype.clone = function() {
		"use strict"; return JSON.parse(JSON.stringify(this)); };
	