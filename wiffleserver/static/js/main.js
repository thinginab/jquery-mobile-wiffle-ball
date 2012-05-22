	
	var oldgame =  null;
		
	function recreateGame()
	{
		"use strict";
		for(var hi=0; hi<oldgame.halfinnings.length; hi++)
		{
			for(var ab=0; ab<oldgame.halfinnings[hi].atbats.length; ab++)
			{
				for(var p=0; p<oldgame.halfinnings[hi].atbats[ab].pitches.length; p++)
				{
				//	currentGame.halfinnings[hi].atbats[ab].batter = JSON.parse(JSON.stringify(oldgame.halfinnings[hi].atbats[ab].batter));
					processPitch(oldgame.halfinnings[hi].atbats[ab].pitches[p], oldgame.halfinnings[hi].atbats[ab].fielder);
				}
			}
		}
	}
	
	var CONFIG =
		{
			ballsForWalk: 5,
			startingBalls: 0,
			strikesForK: 2,
			startingStrikes: 0,
			twoStrikeFouls: -1,
			outsPerInning: 3,
			inningsPerGame: 6,
			connectToServer: false,
			server: "http://wiffletracker.appspot.com",
			maxTeamPlayers: 5,
			halfInningSkip: true,
			overSpeedWalk: true,
			//mercyRule: 10,
			//mercyRuleInnings: 3,
			extraInningRunners: 2,
			doublePlayOnFly: true,
			doublePlayOnLine: true,
			doublePlayRunnersRequired: false,
			doublePlayRemovesAdditionalRunner: false,
			doublePlayAdvanceOnFailed: 0,
			pushRunnersOnHit: true,
			autoPitcherChange: false,
			ceilingOuts: false,
			flySingles: true,
			lineSingles: true,
			sacFlys: false,
			playClick: false,
			defaultTransition: 'slide',
			clickEvent: 'vclick',
			isMobile: false,
			processDelay: 300,
			clearDelay: 100
		};
	var SERVER = "http://wiffletracker.appspot.com";
	var POST_URL = "save";
	var LOAD_URL = "load";
	var CLICK_URL = "other/click.mp3";
	
	function getTeamScore(game,team)
	{
		"use strict";
		var score = 0;
		for(var i=0; i<game.halfinnings.length; i++)
		{
			if(game.halfinnings[i].teambatting.name===team.name)
			{
				score+=getHalfInningScore(game.halfinnings[i]);
			}
		}
		return score;
	}
	
	function getHalfInningScore(halfinning)
	{
		"use strict";
		var score = 0;
		for(var j=0; j<halfinning.atbats.length; j++)
		{
			score+=halfinning.atbats[j].runsScored;
		}
		return score;
	}
	
	
	var hitregex = /.*((single)|(double)|(triple)|(homer)).*/ig;
	var walkregex = /ball.*/ig;
	var errorregex = /.*((error)|(dp.*failed)).*/ig;
	var atbatregex = /.*^((?!((ball.*)|(error))).)*$.*/ig;
	var strikeoutregex = /(called)|(swing)/ig;
	var fouloutregex = /(foul)/ig;
	var plateappearanceregex = /.*/ig;
	var singleregex = /.*single.*/ig;
	var doubleregex = /.*double.*/ig;
	var tripleregex = /.*triple.*/ig;
	var homerregex = /.*homer.*/ig;
	
	var pitchregex = /.*/ig;
	var ballregex = /ball.*/ig;
	var swingregex = /.*^((?!((ball.*)|(called)|(strike_start))).)*$.*/ig;
	
	
	function getTeamOutcomes(game,team,regex)
	{
		"use strict";
		var outcomes = 0;
		for(var i=0; i<game.halfinnings.length; i++)
		{
			if(game.halfinnings[i].teambatting.name===team.name)
			{
				outcomes+=getHalfInningOutcomes(game.halfinnings[i],regex);
			}
		}
		return outcomes;
	}
	function getPlayerInnings(games,player,isbatter)
	{
		"use strict";
		if(games.halfinnings!=null)
		{
			var game = games;
			games = [];
			games[games.length] = game;
		}
		var innings = 0;
		for(var i=0; i<games.length; i++)
		{
			var game = games[i];
			for(var j=0; j<game.halfinnings.length; j++)
			{
				var hi = game.halfinnings[j];
				for(var k=0; k<hi.atbats.length; k++)
				{
					if(isbatter && hi.atbats[k].batter.name===player 
						&& hi.atbats[k].pitches.length>0)
					{
						innings++;
						break;
					}
					else if(!isbatter && hi.atbats[k].pitcher.name===player
						&& hi.atbats[k].pitches.length>0)
					{
						innings++;
						break;
					}
				}
			}
		}
		return innings;
	}
	function getTeamInnings(game,team, isbatting)
	{
		"use strict";
		var innings = 0;
		for(var i=0; i<game.halfinnings.length; i++)
		{
			if(isbatting && game.halfinnings[i].teambatting.name===team.name
				&& game.halfinnings[i].atbats[0].pitches.length>0)
			{
				innings++;
			}
			else if(!isbatting && game.halfinnings[i].teampitching.name===team.name
				&& game.halfinnings[i].atbats[0].pitches.length>0)
			{
				innings++;
			}
		}
		return innings;
	}
	function getPlayerGames(games,player,isbatter)
	{
		"use strict";
		if(games.halfinnings!=null)
		{
			var game = games;
			games = [];
			games[games.length] = game;
		}
		var gamecount = 0;
		
		for(var i=0; i<games.length; i++)
		{
			for(var j=0; j<games[i].team1.players.length; j++)
			{
				if(games[i].team1.players[j].name===player)
					gamecount++;
			}
			for(var j=0; j<games[i].team2.players.length; j++)
			{
				if(games[i].team2.players[j].name===player)
					gamecount++;
			}
				
		}
		return gamecount;
	}
	function getTeamGames(game,team)
	{
		"use strict";
		var innings = 0;
		if(game.team1.name===team.name || game.team2.name===team.name)
			return 1;
		return 0;
	}
	function getPlayerPitches(games,player,regex,isbatter)
	{
		"use strict";
		if(games.halfinnings!=null)
		{
			var game = games;
			games = [];
			games[games.length] = game;
		}
		
		var pitches = 0;
		
		for(var i=0; i<games.length; i++)
		{
			var game = games[i];
			for(var j=0; j<game.halfinnings.length; j++)
			{
				var hi = game.halfinnings[j];
				for(var k=0; k<hi.atbats.length; k++)
				{
					var ab = hi.atbats[k];
					for(var l=0; l<ab.pitches.length; l++)
					{
						var pitch = ab.pitches[l];
						
						if(isbatter && ab.batter.name===player &&
							regex.test(pitch) )
						{
							pitches++;
						}
						else if(!isbatter && ab.pitcher.name===player &&
							regex.test(pitch) )
						{
							pitches++;
						}
						regex.lastIndex=0;
					}
				}
			}
		}
		
		return pitches;
	}
	function getTeamPitches(games,team,regex,isbatting)
	{
		"use strict";
		if(games.halfinnings!=null)
		{
			var game = games;
			games = [];
			games[games.length] = game;
		}
		
		var pitches = 0;
		
		for(var i=0; i<games.length; i++)
		{
			var game = games[i];
			for(var j=0; j<game.halfinnings.length; j++)
			{
				var hi = game.halfinnings[j];
				
				if((isbatting && hi.teambatting.name===team.name) ||
				(!isbatting && hi.teampitching.name===team.name))
				{
					for(var k=0; k<hi.atbats.length; k++)
					{
						var ab = hi.atbats[k];
						for(var l=0; l<ab.pitches.length; l++)
						{
							var pitch = ab.pitches[l];
							
							if(regex.test(pitch) )
							{
								pitches++;
							}
							regex.lastIndex=0;
						}
					}
				}
			}
		}
		
		return pitches;
	}
	function getPlayerOutcomes(games,player,regex,isbatter, countcurrentab)
	{
		"use strict";
		if(games.halfinnings!=null)
		{
			var game = games;
			games = [];
			games[games.length] = game;
		}
		
		if(countcurrentab==null)
			countcurrentab = true;
		
		var outcomes = 0;
		
		for(var k=0; k<games.length; k++)
		{
			var game = games[k];
			for(var i=0; i<game.halfinnings.length; i++)
			{
				for(var j=0; j<game.halfinnings[i].atbats.length; j++)
				{
					if(!countcurrentab && game.halfinnings.length===i+1
						&& game.halfinnings[i].atbats.length===j+1)
						break;
						
					var outcome = game.halfinnings[i].atbats[j].pitches[game.halfinnings[i].atbats[j].pitches.length-1];
					
					if(outcome.indexOf("-skip")===-1) //don't count inning skips for/against player stats
					{
						if(isbatter && game.halfinnings[i].atbats[j].batter.name===player &&
							regex.test(outcome) )
						{
							outcomes++;
						}
						else if(!isbatter && game.halfinnings[i].atbats[j].pitcher.name===player &&
							regex.test(outcome) )
						{
							outcomes++;
						}
						regex.lastIndex=0;
					}
				}
			}
		}
		return outcomes;
	}
	function getTeamOutcomesScore(game,team,regex)
	{
		"use strict";
		var outcomes = 0;
		
		for(var i=0; i<game.halfinnings.length; i++)
		{
			if(game.halfinnings[i].teambatting.name===team.name)
			{
				outcomes+=getHalfInningOutcomesScore(game.halfinnings[i],regex);
			}
		}
		
		return outcomes;
	}
	function getPlayerOutcomesScore(games,player,regex, isbatter)
	{
		"use strict";
		if(games.halfinnings!=null)
		{
			var game = games;
			games = [];
			games[games.length] = game;
		}
		
		var outcomes = 0;
		for(var k=0; k<games.length; k++)
		{
			var game = games[k];
			for(var i=0; i<game.halfinnings.length; i++)
			{
				for(var j=0; j<game.halfinnings[i].atbats.length; j++)
				{
					var outcome = game.halfinnings[i].atbats[j].pitches[game.halfinnings[i].atbats[j].pitches.length-1];
					
					
					if(outcome.indexOf("-skip")===-1) //don't count inning skips for/against player stats
					{
						if(isbatter && game.halfinnings[i].atbats[j].batter.name===player &&
							regex.test(outcome) )
						{
							outcomes+=game.halfinnings[i].atbats[j].runsScored;
						}
						else if(!isbatter && game.halfinnings[i].atbats[j].pitcher.name===player &&
							regex.test(outcome) )
						{
							outcomes+=game.halfinnings[i].atbats[j].runsScored;
						}
						regex.lastIndex=0
					}
				}
			}
		}
		return outcomes;
	}
	
	function getPlayerRunsScored(games,player,isbatter)
	{
		"use strict";
		if(games.halfinnings!=null)
		{
			var game = games;
			games = [];
			games[games.length] = game;
		}
		
		var runs = 0;
		for(var k=0; k<games.length; k++)
		{
			var game = games[k];
			for(var i=0; i<game.halfinnings.length; i++)
			{
				for(var j=0; j<game.halfinnings[i].atbats.length; j++)
				{
					if(!isbatter && game.halfinnings[i].atbats[j].pitcher.name===player)
					{
						runs+=game.halfinnings[i].atbats[j].runsScored;
					}
					else if(isbatter)
					{
						if(game.halfinnings[i].atbats[j].runnersScored!=null)
						{
							for(var l=0; l<game.halfinnings[i].atbats[j].runnersScored.length; l++)
							{
								if(game.halfinnings[i].atbats[j].runnersScored[l].name===player)
									runs++;
							}
						}
					}
					
				}
			}
		}
		return runs;
	}
	
	function getHalfInningOutcomes(halfinning, regex)
	{
		"use strict";
		var outcomes = 0;
		for(var j=0; j<halfinning.atbats.length; j++)
		{
			var outcome = halfinning.atbats[j].pitches[halfinning.atbats[j].pitches.length-1];
			
			if(regex.test(outcome))
				outcomes++;
				
			regex.lastIndex=0;
		}
		return outcomes;
	}
	
	function getHalfInningOutcomesScore(halfinning, regex)
	{
		"use strict";
		var outcomes = 0;
		for(var j=0; j<halfinning.atbats.length; j++)
		{
			var outcome = halfinning.atbats[j].pitches[halfinning.atbats[j].pitches.length-1];
			
			if(regex.test(outcome))
				outcomes+=halfinning.atbats[j].runsScored;
				
			regex.lastIndex=0;
		}
		return outcomes;
	}
	
	function Game (type) {
		"use strict";
		this.team1 = new Team();
		this.team2 = new Team();
		this.id = "";
		this.season = "";
		this.innings = CONFIG.inningsPerGame;
		
		this.halfinnings = [];
		
		
	};
	function Base(type){
		"use strict";
		this.number = 0;
		this.player = null;
	};
	function Team(type){
		"use strict";
		this.name = "";
		this.players = [];
		this.currentbatter = -1;
		this.currentpitcher = -1;
	};
	
	function Player(type){
		"use strict";
		this.name = "";
		this.skip = false;
	};
	function HalfInning(type){
		"use strict";
		this.teamFielding = null;
		this.teamBatting = null;
		this.number = 1;
		this.top = true;
		this.currentouts = 0;
		this.atbats = [];
	};
	function AtBat(type){
		"use strict";
		this.pitcher = null;
		this.pitcherIndex = 0;
		this.batter = null;
		this.batterIndex = 0;
		this.fielder = null;
		this.pitches = [];
		this.runsScored = 0;
		this.runnersScored = [];
		this.runnersOut = [];
		this.currentstrikes = 0;
		this.currentballs = 0;
		this.currentfouls = 0;
		this.bases = null;
	};
	
	var currentGame;
	var currentGameIndex;
	var currentSeasonIndex=-1;
	var games;
	var savedGames;
	var viewMode="wide";
	
	var undos = [];
	var redos  = [];

	var clk = null;
	
	function processSizeChange()
	{
		"use strict";
		if($("#game:visible").size()>0)
			setGameViewMode();
		else if($("#home:visible").size()>0)
			setHomeViewMode();
	}
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
	
	function substitutePlayer(team,playerIndex,newname)
	{
		var curplayer = team.players[playerIndex];
		curplayer.skip = true;
		
		team.players[playerIndex] = new Player();
		team.players[playerIndex].name = newname;
		
		team.players[team.players.length] = curplayer;
	}
	
	var gameinited=false;
	function gameInit() {
		if(!gameinited)
		{
			gameinited=true;
			if(CONFIG.playClick)
			{
				$("ul li,.ui-btn").live(CONFIG.clickEvent,function(){
					
					try
					{
						if(clk==null)
							clk = new Audio(CLICK_URL);
						clk.play();
					}
					catch(exc){}
				});
			}
			
			var pitchulprocessing=false;
			var processultimeout=null;
			var clrultimeout=null;
			$("ul.inplay li a[data-pitch]").live(CONFIG.clickEvent,function () {
				
				if(!pitchulprocessing) // make sure we don't allow double processing/clicks
				{
					if(processultimeout!=null)
					{
						clearTimeout(processultimeout);
						processultimeout = null;
					}
					if(clrultimeout!=null)
					{
						clearTimeout(clrultimeout);
						clrultimeout = null;
					}
					pitchulprocessing=true;
					
					var $this = $(this);
					if(!$this.parent().hasClass(".ui-btn-active"))
						$this.parent().addClass(".ui-btn-active");
					
					if(!CONFIG.isMobile)
					{
						processPitch($this.attr("data-pitch"), $this.attr("data-fielded-by"));
					}
					
					
					processultimeout = setTimeout(function(){
						pitchulprocessing = true;
						processultimeout = null;
						
						var $li = $this.parents("li:first").removeClass("ui-btn-active");
						if(CONFIG.isMobile)
						{
							processPitch($this.attr("data-pitch"), $this.attr("data-fielded-by")); // processing early causes issues if innings/fielders change
						}
						
						if(clrultimeout!=null)
						{
							clearTimeout(clrultimeout);
							clrultimeout = null;
						}
						clrultimeout = setTimeout(function(){	
							clrultimeout = null;	
								
							$this.removeClass("ui-btn-active");
							
							pitchulprocessing = false;
						},CONFIG.clearDelay);
						pitchulprocessing = true;
					},CONFIG.processDelay);
					
					
				
				}
			});
			var pitchulprocessing2=false;
			var processultimeout2=null;
			var clrultimeout2=null;
			$("ul:not(.inplay) li a[data-pitch]").live(CONFIG.clickEvent,function () {
				
				if(!pitchulprocessing2) // make sure we don't allow double processing/clicks
				{
					if(processultimeout2!=null)
					{
						clearTimeout(processultimeout2);
						processultimeout2 = null;
					}
					if(clrultimeout2!=null)
					{
						clearTimeout(clrultimeout2);
						clrultimeout2 = null;
					}
					pitchulprocessing2=true;
					var $this = $(this);
					if(!$this.parent().hasClass(".ui-btn-active"))
						$this.parent().addClass(".ui-btn-active");
					
					if(!CONFIG.isMobile)
					{
						processPitch($this.attr("data-pitch"), $this.attr("data-fielded-by"));
					}
					
					processultimeout2 = setTimeout(function(){
						pitchulprocessing2 = true;
						processultimeout2 = null;
						
						var $li = $this.parents("li:first");
						if(CONFIG.isMobile)
						{
							processPitch($this.attr("data-pitch"), $this.attr("data-fielded-by")); // processing early causes issues if innings/fielders change
						}
						
						if(clrultimeout2!=null)
						{
							clearTimeout(clrultimeout2);
							clrultimeout2 = null;
						}
						clrultimeout2 = setTimeout(function(){	
							clrultimeout2 = null;	
								
							$this.removeClass("ui-btn-active");
							
							pitchulprocessing2 = false;
						},CONFIG.clearDelay);
						pitchulprocessing2 = true;
					},CONFIG.processDelay);
					
				
				}
			});
			var pitchbtnprocessing=false;
			var clrbtntimeout=null;
			var processtimeout=null;
			$("#pitches a[data-pitch]").bind(CONFIG.clickEvent,function () {
				var $this = $(this);
				if(!pitchbtnprocessing ) // make sure we don't allow double processing/clicks
				{
					pitchbtnprocessing = true;
					
					if(processtimeout!=null)
					{
						clearTimeout(processtimeout);
						processtimeout = null;
					}
					if(clrbtntimeout!=null)
					{
						clearTimeout(clrbtntimeout);
						clrbtntimeout = null;
					}
					pitchbtnprocessing = true;
					processtimeout = setTimeout(function(){ //processPitch "threaded" for ui responsiveness
						pitchbtnprocessing = true;
						processtimeout = null;
					
						processPitch($this.attr("data-pitch"), $this.attr("data-fielded-by"));
					
						
						if(clrbtntimeout!=null)
						{
							clearTimeout(clrbtntimeout);
							clrbtntimeout = null;
						}
						clrbtntimeout = setTimeout(function(){	
							clrbtntimeout = null;	
								
							$this.removeClass("ui-btn-active");
							
							pitchbtnprocessing = false;
						},CONFIG.clearDelay);
						pitchbtnprocessing = true;
						
					},CONFIG.processDelay);
				}
			});
			
			

			$("#undo").bind("click",function () {//need to use click because area changes.  ok to be slow.
				
				var $this = $(this);
				if(!$this.hasClass(".ui-btn-active"))
					$this.addClass(".ui-btn-active");
					
				undo();
				setTimeout(function(){
					var $li = $this.parents("li:first").removeClass("ui-btn-active");
				},CONFIG.clearDelay);
			});
			$("#basePath,#basePath_n").bind("click",function(){//need to use click because area changes.  ok to be slow.
				
				var hi = getCurrentHalfInning();
				
				if(hi.atbats.length>1)
				{
					$(".baserunner").empty();
					
					var ab = getCurrentAtBat();
					var lastab = hi.atbats[hi.atbats.length-2];
					
					
					for(var i=0; i<lastab.runnersScored.length; i++)
					{
						$("#runnersscored").append("<li class='runner' data-scored='true' data-scorerindex='"+i+"'>"+lastab.runnersScored[i].name+"</li>");
					}
					for(var i=0; i<ab.bases.length; i++)
					{
						if(ab.bases[i].player!=null)
						{
							$("#runner_"+(i+1)).append("<li class='runner' data-base='"+i+"'>"+ab.bases[i].player.name+"</li>");
						}
					}
					for(var i=0; i<lastab.runnersOut.length; i++)
					{
						$("#runnersout").append("<li class='runner' data-out='true' data-outindex='"+i+"'>"+lastab.runnersOut[i].name+"</li>");
					}
					
					$(".baserunner li.runner").draggable({
						revert:true,
						axis: "y",
						opacity: .7,
						cursorAt: { left: 0, top:0 }
					});
					
					if($(".baserunner").attr("data-inited")!=="true")
					{
						$(".baserunner").droppable({
							tolerance: "touch",
							accept: function(draggable){
								return draggable.is("li.runner") &&
									($(this).has(draggable).length!==0 || $(this).attr("id").indexOf("_")===-1 || !$(this).is(":has(li)"));
								
							},
							activeClass: "baserunner-active",
							hoverClass: "baserunner-hover",
							drop: function( event, ui ) {  
								$(this).prepend(ui.draggable);
							}
								
						});
						$(".baserunner").attr("data-inited","true");
					}
					
					if($("#saverunners").attr("data-inited")!=="true")
					{
						$("#saverunners").bind(CONFIG.clickEvent,function(){
							  $("ul:not(#runnersOut) li.runner,ul#runnersOut li.runner").each(function(){  // do 'runners out' last to prevent accidental skip to next inning
								var $r = $(this);
								var $p = $r.parent();
								if($p.attr("id")==="runnersout")
								{
									if($r.attr("data-out")!=="true")
									{
										if($r.attr("data-base")!=null)
										{
											//remove from base
											if(ab.bases[parseInt($r.attr("data-base"))].player.name==$r.text())
											{
												lastab.runnersOut[lastab.runnersOut.length] = ab.bases[parseInt($r.attr("data-base"))].player;
												ab.bases[parseInt($r.attr("data-base"))].player=null;
											}
										}
										if($r.attr("data-scored")==="true")
										{
											//remove score
											lastab.runsScored--;
											var index = parseInt($r.attr("data-scorerindex"));
											lastab.runnersOut[lastab.runnersOut.length] = lastab.runnersScored[index];
											lastab.runnersScored.remove(index,index+1);
										}
										//new out
										runnerOut();
									}
								}
								else if($p.attr("id")=="runnersscored")
								{
									if($r.attr("data-scored")!=="true")
									{
										//new run
										lastab.runsScored++;
										if($r.attr("data-base")!=null)
										{
											lastab.runnersScored[lastab.runnersScored.length] = ab.bases[parseInt($r.attr("data-base"))].player;
											ab.bases[parseInt($r.attr("data-base"))].player=null;
										}
										if($r.attr("data-out")==="true")
										{
											//remove out
											hi.currentouts--;
											var index = parseInt($r.attr("data-outindex"));
											lastab.runnersScored[lastab.runnersScored.length] = lastab.runnersOut[index];
											lastab.runnersOut.remove(index,index+1);
										}
									}
								}
								else
								{
									
										if($r.attr("data-base")!=null && $r.attr("data-base")!=$p.attr("data-base"))
										{
											//change base
											ab.bases[parseInt($p.attr("data-base"))].player=ab.bases[parseInt($r.attr("data-base"))].player;
											ab.bases[parseInt($r.attr("data-base"))].player=null;
										}
										if($r.attr("data-out")==="true")
										{
											//remove out
											hi.currentouts--;
											var index = parseInt($r.attr("data-outindex"));
											ab.bases[parseInt($p.attr("data-base"))].player = lastab.runnersOut[index];
											lastab.runnersOut.remove(index,index+1);
										}
										if($r.attr("data-scored")==="true")
										{
											//remove score
											lastab.runsScored--;
											var index = parseInt($r.attr("data-scorerindex"));
											ab.bases[parseInt($p.attr("data-base"))].player = lastab.runnersScored[index];
											lastab.runnersScored.remove(index,index+1);
										}
									
								}
							  });
							  hi.atbats[hi.atbats.length-1] = ab;
							  hi.atbats[hi.atbats.length-2] = lastab;
							  currentGame.halfinnings[currentGame.halfinnings.length-1] = hi;
							  $('.ui-dialog').dialog('close');
						});
						$("#saverunners").attr("data-inited","true");
					}
					
					$.mobile.changePage('#baserunning','pop',false,true);
					
				}
			});
			$("#doHalfInningSkip").bind("click",function () {//need to use click because area changes.  ok to be slow.
				
				//var $this = $(this);
				//if(!$this.hasClass(".ui-btn-active"))
				//	$this.addClass(".ui-btn-active");
				
				var score = getHalfInningScore(getCurrentHalfInning());
				$("#runsScored").val(score).attr("min",score);
				$.mobile.changePage('#skipHalfInningDialog','pop',false,true);
				$("#skipHalfInningDialog").find(".ui-header").removeClass("ui-corner-top");
				if($("#setrunsscoredandskip").attr("data-inited")!=="true")
				{
					$("#setrunsscoredandskip").bind(CONFIG.clickEvent,function(){
						  var additionalRuns = parseInt($('#runsScored').val()) - getHalfInningScore(getCurrentHalfInning());
						  var additionalOuts = CONFIG.outsPerInning - getCurrentHalfInning().currentouts;
						  for(var i=0; i<additionalOuts; i++)
						  {
							if(i==0)
								processPitch("out-skip-"+additionalRuns);
							else
								processPitch("out-skip");
						  }
						  $('.ui-dialog').dialog('close');
					});
					$("#setrunsscoredandskip").attr("data-inited","true");
				}
				
				//setTimeout(function(){
				//	var $li = $this.parents("li:first").removeClass("ui-btn-active");
				//},CONFIG.clearDelay);
			});
			
			
			$("#backtolist").bind(CONFIG.clickEvent,function(){
				
				var $this = $(this);
				if(!$this.hasClass(".ui-btn-active"))
					$this.addClass(".ui-btn-active");
				getSavedGames();
			});

			$("#redo").bind("click",function () {//need to use click because area changes.  ok to be slow.
				
				var $this = $(this);
				if(!$this.hasClass(".ui-btn-active"))
					$this.addClass(".ui-btn-active");
				redo();
				setTimeout(function(){
					
					$this.parents("li:first").removeClass("ui-btn-active");
				},CONFIG.clearDelay);
			});
			
			$("table.pitcher").bind(CONFIG.clickEvent,function () {
				
				
				var $this = $(this);
				if(!$this.hasClass(".ui-btn-active"))
					$this.addClass(".ui-btn-active");
					
			
				$.mobile.changePage('#changepitcher','pop',false,true);
				$("#newpitcher li").remove();
				for(var i=0; i<getCurrentTeamFielding().players.length; i++)
				{
					if(i!==getCurrentAtBat().pitcherIndex && getCurrentTeamFielding().players[i].skip!==true)
						$("#newpitcher").append("<li><a href='#' data-player='"+i+"'>"+getCurrentTeamFielding().players[i].name+"</a></li>");
				}
				$("#newpitcher").append("<li><a href='#' data-player='-1'>[sub out "+getCurrentTeamFielding().players[getCurrentAtBat().pitcherIndex].name+"]</a></li>");
				$("#newpitcher").listview("refresh");
				
				$("#changepitcher").find(".ui-header").removeClass("ui-corner-top");
				$("#newpitcher li a").bind(CONFIG.clickEvent,function () {
					var $this = $(this);
					if(!$this.parent().hasClass(".ui-btn-active"))
						$this.parent().addClass(".ui-btn-active");
						
					var newpitcherindex = $(this).attr("data-player");
					
					if(newpitcherindex==-1)
					{
						var newname = prompt("New player name?","");
						if(newname!=null)
						{
							if(currentGame.halfinnings.length%2===1) // team 1 fielding
							{
								substitutePlayer(currentGame.team1,getCurrentAtBat().pitcherIndex,newname);
								getCurrentHalfInning().teamfielding = currentGame.team1;
							}
							else
							{
								substitutePlayer(currentGame.team2,getCurrentAtBat().pitcherIndex,newname);
								getCurrentHalfInning().teamfielding = currentGame.team2;
							}
							
							newpitcherindex = getCurrentAtBat().pitcherIndex;
						}
						else
							return;
					}
					
					getCurrentTeamFielding().currentpitcher = newpitcherindex;
					
					var atbat = getCurrentAtBat();
					atbat.pitcherIndex = newpitcherindex;
					atbat.pitcher = getCurrentTeamFielding().players[newpitcherindex];
					
					saveGames(games);
					bindGame();
					$('.ui-dialog').dialog('close');
				});
				
				
				
				setTimeout(function(){
					
					var $li = $this.removeClass("ui-btn-active");
				},CONFIG.clearDelay);
				
			});
			
			
			$("table.batter").bind(CONFIG.clickEvent,function () {
				var $this = $(this);
				if(!$this.hasClass(".ui-btn-active"))
					$this.addClass(".ui-btn-active");
					
				$.mobile.changePage('#changebatter','pop',false,true);
				$("#newbatter li").remove();
				for(var i=0; i<getCurrentTeamBatting().players.length; i++)
				{
					if(i!==getCurrentAtBat().batterIndex && getCurrentTeamBatting().players[i].skip!==true)
						$("#newbatter").append("<li><a href='#' data-player='"+i+"'>"+getCurrentTeamBatting().players[i].name+"</a></li>");
				}
				$("#newbatter").append("<li><a href='#' data-player='-1'>[sub out "+getCurrentTeamBatting().players[getCurrentAtBat().batterIndex].name+"]</a></li>");
				$("#newbatter").listview("refresh");
				$("#newbatter li a").bind(CONFIG.clickEvent,function () {
					
					var $this = $(this);
					if(!$this.parent().hasClass(".ui-btn-active"))
						$this.parent().addClass(".ui-btn-active");
						
					var newbatterindex = $(this).attr("data-player");
					
					if(newbatterindex==-1)
					{
						var newname = prompt("New player name?","");
						if(newname!=null)
						{
							if(currentGame.halfinnings.length%2===1) // team 2 batting
							{
								substitutePlayer(currentGame.team2,getCurrentAtBat().batterIndex,newname);
								getCurrentHalfInning().teambatting = currentGame.team2;
							}
							else
							{
								substitutePlayer(currentGame.team1,getCurrentAtBat().pitcherIndex,newname);
								getCurrentHalfInning().teambatting = currentGame.team1;
							}
							
							newbatterindex = getCurrentAtBat().batterIndex;
						}
						else
							return;
					}
					
					getCurrentTeamBatting().currentbatter = newbatterindex;
					
					var atbat = getCurrentAtBat();
					atbat.batterIndex = newbatterindex;
					atbat.batter = getCurrentTeamBatting().players[newbatterindex];
					
					
					saveGames(games);
					bindGame();
					$('.ui-dialog').dialog('close');
				});

				$("#changebatter").find(".ui-header").removeClass("ui-corner-top");
				
				setTimeout(function(){
					
					$this.parents("li:first").removeClass("ui-btn-active");
				},CONFIG.clearDelay);
			});

			$(document).delegate("#post",CONFIG.clickEvent,function () {
				var $this = $(this);
				if(!$this.parent().hasClass(".ui-btn-active"))
					$this.parent().addClass(".ui-btn-active");
					
				if(currentGame.season && currentGame.season.length>0)
				{
					post();
				}
				else
				{
					$.mobile.changePage('#setseason','pop',false,true);
					$("#setseason").find(".ui-header").removeClass("ui-corner-top");
					$("#saveseason").bind(CONFIG.clickEvent,function(){
						  currentGame.season = $('#seasonName').val();
						  saveGames(games);
						  $("#server").hide();
						  $('.ui-dialog').dialog('close');
					});
					
				}
					setTimeout(function(){
						
						var $li = $this.parents("li:first").removeClass("ui-btn-active");
					},CONFIG.clearDelay);
			});
			$("#output").bind(CONFIG.clickEvent,function(){
				var $this = $(this);
				if(!$this.parent().hasClass(".ui-btn-active"))
					$this.parent().addClass(".ui-btn-active");
					
				output();
				setTimeout(function(){
					
					var $li = $this.parents("li:first").removeClass("ui-btn-active");
				},CONFIG.clearDelay);
			});
		}
	}
	
	var configinited=false;
	function configInit() {
		if(!configinited)
		{
			configinited=true;
			$("#configform").submit(function (e) {
				
				CONFIG.ballsForWalk = parseInt($("#ballsForWalk").val());
				CONFIG.startingBalls = parseInt($("#startingBalls").val());
				CONFIG.strikesForK = parseInt($("#strikesForK").val());
				CONFIG.startingStrikes = parseInt($("#startingStrikes").val());
				CONFIG.twoStrikeFouls = parseInt($("#twoStrikeFouls").val());
				CONFIG.outsPerInning = parseInt($("#outsPerInning").val());
				CONFIG.inningsPerGame = parseInt($("#inningsPerGame").val());
				CONFIG.maxTeamPlayers = parseInt($("#maxTeamPlayers").val());
				CONFIG.pushRunnersOnHit = $("#pushRunnersOnHit").val()==="on";
				CONFIG.extraInningRunners = parseInt($("#extraInningRunners").val());
				CONFIG.overSpeedWalk = $("#overSpeedWalk").val()==="on";
				CONFIG.halfInningSkip = $("#halfInningSkip").val()==="on";
				CONFIG.doublePlayOnFly = $("#doublePlayOnFly").val()==="on";
				CONFIG.doublePlayOnLine = $("#doublePlayOnLine").val()==="on";
				CONFIG.doublePlayRunnersRequired = $("#doublePlayRunnersRequired").val()==="on";
				CONFIG.doublePlayRemovesAdditionalRunner = $("#doublePlayRemovesAdditionalRunner").val()==="on";
				
				if($("#doublePlayAdvanceOnFailed").val()==="on")
					CONFIG.doublePlayAdvanceOnFailed = 1;
				else
					CONFIG.doublePlayAdvanceOnFailed = 0;
				CONFIG.autoPitcherChange = $("#autoPitcherChange").val()==="on";
				CONFIG.flySingles = $("#flySingles").val()==="on";
				CONFIG.lineSingles = $("#lineSingles").val()==="on";
				CONFIG.sacFlys = $("#sacFlys").val()==="on";
				
				saveConfig();
				
				$.mobile.changePage($("#home"),
						{
						  changeHash: true,
						  dataUrl: "#home"
						});
				e.preventDefault();
				return false;
			});
		}
	}
	var newgameinited=false;
	function newGameInit() {
		if(!newgameinited)
		{
			newgameinited=true;
			
			$("#newgameform").submit(function (e) {
				
				currentGame = new Game();
				currentGame.innings = $("#innings").val();
				currentGame.team1.name = $("#team1").val();
				currentGame.team2.name = $("#team2").val();
				
				try
				{
					parseInt($("#innings").val());
				}
				catch(exc){
					currentGame.innings  = "6";
				}
				
				if($.trim(currentGame.team1.name).length===0)
					currentGame.team1.name="Team 1";
					
				if($.trim(currentGame.team2.name).length===0)
					currentGame.team2.name="Team 2";
				
				for (var i = 1; i <= CONFIG.maxTeamPlayers; i++) {
					if ($("#player" + i).val() !== "") {
						currentGame.team1.players[currentGame.team1.players.length] = new Player();
						currentGame.team1.players[currentGame.team1.players.length - 1].name = $("#player" + i).val();
					}
					if ($("#player" + i + "_2").val() !== "") {
						currentGame.team2.players[currentGame.team2.players.length] = new Player();
						currentGame.team2.players[currentGame.team2.players.length - 1].name = $("#player" + i + "_2").val();
					}
				}
				
				if(currentGame.team1.players.length==0)
				{
					currentGame.team1.players[currentGame.team1.players.length] = new Player();
					currentGame.team1.players[currentGame.team1.players.length - 1].name = "Player 1";
				}
				if(currentGame.team2.players.length==0)
				{
					currentGame.team2.players[currentGame.team2.players.length] = new Player();
					currentGame.team2.players[currentGame.team2.players.length - 1].name = "Player 2";
				}
				
				nextAtBat();

				currentGameIndex = games.length;
				currentSeasonIndex = -1;
				games[currentGameIndex] = currentGame;
				undos = [];
				redos = [];
				undos[0] = JSON.stringify(currentGame);
				saveGames(games);

				$.mobile.changePage($("#game"),
						{
						  changeHash: true,
						  dataUrl: "#game&ui-page=game" + currentGameIndex
						});
				e.preventDefault();
				return false;
			});
		}
	}
	
	function bindHome()
	{
		"use strict";
		if(games.length===0)
			$("a[href='#continue']").hide();
		else
			$("a[href='#continue']").show();
		
		
		if(games.length===0 && !CONFIG.connectToServer)
			$("a[href='#stats']").hide();
		else
			$("a[href='#stats']").show();
			
		setTimeout(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}
	function setHomeViewMode()
	{
		"use strict";
		var width = $(window).width();
		if(width<480)
		{
			var backsize='auto 50px';
			$("#home").css("-moz-background-size",backsize)
				.css("-webkit-background-size",backsize)
				.css("-o-background-size",backsize)
				.css("background-size",backsize);
			$("#home div.ui-content:first").css("padding-top","50px");
		}
		else
		{
			var backsize='auto 75px';
			$("#home").css("-moz-background-size",backsize)
				.css("-webkit-background-size",backsize)
				.css("-o-background-size",backsize)
				.css("background-size",backsize);
			$("#home div.ui-content:first").css("padding-top","75px");
		}
	}
	function setGameViewMode()
	{
		"use strict";
		var width = $(window).width();
		if(viewMode==="wide" && width<480)
		{
			viewMode = "narrow";
			bindGame();
			
		}
		else if(viewMode==="narrow" && width>=480)
		{
			viewMode = "wide";
			bindGame();
		}
		var $basePath = $("#basePath");
		
		if($basePath[0].getContext)
		{
			drawBases($basePath);
			drawBases($("#basePath_n"));
		}
		
		if(viewMode==="wide") /* remove a stat column if "wide" mode is too small for it */
		{
			var $pittable = $("#pitcherstats");
			var pitcherstatwidth = $pittable.parent().width();
			
			if(pitcherstatwidth>=65) 
			{
				$("#pitcherstrikeouts,#pitcherstrikeouts_h").show();
			}
			else
			{
				$("#pitcherstrikeouts,#pitcherstrikeouts_h").hide();
			}
			
			var $battable = $("#batterstats");
			var batterstatwidth = $battable.parent().width();
						
			if(batterstatwidth>=120)
			{
				$("#widescore").removeClass("small");
			}
			else if(batterstatwidth>=90)
			{
				$("#batterwalks,#batterwalks_h").show();
				if(!$("#widescore").hasClass("small"))
					$("#widescore").addClass("small");
			}
			else
			{
				$("#batterwalks,#batterwalks_h").hide();
				if(!$("#widescore").hasClass("small"))
					$("#widescore").addClass("small");
			}
		}
		else if(viewMode==="narrow") // adapt heading sizes to fit
		{
			var paddingamt = 2.5;
			var batterpitchersize = .9;
			var countsize = .8;
			
			
			var fontpx = 22.0;
			var itempadding = paddingamt*fontpx;
			
			$(".scores").css("font-size",fontpx);
			$(".inning").css("font-size",fontpx);
			$("#narrowscore .batter").css("font-size",fontpx*batterpitchersize);
			$("#narrowscore .pitcher").css("font-size",fontpx*batterpitchersize);
			$(".count").css("font-size",fontpx*countsize);
			fontpx--;
			while(($(".scores").width() < ($("#hometeam").width()+itempadding) ||
				$(".scores").width() < ($("#awayteam").width()+itempadding)
				|| $(".inning").parent().width() < ($(".inning th").width()+itempadding)
				|| $("#narrowscore .batter").parent().width() < ($("#narrowscore .batter th").width()+itempadding))
				&& fontpx>=5)
			{
				$(".scores").css("font-size",fontpx);
				$(".inning").css("font-size",fontpx);
				$("#narrowscore .batter").css("font-size",fontpx*batterpitchersize);
				$("#narrowscore .pitcher").css("font-size",fontpx*batterpitchersize);
				$(".count").css("font-size",fontpx*countsize);
				fontpx--;
				itempadding = paddingamt*fontpx;
			}
			
		}
	}
	
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
	function bindConfig()
	{
		"use strict";
		if($("#config:visible").length==0)
			return;
		if(!savedgamesloaded)
		{
			setTimeout(bindConfig,100);
			return;
		}
		CONFIG = getConfig();
		
		$("#ballsForWalk").val(CONFIG.ballsForWalk);
		$("#startingBalls").val(CONFIG.startingBalls);
		$("#strikesForK").val(CONFIG.strikesForK);
		$("#startingStrikes").val(CONFIG.startingStrikes);
		$("#twoStrikeFouls").val(CONFIG.twoStrikeFouls);
		$("#outsPerInning").val(CONFIG.outsPerInning);
		$("#inningsPerGame").val(CONFIG.inningsPerGame);
		$("#maxTeamPlayers").val(CONFIG.maxTeamPlayers);
		setToggleOption("#pushRunnersOnHit", CONFIG.pushRunnersOnHit);
		$("#extraInningRunners").val(CONFIG.extraInningRunners);
		setToggleOption("#halfInningSkip", CONFIG.halfInningSkip);
		setToggleOption("#overSpeedWalk", CONFIG.overSpeedWalk);
		setToggleOption("#doublePlayOnFly", CONFIG.doublePlayOnFly);
		setToggleOption("#doublePlayOnLine", CONFIG.doublePlayOnLine);
		setToggleOption("#doublePlayRunnersRequired", CONFIG.doublePlayRunnersRequired);
		setToggleOption("#doublePlayRemovesAdditionalRunner", CONFIG.doublePlayRemovesAdditionalRunner);
		setToggleOption("#doublePlayAdvanceOnFailed", CONFIG.doublePlayAdvanceOnFailed>0);
		setToggleOption("#autoPitcherChange", CONFIG.autoPitcherChange);
		setToggleOption("#flySingles", CONFIG.flySingles);
		setToggleOption("#lineSingles", CONFIG.lineSingles);
		setToggleOption("#sacFlys", CONFIG.sacFlys);
		
		
		setTimeout(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}
	function setToggleOption(selector,toggled)
	{
		$(selector+" option[value='"+(toggled?"on":"off")+"']").attr("selected","selected");
		$(selector).slider('refresh');
	}
	function bindNewGame()
	{
		"use strict";
		if($("#newgame:visible").length==0)
			return;
		if(!savedgamesloaded)
		{
			setTimeout(bindNewGame,100);
			return;
		}
		
		var teams = [];
		var teamIds = [];
		
		$("#innings").val(CONFIG.inningsPerGame);
		
		games = getGames(); // uses localstorage and reviver to make sure teams have ids
		CONFIG = getConfig();
		for(var i=games.length-1; i>=0; i--) //most recent first
		{
			if(games[i].team1!=null && $.inArray(games[i].team1.getId(),teamIds)===-1)
			{
				teams[teams.length] = games[i].team1;
				teamIds[teamIds.length] = games[i].team1.getId();
			}
			if(games[i].team2!=null && $.inArray(games[i].team2.getId(),teamIds)===-1)
			{
				teams[teams.length] = games[i].team2;
				teamIds[teamIds.length] = games[i].team2.getId();
			}
		}
		if(savedGames!=null)
		{
			for(var i=0; i<savedGames.length; i++)
			{
				for(var j=0; j<savedGames[i].games.length; j++)
				{
					if(savedGames[i].games[j].team1!=null && $.inArray(savedGames[i].games[j].team1.getId(),teamIds)===-1)
					{
						teams[teams.length] = savedGames[i].games[j].team1;
						teamIds[teamIds.length] = savedGames[i].games[j].team1.getId();
					}
					if(savedGames[i].games[j].team2!=null && $.inArray(savedGames[i].games[j].team2.getId(),teamIds)===-1)
					{
						teams[teams.length] = savedGames[i].games[j].team2;
						teamIds[teamIds.length] = savedGames[i].games[j].team2.getId();
					}
				}
			}
		}
		for(var i=0; i<teams.length; i++)
		{
			teams[i].value = teams[i].name;
		}
		for (var i = 1; i <= 15; i++) {
			if(i<=CONFIG.maxTeamPlayers)
			{
				$("#player" + i).parent().show();
				$("#player" + i + "_2").parent().show();
			}
			else
			{
				$("#player" + i).parent().hide();
				$("#player" + i + "_2").parent().hide();
			}
		}
		for(var i=1; i<=2; i++)
		{ // for some reason #team1, #team2 didn't work
			$( "#team"+i ).autocomplete({
				minLength: 0,
				source: teams,
				focus: function( event, ui ) {
					
					$( this ).val( ui.item.name );
					for(var i=0; i<ui.item.players.length; i++)
					{
						var postfix = "";
						if($(this).is("#team2"))
							postfix = "_2";
						$("#player"+(i+1)+postfix).val(ui.item.players[i].name);
					}
					return false;
				},
				select: function( event, ui ) {
					
					$( this).val( ui.item.name );
					for(var i=0; i<ui.item.players.length; i++)
					{
						var postfix = "";
						if($(this).is("#team2"))
							postfix = "_2";
						$("#player"+(i+1)+postfix).val(ui.item.players[i].name);
					}
					return false;
				}
			})
			.data( "autocomplete" )._renderItem = function( ul, item ) {
				
				var players = "";
				for(var i=0; i<item.players.length; i++)
				{
					if(players!=="")
						players+=", ";
					players += item.players[i].name;
				}
				return $( "<li></li>" )
					.data( "item.autocomplete", item )
					.append( "<a>" + item.name + "<br /><span style='font-style:italic;font-size:.8em;padding-left:4px;'>" + players + "</span></a>" )
					.appendTo( ul );
			};
		}
		setTimeout(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}
	
	var isloading=false;
	function bindGames()
	{
		"use strict";
		if($("#continue:visible,#stats:visible").length==0)
			return;
		if(!savedgamesloaded)
		{
			setTimeout(bindGames,100);
			
			return;
		}
		savedgamesloaded=true;
		if(!isloading)
		{
			isloading=true;
			$("#continue li,#stats li").remove();
			
			if(games.length>0)
			{
				$("#continue ul").append("<li data-role='list-divider'>Edit Game</li>");
				for(var i=0; i<games.length; i++)
				{
					$("#continue ul").append("<li data-game='"+i+"' data-removable='true'><a href='#game' data-url='#game&ui-page=game"+i+"'>"+games[i].team2.name+" at "+games[i].team1.name+"</a></li>");
				}
				if(savedGames!=null && savedGames.length>0)
					$("#stats ul").append("<li data-role='list-divider'>Local Game Stats</li>");
				else
					$("#stats ul").append("<li data-role='list-divider'>Game Stats</li>");
				$("#stats ul").append("<li data-season='-1'><a href='#seasonstats&ui-page=season-1'>All Games</a></li>");
				for(var i=0; i<games.length; i++)
				{
					$("#stats ul").append("<li data-game='"+i+"'><a href='#gamestats' data-url='#gamestats&ui-page=game"+i+"'>--- "+games[i].team2.name+" at "+games[i].team1.name+"</a></li>");
				}
			}
			if(savedGames!=null && savedGames.length>0)
			{
				$("#stats ul").append("<li data-role='list-divider'>Saved Stats</li>");
				
				for(var i=0; i<savedGames.length; i++)
				{
					var season = savedGames[i];
					
					if(season.games.length>0)
						$("#stats ul").append("<li data-season='"+i+"'><a href='#seasonstats&ui-page=season"+i+"'><strong>Full "+season.name+" Stats</strong></a></li>");
					
					for(var j=0; j<season.games.length; j++)
					{
						$("#stats ul").append("<li data-game='"+j+"' data-season='"+i+"'><a href='#gamestats' data-url='#gamestats&ui-page=game"+j+"&season"+i+"'>--- "+season.games[j].team2.name+" at "+season.games[j].team1.name+"</a></li>");
					}
				}
				/*
				$("#home ul").append("<li data-role='list-divider'>Recreate Game</li>");
				for(var i=0; i<savedGames.length; i++)
				{
					var season = savedGames[i];
					
					for(var j=0; j<season.games.length; j++)
					{
						$("#home ul").append("<li data-game='"+j+"' data-season='"+i+"' data-recreate='true'><a href='#game&recreate=true&ui-page=game"+j+"&season"+i+"'>"+season.games[j].team2.name+" at "+season.games[j].team1.name+"</a></li>");
					}
				}
				*/
				
			}
			
			
			$("#continue ul li:not([data-role=list-divider]), #stats ul li:not([data-role=list-divider])")
			.bind(CONFIG.clickEvent,
				function(event)
				{ 
					games = getGames();
					CONFIG = getConfig();
					
					if(!$(this).hasClass(".ui-btn-active"))
						$(this).addClass(".ui-btn-active");
					currentGameIndex = parseInt($(this).attr("data-game"));
					if($(this).is("[data-season]"))
					{
						currentSeasonIndex = parseInt($(this).attr("data-season"));
					}
					else
					{
						currentSeasonIndex = -1;
					}
					if(currentSeasonIndex === -1)
					{
						currentGame = games[currentGameIndex];
					}
					else
					{
						currentGame = savedGames[currentSeasonIndex].games[currentGameIndex];
					}
					
					setupRules();
					undos = [];
					redos = [];
					undos[0] = JSON.stringify(currentGame);
					
					
					if($(this).is("[data-recreate=true]"))
					{
						oldgame = currentGame;
						currentGame = new Game();
						currentGame.team1.name = oldgame.team1.name;
						currentGame.team2.name = oldgame.team2.name;
						for (var i = 0; i <oldgame.team1.players.length; i++) {
							currentGame.team1.players[currentGame.team1.players.length] = new Player();
							currentGame.team1.players[currentGame.team1.players.length - 1].name = oldgame.team1.players[i].name;
						}
						for (var i = 0; i <oldgame.team2.players.length; i++) {
							currentGame.team2.players[currentGame.team2.players.length] = new Player();
							currentGame.team2.players[currentGame.team2.players.length - 1].name = oldgame.team2.players[i].name;
						}
						nextAtBat();

						currentGameIndex = games.length;
						currentSeasonIndex = -1;
						games[currentGameIndex] = currentGame;
						undos = [];
						redos = [];
						undos[0] = JSON.stringify(currentGame);
						recreateGame();
						saveGames(games);

						$.mobile.changePage($(this).find("a").attr("href"),
							{
								changeHash: true,
								dataUrl: "#game&ui-page=game" + (games.length - 1)
							});
					}
					else
					{
						$.mobile.changePage($(this).find("a").attr("href"),
						{
							changeHash:true,
							dataUrl: $(this).find("a").attr("data-url")
						});
					}
					event.preventDefault();
					return false;
				
				}
			);
			
			var removable = $("#continue ul li").filter("[data-removable]");
			if(CONFIG.isMobile)
			{
				removable.swipe(
					function()
					{
						
						showDeletePrompt(this);
					}
				)
				.taphold(
					function()
					{
						
						showDeletePrompt(this);
					}
				);
			}
			else
			{
				removable.bind("contextmenu",
					function(e)
					{
						
						showDeletePrompt(this);
						e.preventDefault();
						return false;
					}
				);
			}
			
			try
			{ // might not be previously init'd
				$("#continue ul")
			}
			catch(exc){}
			try
			{ // might not be previously init'd
				$("#continue ul").listview("refresh");
			}
			catch(exc){}
			try
			{ // might not be previously init'd
				$("#stats ul")
			}
			catch(exc){}
			try
			{ // might not be previously init'd
				$("#stats ul").listview("refresh");
			}
			catch(exc){}
		}
		$("ul li.ui-btn-active").removeClass("ui-btn-active");
			isloading=false;
		setTimeout(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
		
	}
	
	function showDeletePrompt(link)
	{
		"use strict";
		if(confirm("delete game '"+$(link).text()+"'?"))
		{
			games.remove(parseInt($(link).attr("data-game")));
			saveGames(games);
			bindGames();
		}
	}
	
	function bindGame()
	{
		"use strict";
		if(!savedgamesloaded)
		{
			setTimeout(bindGame,100);
			return;
		}
		if(currentGame==null)
			return;
			
		var atbat = getCurrentAtBat();
		var awayscore = getTeamScore(currentGame,currentGame.team2);
		var homescore = getTeamScore(currentGame,currentGame.team1);
		if(viewMode==="wide")
		{
			$("#batterabs").text(getPlayerOutcomes(currentGame,atbat.batter.name,atbatregex, true,false));
			$("#batterwalks").text(getPlayerOutcomes(currentGame,atbat.batter.name,walkregex, true,false));
			$("#batterhits").text(getPlayerOutcomes(currentGame,atbat.batter.name,hitregex, true,false));
			$("#batterrbi").text((getPlayerOutcomesScore(currentGame,atbat.batter.name,hitregex, true)+getPlayerOutcomesScore(currentGame,atbat.batter.name,walkregex, true)));
			$("#pitcherhits").text(getPlayerOutcomes(currentGame,atbat.pitcher.name,hitregex, false,false));
			$("#pitcherwalks").text(getPlayerOutcomes(currentGame,atbat.pitcher.name,walkregex, false,false));
			$("#pitcherstrikeouts").text(getPlayerOutcomes(currentGame,atbat.pitcher.name,strikeoutregex, false,false));
			$("#pitcherruns").text(getPlayerRunsScored(currentGame,atbat.pitcher.name,false));
			
			
			setBoxScores($("#gameboxscore"));
		
			$("#narrowscore").hide();
			$("#widescore").show();
		}
		else
		{
			$("#homescore").text(homescore);
			$("#awayscore").text(awayscore);
			
			$("#hometeam").text(currentGame.team1.name);
			$("#awayteam").text(currentGame.team2.name);
			
			$("#widescore").hide();
			$("#narrowscore").show();
			
		}
		
		
		$("#game h1").text(currentGame.team2.name + "(" + awayscore + ")" +
			" at " + currentGame.team1.name + "(" + homescore + ")");
		var halfinning = getCurrentHalfInning();
		$("#batter,#batter_n").text(atbat.batter.name);
		$("#pitcher,#pitcher_n").text(atbat.pitcher.name);
		$("#balls,#balls_n").text(atbat.currentballs);
		$("#strikes,#strikes_n").text(atbat.currentstrikes);
		$("#outs,#outs_n").text(halfinning.currentouts);
		$("#inning,#inning_n").text(((halfinning.top)?"top of ":"bottom of ") + halfinning.number);
		
		if(atbat.bases==null)
		{
			atbat.bases=[];
			for(var i=0;i<4; i++)
			{
				atbat.bases[i] = new Base();
				atbat.bases[i].number = i+1;
			}
		}
		var $basePath = $("#basePath");
		
		if($basePath[0].getContext)
		{
			drawBases($basePath,atbat.bases);
			drawBases($("#basePath_n"),atbat.bases);
		}
		else
		{
			if(atbat.bases[0].player==null)
				$("#first,#first_n").text("X");
			else
				$("#first,#first_n").text(atbat.bases[0].player.name);
			if(atbat.bases[1].player==null)
				$("#second,#second_n").text("X");
			else
				$("#second,#second_n").text(atbat.bases[1].player.name);
			if(atbat.bases[2].player==null)
				$("#third,#third_n").text("X");
			else
				$("#third,#third_n").text(atbat.bases[2].player.name);
		}
			
		
		if(undos.length<=1)
			$("#undoli").hide();
		else
			$("#undoli").show();
			
		if(redos.length===0)
			$("#redoli").hide();
		else
			$("#redoli").show();
		
		if((!CONFIG.doublePlayRunnersRequired || atbat.bases[0].player!=null) && halfinning.currentouts<CONFIG.outsPerInning-1)
			$(".dp:not([data-disabled])").show();
		else
			$(".dp:not([data-disabled])").hide();
			
		
		if((atbat.bases[0].player!=null || atbat.bases[1].player!=null || atbat.bases[2].player!=null) && halfinning.currentouts<2)
			$(".sac:not([data-disabled])").show();
		else
			$(".sac:not([data-disabled])").hide();
		
		if((currentGame.season && currentGame.season.length>0) || !window.navigator.onLine || !CONFIG.connectToServer)
			$("#server").hide();	
		else
			$("#server").show();
		
		if($("#other").nextAll("li:visible").length===0)
			$("#other").hide();
		else
			$("#other").show();
		/*
		if(currentGame.halfinnings.length%2 === 0  && currentgame.halfinnings.length/2 >= currentGame.innings
			&& getTeamScore(currentGame,currentGame.team1) !== getTeamScore(currentGame,currentGame.team2) )
		{ // game over!
			$("li:visible:not(#other,#undoli,#redoli,#gameover)").hide();
			$("#gameover").show();
		}
		else
		{
			$("li:visible:not(#other,#undoli,#redoli,#gameover)").show();
			$("#gameover").hide();
		}
		*/
		setTimeout(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}
	
	var draw_current_bases=null;
	function drawBases($canvas, bases)
	{
		"use strict";
		if(bases==null)
			bases = draw_current_bases;
		else
			draw_current_bases = bases;
		
		if(bases==null)
			return;
			
		$canvas.attr("width",1)
			.attr("height",1);
			
		var basePathCw = $canvas.parent().width();
		var basePathCh  = $canvas.parent().parent().height()-4;
		var minSide = Math.min(basePathCw, basePathCh);
		if(minSide>0)
		{
			var diamondsize = minSide*(.7);
			var basesize = diamondsize/4.0;
			
			$canvas.attr("width",basePathCw)
				.attr("height",basePathCh);
			var basePathC = $canvas[0].getContext('2d');
			
			basePathC.strokeStyle = "#947333";
			basePathC.fillStyle = "#D6522C";//"#5E87B0";
			var translateX = (basePathCw-diamondsize)/2.0;
			var translateY = (basePathCh-diamondsize)/2.0;
			
			var tranCenterX = basePathCw/2.0;
			var tranCenterY = basePathCh/2.0;
			
			// draw a set of rotated squares, shifted to center of canvas
			
			// need to do rotation  with upperleft at center of canvas and then go back
			// http://stackoverflow.com/questions/9402631/opengl-translate-down-on-y-and-rotate-on-z-around-element-center-on-android
			basePathC.translate(tranCenterX ,tranCenterY);
			basePathC.rotate(45.0*Math.PI/180.0);
			basePathC.translate(-tranCenterX ,-tranCenterY);
			
			// move it to to center point
			basePathC.translate(translateX,translateY);
			
			//diamond
			basePathC.strokeRect(0,0,diamondsize,diamondsize);
			
			//first base	
			basePathC.strokeRect(diamondsize-basesize,0,basesize,basesize);
			if(bases[0].player!=null)
				basePathC.fillRect(diamondsize-basesize,0,basesize,basesize);
				
			//second base
			basePathC.strokeRect(0,0,basesize,basesize);
			if(bases[1].player!=null)
				basePathC.fillRect(0,0,basesize,basesize);
			
			// third base	
			basePathC.strokeRect(0,diamondsize-basesize,basesize,basesize);
			if(bases[2].player!=null)
				basePathC.fillRect(0,diamondsize-basesize,basesize,basesize);
				
			//home
			basePathC.strokeRect(diamondsize-basesize,diamondsize-basesize,basesize,basesize);
		}
	}
	
	var isprocessing=false;
	function processPitch(pitchCode, fieldedBy)
	{
		"use strict";
		if(!isprocessing || pitchCode.indexOf("_start")!==-1 || pitchCode.indexOf("-skip")!==-1) // if processing, let it through if it's an automatic starting count or half inning skip
		{
			isprocessing=true;
			redos = [];
			
			//slow it down for test on web
			//for(var i=0;i<999999999;i++);
			
			var vals = pitchCode.split("-");
			
			var atbat = getCurrentAtBat();
			atbat.pitches[atbat.pitches.length] = pitchCode;
			
			if(fieldedBy!=null)
				atbat.fielder = fieldedBy;
			
			var newbases = null;
			
			if(vals.length===1)
			{ //not in play
				if(vals[0]==="swing" || vals[0]==="called" || vals[0]==="strike_start")
				{
					atbat.currentstrikes++;
					if(atbat.currentstrikes===CONFIG.strikesForK && CONFIG.strikesForK>0)
					{//strikeout
						atbat.runnersOut[atbat.runnersOut.length] = atbat.batter;
						batterOut();
						nextAtBat();
					}
				}
				else if(vals[0]==="foul")
				{
					if(atbat.currentstrikes<CONFIG.strikesForK-1 )
					{
						atbat.currentstrikes++;
					}
					else
					{
						atbat.currentfouls++;
						if(atbat.currentfouls>CONFIG.twoStrikeFouls && CONFIG.twoStrikeFouls>=0)
						{
							//foul out
							atbat.runnersOut[atbat.runnersOut.length] = atbat.batter;
							batterOut();
							nextAtBat();
						}
					}
				}
				else if(vals[0].indexOf("ball")==0)//ball
				{
					atbat.currentballs++;
					if(atbat.currentballs===CONFIG.ballsForWalk || pitchCode.indexOf("overspeed")!==-1)
					{//walk
						if(pitchCode.indexOf("overspeed_run")!==-1)
						{ // automatic run
							atbat.runsScored++;
							atbat.runnersScored[atbat.runnersScored.length] = atbat.batter; //credit run to batter
						}
						
						newbases = advanceRunners(1,false);
						newbases[0].player = atbat.batter;
						nextAtBat(newbases);
					}
				}
			}
			else
			{
				if(vals[0]==="single")
				{
					newbases = advanceRunners(1);
					newbases[0].player = atbat.batter;
				}
				else if(vals[0]==="double")
				{
					newbases = advanceRunners(2);
					newbases[1].player = atbat.batter;
				}
				else if(vals[0]==="triple")
				{
					newbases = advanceRunners(3);
					newbases[2].player = atbat.batter;
				}
				else if(vals[0]==="homer")
				{
					newbases = advanceRunners(4);	
					atbat.runsScored++;
					atbat.runnersScored[atbat.runnersScored.length] = atbat.batter;
				}
				else if(vals[0]==="out")
				{
					atbat.runnersOut[atbat.runnersOut.length] = atbat.batter;
					batterOut();
					if(vals.length>2 && vals[1]=="skip")
					{
						atbat.runsScored+=parseInt(vals[2]);
					}
				}
				else if(vals[0]==="error")
				{
					newbases = advanceRunners(1);	// used to be advanceRunners(1,false) (didn't push runners if unforced).  Rule changed.
					newbases[0].player = atbat.batter;
				}
				else if(vals[0]==="dp")
				{
					newbases = atbat.bases.clone();
					if(vals[2]==="failed")
					{
						if(CONFIG.doublePlayAdvanceOnFailed>0)
							newbases = advanceRunners(CONFIG.doublePlayAdvanceOnFailed,true,1);
						atbat.runnersOut[atbat.runnersOut.length] = atbat.batter;
						batterOut();
					}
					else
					{
						atbat.runnersOut[atbat.runnersOut.length] = newbases[0].player;
						atbat.runnersOut[atbat.runnersOut.length] = atbat.batter;
						if(CONFIG.doublePlayRemovesAdditionalRunner)
							newbases[0].player = null;
						batterOut(true);
					}
				}
				else if(vals[0]==="sac")
				{
					if(vals[2]==="failed")
					{
						newbases = atbat.bases.clone();
						for(var i=newbases.length-1; i>=0; i--)
						{
							if(newbases[i].player!=null) //remove furthest runner
							{
								newbases[i].player = null;
								break;
							}
						}
						newbases = advanceRunners(1,true,2);
						atbat.runnersOut[atbat.runnersOut.length] = atbat.batter;
						batterOut(true);
					}
					else
					{
						newbases = advanceRunners(1,true,1);
						atbat.runnersOut[atbat.runnersOut.length] = atbat.batter;
						batterOut();
					}
				}
				nextAtBat(newbases);
			}
			saveGames(games);
			bindGame();
			isprocessing=false;
		}
	}

	function batterOut(doubleplay)
	{
		"use strict";
		if(doubleplay==null)
			doubleplay=false;
			
		var halfinning = getCurrentHalfInning();
		halfinning.currentouts++;
		if(doubleplay)
			halfinning.currentouts++;

	}
	
	function runnerOut()
	{
		"use strict";
			
		var halfinning = getCurrentHalfInning();
		halfinning.currentouts++;

		if(halfinning.currentouts>=CONFIG.outsPerInning)
		{
			nextAtBat();
		}
	}
	function nextAtBat(bases)
	{
		"use strict";
		var halfinning = null;
		
		if(currentGame.halfinnings.length>0)
			halfinning = getCurrentHalfInning();
		
		var inningchange = halfinning!=null && halfinning.currentouts>=CONFIG.outsPerInning;
		
		/* broken?
		if(inningchange)
		{
			//need to change the batter index before switching half innings and team pitching/batting.
			getCurrentTeamBatting().currentbatter = ((getCurrentTeamBatting().currentbatter+1)%getCurrentTeamBatting().players.length);
		}
		*/
		
		if(currentGame.halfinnings.length===0 || inningchange)
		{
			//next half inning
			currentGame.halfinnings[currentGame.halfinnings.length] = new HalfInning();
			halfinning = getCurrentHalfInning();
			if(currentGame.halfinnings.length%2===1)
			{
				halfinning.teamfielding = currentGame.team1;
				halfinning.teambatting = currentGame.team2;
				halfinning.top = true;
			}
			else
			{
				halfinning.teamfielding = currentGame.team2;
				halfinning.teambatting = currentGame.team1;
				halfinning.top = false;
			}
			halfinning.number = Math.round(currentGame.halfinnings.length/2);
			if(getCurrentTeamFielding().currentpitcher===-1 || CONFIG.autoPitcherChange)
				getCurrentTeamFielding().currentpitcher = ((getCurrentTeamFielding().currentpitcher+1)%getCurrentTeamFielding().players.length);
		}
		if(bases==null && halfinning.atbats.length>0)
			bases = getCurrentAtBat().bases.clone();
		else if(bases==null || inningchange)
		{
			bases = [];
			for(var i=0;i<4; i++)
			{
				bases[i] = new Base();
				bases[i].number = i+1;
			}
			if(inningchange && CONFIG.extraInningRunners>0 && halfinning.number > currentGame.innings)
			{
				var extra = new Player();
				extra.name = "EXTRA";
				for(var i=0; i<CONFIG.extraInningRunners; i++)
				{
					bases[i].player = extra;
				}
			}
		}
		
		// next batter
		if(halfinning.atbats.length===0) //first batter this half inning
		{
			if(currentGame.halfinnings.length - 2 >0) //look at last half inning's last batter
			{
				var lasthalfinning = currentGame.halfinnings[currentGame.halfinnings.length-3];
				getCurrentTeamBatting().currentbatter =
					(lasthalfinning.atbats[lasthalfinning.atbats.length-1].batterIndex+1) %
					getCurrentTeamBatting().players.length;
			}
			else //teams first half inning
				getCurrentTeamBatting().currentbatter = 0;
		}
		else
		{
			getCurrentTeamBatting().currentbatter = 
				(halfinning.atbats[halfinning.atbats.length-1].batterIndex+1) %
				getCurrentTeamBatting().players.length;
		}
		while(getCurrentTeamBatting().players[getCurrentTeamBatting().currentbatter].skip===true)
		{
			getCurrentTeamBatting().currentbatter = (getCurrentTeamBatting().currentbatter+1) % getCurrentTeamBatting().players.length;
		}
		while(getCurrentTeamFielding().players[getCurrentTeamFielding().currentpitcher].skip===true)
		{
			getCurrentTeamFielding().currentpitcher = (getCurrentTeamFielding().currentpitcher+1) % getCurrentTeamFielding().players.length;
		}
		/*  broken?
		//next batter
		if(!inningchange || getCurrentTeamBatting().currentbatter===-1)
		{
			//need to change the batter index here if the inning didn't just start, or if it's the first half inning for the team (and it was already handled)
			getCurrentTeamBatting().currentbatter = ((getCurrentTeamBatting().currentbatter+1)%getCurrentTeamBatting().players.length);
		}
		*/
		
		halfinning.atbats[halfinning.atbats.length] = new AtBat();
		
		getCurrentAtBat().pitcherIndex = getCurrentTeamFielding().currentpitcher;
		getCurrentAtBat().pitcher = getCurrentTeamFielding().players[getCurrentAtBat().pitcherIndex];
		
		getCurrentAtBat().batterIndex = getCurrentTeamBatting().currentbatter;
		getCurrentAtBat().batter = getCurrentTeamBatting().players[getCurrentAtBat().batterIndex];
		getCurrentAtBat().bases = bases;
		
		
		setupFielders();
		
		if(getCurrentAtBat().pitches.length===0)//avoid doing twice to same at bat
		{
			if(CONFIG.startingBalls<CONFIG.ballsForWalk)//sanity check
			{
				for(var i=0; i<CONFIG.startingBalls; i++)
				{
					processPitch("ball_start",null);
				}
			}
			if(CONFIG.startingStrikes<CONFIG.strikesForK)//sanity check
			{
				for(var i=0; i<CONFIG.startingStrikes; i++)
				{
					processPitch("strike_start",null);
				}
			}
		}
		
	}
	
	function setupRules()
	{
		"use strict";
		if(!CONFIG.doublePlayOnFly)
		{
			$(".fly .dp").hide().attr("data-disabled","");
		}
		else
		{
			$(".fly .dp").show().removeAttr("data-disabled");
		}
		if(!CONFIG.doublePlayOnLine)
		{
			$(".linedrive .dp").hide().attr("data-disabled","");
		}
		else
		{
			$(".linedrive .dp").show().removeAttr("data-disabled");
		}
		if(!CONFIG.ceilingOuts)
		{
			$(".ceiling").hide().attr("data-disabled","");
		}
		else
		{
			$(".ceiling").show().removeAttr("data-disabled");
		}
		if(!CONFIG.flySingles)
		{
			$(".fly .single").hide().attr("data-disabled","");
		}
		else
		{
			$(".fly .single").show().removeAttr("data-disabled","");
		}
		if(!CONFIG.lineSingles)
		{
			$(".linedrive .single").hide().attr("data-disabled","");
		}
		else
		{
			$(".linedrive .single").show().removeAttr("data-disabled");
		}
		if(CONFIG.doublePlayAdvanceOnFailed<=0)
		{
			$(".faileddp").hide().attr("data-disabled","");
		}
		else
		{
			$(".faileddp").show().removeAttr("data-disabled");
		}
		if(!CONFIG.overSpeedWalk)
		{
			$(".overspeed").hide().attr("data-disabled","");
		}
		else
		{
			$(".overspeed").show().removeAttr("data-disabled");
		}
		if(!CONFIG.halfInningSkip)
		{
			$(".halfInningSkip").hide().attr("data-disabled","");
		}
		else
		{
			$(".halfInningSkip").show().removeAttr("data-disabled");
		}
		if(!CONFIG.sacFlys)
		{
			$(".sac").hide().attr("data-disabled","");
		}
		else
		{
			$(".sac").show().removeAttr("data-disabled");
		}
		
		try
		{ // might not be previously init'd
			$("#game ul").listview("refresh");
		}
		catch(exc){
		}
	}
	var setupFieldersRunning=false;
	function setupFielders()
	{
		"use strict";
		
		if($("#game ul.inplay").is(":visible")) //just clicked, hide to prevent extra click
		{
			$("#game ul.inplay").hide();
		}
		try // updating fielders before init screws stuff up.  test for it.
		{ // might not be previously init'd
			$("#game ul.inplay").listview("refresh");
		}
		catch(exc){
			setTimeout(setupFielders,100);
			return;
		}
		if(!setupFieldersRunning)
		{
			setupFieldersRunning=true;
			var fielded = $("li:has(a[data-fielded-by])");
			fielded.find("a[data-fielded-by]").attr("data-fielded-by","");
			fielded.find("span.fieldedby").remove();
			for(var i=fielded.length; i>=0; i--) // clear previous fielders
			{
				var pitch = fielded.eq(i).find("a[data-fielded-by]").attr("data-pitch");
				
				if(pitch)
				{
					var els = fielded.filter(":has([data-pitch="+pitch+"])").slice(1);
					i-=els.length;
					els.remove();
					fielded = $("li:has(a[data-fielded-by])");
				}
			}
			//return;
			var teamfielding = getCurrentTeamFielding();
			for(var i=0; i<fielded.length; i++) // dupe fielding items for each fielder
			{
				var item = fielded.eq(i);
				for(var j=1; j<teamfielding.players.length; j++)
				{
					var newi = item.clone();
					newi.find("a[data-fielded-by]").attr("data-fielded-by",teamfielding.players[j].name)
						.append("<span class='fieldedby'> By "+teamfielding.players[j].name+"</span>");
					
					item.after(newi);
				}
					item.find("a[data-fielded-by]").attr("data-fielded-by",teamfielding.players[0].name)
						.append("<span class='fieldedby'> By "+teamfielding.players[0].name+"</span>");
			}
			
			$("#game ul.inplay").listview("refresh");
			setupFieldersRunning=false;
		}
	}
	
	function advanceRunners(count, pushAll, outsInPlay)
	{
		"use strict";
		if(pushAll==null)
			pushAll=CONFIG.pushRunnersOnHit;
		if(outsInPlay==null)
			outsInPlay = 0;
			
		var atbat = getCurrentAtBat();
		var halfInning = getCurrentHalfInning();
		var newbases = atbat.bases.clone();
		
		for(var i=newbases.length-1; i>=0; i--)
		{
			if(newbases[i].player!=null)
			{
				var pushthis = pushAll;
				if(!pushAll)
				{
					var filled = true;
					for(var j=i; j>=0; j--)
					{
						if(newbases[j].player==null)
						{
							filled=false;
							break;
						}
					}
					pushthis=filled;
				}
				if(pushthis)
				{
					if(newbases.length-1>i+count)
					{//advance player
						newbases[i+count].player = newbases[i].player;
					}
					else
					{// score
						if(outsInPlay+halfInning.currentouts<CONFIG.outsPerInning)
						{
							atbat.runsScored++;
							atbat.runnersScored[atbat.runnersScored.length] = newbases[i].player;
						}
					}
					newbases[i].player = null;
				}
			}
		}
		return newbases;
	}
	
	function getCurrentAtBat()
	{
		"use strict";
		var hi = getCurrentHalfInning();
		if(hi==null)
			return null;
		return hi.atbats[hi.atbats.length-1];
	}
	
	
	function getCurrentHalfInning()
	{
		"use strict";
		if(currentGame==null)
			return null;
		return currentGame.halfinnings[currentGame.halfinnings.length-1];
	}
	
	function getCurrentTeamFielding()
	{
		"use strict";
		return getCurrentHalfInning().teamfielding;
	}
	function getCurrentTeamBatting()
	{
		"use strict";
		return getCurrentHalfInning().teambatting;
	}
	function gameReviver(key, value)
	{
		"use strict";
	
		// if this is a game object and it is missing a getId function, set it up
		if(value!=null && value.players!=null && value.currentbatter!=null
			 && value.currentpitcher!=null && value.name!=null && value.getId==null)
		{
			value.getId = function(){
				
				var id = this.name;
				for(var i=0;i<this.players.length; i++)
					id += this.players[i].name;
				return id;
			};
		}
		// if this is a game object and it is missing a innings property - set it to default
		if(value!=null && value.players!=null && value.currentbatter!=null
			 && value.currentpitcher!=null && value.name!=null && value.innings==null)
			value.innings = CONFIG.inningsPerGame;
			
			
		// if this is a atbat object and it is missing a runnersOut property - set it to default
		if(value!=null && value.pitcher!=null && value.pitcherIndex!=null
			 && value.batter!=null && value.batterIndex!=null && value.runnersOut==null)
			value.runnersOut = [];
			
			
		return value;
	}
	function getGames()
	{
		"use strict";
		if(localStorage["games"]==null)
			return [];
		return JSON.parse(localStorage["games"],gameReviver);
    }
	function getConfig()
	{
		"use strict";
		if(localStorage["config"]==null)
			return CONFIG;
		var config = JSON.parse(localStorage["config"]);
		if(config.pushRunnersOnHit==null)
			config.pushRunnersOnHit = true;
		if(config.startingBalls==null)
			config.startingBalls = 0;
		if(config.startingStrikes==null)
			config.startingStrikes = 0;
		if(config.halfInningSkip==null)
			config.halfInningSkip = true;
		return config;
    }
	var savedgamesloaded=true;
    function getSavedGames() {
		"use strict";
		if(CONFIG.connectToServer && window.navigator.onLine)
		{
			savedgamesloaded=false;
			$.getJSON(LOAD_URL, function (data) {
				
				savedGames = JSON.parse(JSON.stringify(data),gameReviver);
				//console.log(savedGames);
				savedgamesloaded=true;
				setTimeout(function(){	
					hidePageLoadingMsg();
				},CONFIG.clearDelay);
			})
			.error(function(jqXHR, textStatus, errorThrown) {
				//console.log("error " + textStatus);
				//console.log("incoming Text " + jqXHR.responseText);
				savedGames = [];
				savedgamesloaded=true;
				setTimeout(function(){	
					hidePageLoadingMsg();
				},CONFIG.clearDelay);
			})
			;
		}
    }
	function saveGames(games)
	{
		"use strict";
		if(savedgamesloaded)
			post();
		undos[undos.length] = JSON.stringify(currentGame);
		localStorage["games"] = JSON.stringify(games);
	}
	function saveConfig()
	{
		"use strict";
		localStorage["config"] = JSON.stringify(CONFIG);
	}
	function undo()
	{
		"use strict";
		if(undos.length-2>=0)
		{
			redos[redos.length] = JSON.stringify(currentGame);
			currentGame = JSON.parse(undos[undos.length-2],gameReviver); // last is current state, skip one more back
			games[currentGameIndex] = currentGame;
			saveGames(games);
			undos.remove(undos.length-2, undos.length-1); // need to remove the last two - the savegames above just added one.
			bindGame();
		}
	}
	function redo()
	{
		"use strict";
		if(redos.length>0)
		{
			currentGame = JSON.parse(redos[redos.length-1],gameReviver);
			games[currentGameIndex] = currentGame;
			saveGames(games);
			redos.remove(redos.length-1);
			bindGame();
		}
	}
	function post()
	{
		"use strict";
		if(CONFIG.connectToServer && window.navigator.onLine)
		{
			if(currentGame && currentGame.season && currentGame.season.length>0)
			{
				var gamename = currentGame.team2.name + " at " + currentGame.team1.name;
				$.post(POST_URL, 
					{
						json: JSON.stringify(currentGame), 
						name: gamename, 
						id: currentGame.id,
						season: currentGame.season
					},
					function(data){
						
						if(data.id)
						{
							currentGame.id=data.id;
						}
					});
			}
		}
	}
	function output()
	{
		"use strict";
		console.log(currentGame);
		console.log(JSON.stringify(currentGame));
	}
	
	
	function bindGameStats()
	{
		"use strict";
		if($("#gamestats:visible").length==0)
			return;
		if(!savedgamesloaded)
		{
			setTimeout(bindGameStats,100);
			return;
		}
		setBoxScores($("#boxscore"));
		setTeamStats($("#team1batting"),currentGame.team1,true);
		setTeamStats($("#team2batting"),currentGame.team2,true);
		setTeamStats($("#team1pitching"),currentGame.team1,false);
		setTeamStats($("#team2pitching"),currentGame.team2,false);
		
		$("#team1batting").tablesorter(); 
		$("#team2batting").tablesorter(); 
		$("#team1pitching").tablesorter(); 
		$("#team2pitching").tablesorter(); 
		
		var emaillink = "mailto:?subject="+escape("Game Stats For "+currentGame.team2.name+" at "+currentGame.team1.name)+"&body=";
		
		emaillink += escape("<h2>Box Score</h2>"+getOuterHTML($("#boxscore")));
		
		emaillink += escape("<h2>"+currentGame.team1.name+" Batting</h2>"+getOuterHTML($("#team1batting")));
		emaillink += escape("<h2>"+currentGame.team2.name+" Batting</h2>"+getOuterHTML($("#team2batting")));
		
		emaillink += escape("<h2>"+currentGame.team1.name+" Pitching</h2>"+getOuterHTML($("#team1pitching")));
		emaillink += escape("<h2>"+currentGame.team2.name+" Pitching</h2>"+getOuterHTML($("#team2pitching")));
		
		$("#gamestatemail").attr("href",emaillink);
	
		setTimeout(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}
	function getOuterHTML($element)
	{
		return $element.clone().wrap('<div>').parent().html();
	}
	function addTableStatHeader($table)
	{
		"use strict";
		$table.find("thead tr").append("<th title='players name'>Name</th>");
		$table.find("thead tr").append("<th title='games played'>GP</th>");
		$table.find("thead tr").append("<th title='innings played'>IP</th>");
		$table.find("thead tr").append("<th title='hits'>H</th>");
		$table.find("thead tr").append("<th title='hits per inning'>H/I</th>");
		$table.find("thead tr").append("<th title='runs batted in'>RBI</th>");
		$table.find("thead tr").append("<th title='RBI per inning'>RBI/I</th>");
		$table.find("thead tr").append("<th title='runs scored'>R</th>");
		$table.find("thead tr").append("<th title='runs per inning'>R/I</th>");
		$table.find("thead tr").append("<th title='walks'>W</th>");
		$table.find("thead tr").append("<th title='walk percentage'>W%</th>");
		$table.find("thead tr").append("<th title='errors'>E</th>");
		$table.find("thead tr").append("<th title='at bats'>AB</th>");
		$table.find("thead tr").append("<th title='strikeouts'>K</th>");
		$table.find("thead tr").append("<th title='strikeout percentage'>K%</th>");
		$table.find("thead tr").append("<th title='batting average'>AVG</th>");
		$table.find("thead tr").append("<th title='plate appearances'>PA</th>");
		$table.find("thead tr").append("<th title='on base percentage'>OB%</th>");
		$table.find("thead tr").append("<th title='singles'>1B</th>");
		$table.find("thead tr").append("<th title='singles per inning'>1B/I</th>");
		$table.find("thead tr").append("<th title='doubles'>2B</th>");
		$table.find("thead tr").append("<th title='doubles per inning'>2B/I</th>");
		$table.find("thead tr").append("<th title='triples'>3B</th>");
		$table.find("thead tr").append("<th title='triples per inning'>3B/I</th>");
		$table.find("thead tr").append("<th title='home runs'>HR</th>");
		$table.find("thead tr").append("<th title='home runs per inning'>HR/I</th>");
		$table.find("thead tr").append("<th title='total bases'>TB</th>");
		$table.find("thead tr").append("<th title='total bases per inning'>TB/I</th>");
		$table.find("thead tr").append("<th title='slugging percentage'>SLG</th>");
		$table.find("thead tr").append("<th title='on base plus slugging'>OPS</th>");
		$table.find("thead tr").append("<th title='pitches'>P</th>");
		$table.find("thead tr").append("<th title='pitches per inning'>P/I</th>");
		$table.find("thead tr").append("<th title='balls'>B</th>");
		$table.find("thead tr").append("<th title='strikes'>S</th>");
		$table.find("thead tr").append("<th title='strike percentage'>S%</th>");
		$table.find("thead tr").append("<th title='swings'>SW</th>");
		$table.find("thead tr").append("<th title='swing percentage'>SW%</th>");
	}
	function bindSeasonStat($table,games,isbatting)
	{
		"use strict";
		$table.find("tr").remove();
		
		
		$table.find("thead").append("<tr />");
		
		addTableStatHeader($table);
		
		var players = [];
		for(var i=0; i<games.length; i++)
		{
			for(var j=0; j<games[i].team1.players.length; j++)
			{
				if($.inArray(games[i].team1.players[j].name,players)===-1)
					players[players.length] = games[i].team1.players[j].name;
			}
			for(var j=0; j<games[i].team2.players.length; j++)
			{
				if($.inArray(games[i].team2.players[j].name,players)===-1)
					players[players.length] = games[i].team2.players[j].name;
			}
		}
		for(var i=0; i<players.length; i++)
		{
			var $tr = $("<tr />");
			addPlayerStats($tr, games, players[i],isbatting);
			$table.find("tbody").append($tr);
		}
	}
	function bindSeasonStats()
	{
		"use strict";
		if(!savedgamesloaded)
		{
			setTimeout(bindSeasonStats,100);
			return;
		}
		var games = getGames();
		CONFIG = getConfig();

		if(currentSeasonIndex>=0)
			games = savedGames[currentSeasonIndex].games;
		
		bindSeasonStat($("#playerbatting"),games,true);
		
		bindSeasonStat($("#playerpitching"),games,false);
		
		$("#playerbatting").tablesorter(); 
		$("#playerpitching").tablesorter(); 
		
		
		var emaillink = "mailto:?subject="+escape("Player Stats")+"&body=";
		
		
		emaillink += escape("<h2>Batting</h2>"+getOuterHTML($("#playerbatting")));
		
		emaillink += escape("<h2>Pitching</h2>"+getOuterHTML($("#playerpitching")));
		
		$("#seasonstatemail").attr("href",emaillink);
		
		setTimeout(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}
		
	function addPlayerStats($tr,currentGame,player, isbatting)
	{
		"use strict";
		if(player.name!=null)
			player = player.name;
		if(isbatting==null)
			isbatting = true;
			
		
		var gp = getPlayerGames(currentGame,player,isbatting);
		var ip = getPlayerInnings(currentGame,player,isbatting);
		var pas = getPlayerOutcomes(currentGame,player,plateappearanceregex, isbatting);
		var abs = getPlayerOutcomes(currentGame,player,atbatregex, isbatting);
		var ks = getPlayerOutcomes(currentGame,player,strikeoutregex, isbatting);
		var hits = getPlayerOutcomes(currentGame,player,hitregex, isbatting);
		var rbi = (getPlayerOutcomesScore(currentGame,player,hitregex, isbatting)+getPlayerOutcomesScore(currentGame,player,walkregex, isbatting));
		var walks = getPlayerOutcomes(currentGame,player,walkregex, isbatting);
		var errors = getPlayerOutcomes(currentGame,player,errorregex, isbatting);
		var ob = roundNumber((hits+walks)/pas,3);
		var singles = getPlayerOutcomes(currentGame,player,singleregex, isbatting);
		var doubles = getPlayerOutcomes(currentGame,player,doubleregex, isbatting);
		var triples = getPlayerOutcomes(currentGame,player,tripleregex, isbatting);
		var homeruns = getPlayerOutcomes(currentGame,player,homerregex, isbatting);
		var runs = getPlayerRunsScored(currentGame,player,isbatting);
		
		var pitches = getPlayerPitches(currentGame,player,pitchregex, isbatting);
		var balls = getPlayerPitches(currentGame,player,ballregex, isbatting);
		var strikes = (pitches-balls);
		var swings = getPlayerPitches(currentGame,player,swingregex, isbatting);
		
		var tb = singles +
			doubles*2 +
			triples*3 +
			homeruns*4;
			
		var slg = roundNumber(tb/abs,3);
		
		$tr.append("<th>"+player+"</th>");
		$tr.append("<td>"+gp+"</td>");
		$tr.append("<td>"+ip+"</td>");
		
		$tr.append("<td>"+hits+"</td>");
		$tr.append("<td>"+roundNumber(hits/ip,3)+"</td>");
			
	
		$tr.append("<td>"+rbi+"</td>");
		$tr.append("<td>"+roundNumber(rbi/ip,3)+"</td>");
		
		$tr.append("<td>"+runs+"</td>");
		$tr.append("<td>"+roundNumber(runs/ip,3)+"</td>");
		
		$tr.append("<td>"+walks+"</td>");
		
		
		$tr.append("<td>"+roundNumber(walks/pas,3)+"</td>");
		
		$tr.append("<td>"+errors+"</td>");
		
		$tr.append("<td>"+abs+"</td>");
		
		$tr.append("<td>"+ks+"</td>");
		
		
		$tr.append("<td>"+roundNumber(ks/pas,3)+"</td>");
		
		
		$tr.append("<td>"+roundNumber(hits/abs,3)+"</td>");
		
		
		$tr.append("<td>"+pas+"</td>");
		
		$tr.append("<td>"+ob+"</td>");
		
		$tr.append("<td>"+singles+"</td>");
		
		$tr.append("<td>"+roundNumber(singles/ip,3)+"</td>");
		
		$tr.append("<td>"+doubles+"</td>");
		
		$tr.append("<td>"+roundNumber(doubles/ip,3)+"</td>");
		
		$tr.append("<td>"+triples+"</td>");
		
		$tr.append("<td>"+roundNumber(triples/ip,3)+"</td>");
		
		$tr.append("<td>"+homeruns+"</td>");
		
		$tr.append("<td>"+roundNumber(homeruns/ip,3)+"</td>");
		
			
		$tr.append("<td>"+tb+"</td>");
		
		$tr.append("<td>"+roundNumber(tb/ip,3)+"</td>");
		
		$tr.append("<td>"+slg+"</td>");
		
		$tr.append("<td>"+roundNumber(parseFloat(slg)+parseFloat(ob),3)+"</td>");
		
		$tr.append("<td>"+pitches+"</td>");
		
		$tr.append("<td>"+roundNumber(pitches/ip,3)+"</td>");
		$tr.append("<td>"+balls+"</td>");
		$tr.append("<td>"+strikes+"</td>");
		
		$tr.append("<td>"+roundNumber(strikes/pitches,3)+"</td>");
		
		$tr.append("<td>"+swings+"</td>");
		
		$tr.append("<td>"+roundNumber(swings/pitches,3)+"</td>");
		
	}
	
	function setTeamStats($table,team, isbatting)
	{
		"use strict";
		$table.find("tr").remove();
		$table.find("thead").append("<tr/>");
		for(var i=0; i<team.players.length+1; i++)
			$table.find("tbody").append("<tr/>");
			
		addTableStatHeader($table);
		
		for(var i=0; i<team.players.length; i++)
		{
			var $tr = $table.find("tbody tr:eq("+i+")");
			addPlayerStats($tr,currentGame,team.players[i],isbatting);
		}
		
		if(isbatting)
		{
		
			var gp = getTeamGames(currentGame,team);
			var ip = getTeamInnings(currentGame,team, isbatting);
			var pas = getTeamOutcomes(currentGame,team,plateappearanceregex, isbatting);
			var abs = getTeamOutcomes(currentGame,team,atbatregex, isbatting);
			var ks = getTeamOutcomes(currentGame,team,strikeoutregex, isbatting);
			var hits = getTeamOutcomes(currentGame,team,hitregex, isbatting);
			var rbi = (getTeamOutcomesScore(currentGame,team,hitregex, isbatting)+getTeamOutcomesScore(currentGame,team,walkregex, isbatting));
			var walks = getTeamOutcomes(currentGame,team,walkregex, isbatting);
			var errors = getTeamOutcomes(currentGame,team,errorregex, isbatting);
			var ob = roundNumber((hits+walks)/pas,3);
			var singles = getTeamOutcomes(currentGame,team,singleregex, isbatting);
			var doubles = getTeamOutcomes(currentGame,team,doubleregex, isbatting);
			var triples = getTeamOutcomes(currentGame,team,tripleregex, isbatting);
			var homeruns = getTeamOutcomes(currentGame,team,homerregex, isbatting);
			
			var pitches = getTeamPitches(currentGame,team,pitchregex,isbatting);
			var balls = getTeamPitches(currentGame,team,ballregex,isbatting);
			var strikes = (pitches-balls);
			var swings = getTeamPitches(currentGame,team,swingregex, isbatting);
			var runs = 0;
			
			var tb = singles +
				doubles*2 +
				triples*3 +
				homeruns*4;
				
			var slg = roundNumber(tb/abs,3);
				
			var $tr = $table.find("tbody tr:eq("+team.players.length+")");
			$tr.append("<th>"+team.name+"</th>");
			
			$tr.append("<td>"+gp+"</td>");
			$tr.append("<td>"+ip+"</td>");
			
			$tr.append("<td>"+hits+"</td>");
			$tr.append("<td>"+roundNumber(hits/ip,3)+"</td>");
		
			$tr.append("<td>"+rbi+"</td>");
			$tr.append("<td>"+roundNumber(rbi/ip,3)+"</td>");

			
			$tr.append("<td>"+runs+"</td>");
			$tr.append("<td>"+roundNumber(runs/ip,3)+"</td>");

			
			$tr.append("<td>"+walks+"</td>");
			
			$tr.append("<td>"+roundNumber(walks/pas,3)+"</td>");

			
			$tr.append("<td>"+errors+"</td>");
			
			$tr.append("<td>"+abs+"</td>");
			
			$tr.append("<td>"+ks+"</td>");
			
			$tr.append("<td>"+roundNumber(ks/pas,3)+"</td>");

			
			$tr.append("<td>"+roundNumber(hits/abs,3)+"</td>");

			
			$tr.append("<td>"+pas+"</td>");
			
			$tr.append("<td>"+ob+"</td>");
			
			$tr.append("<td>"+singles+"</td>");
			$tr.append("<td>"+roundNumber(singles/ip,3)+"</td>");

			
			$tr.append("<td>"+doubles+"</td>");
			$tr.append("<td>"+roundNumber(doubles/ip,3)+"</td>");

			
			$tr.append("<td>"+triples+"</td>");
			$tr.append("<td>"+roundNumber(triples/ip,3)+"</td>");

			
			$tr.append("<td>"+homeruns+"</td>");
			$tr.append("<td>"+roundNumber(homeruns/ip,3)+"</td>");

			
				
			$tr.append("<td>"+tb+"</td>");
			$tr.append("<td>"+roundNumber(tb/ip,3)+"</td>");

			
			$tr.append("<td>"+slg+"</td>");
			
			$tr.append("<td>"+roundNumber(parseFloat(slg)+parseFloat(ob),3)+"</td>");
			
			$tr.append("<td>"+pitches+"</td>");
			$tr.append("<td>"+roundNumber(pitches/ip,3)+"</td>");

			$tr.append("<td>"+balls+"</td>");
			$tr.append("<td>"+strikes+"</td>");
			$tr.append("<td>"+roundNumber(strikes/pitches,3)+"</td>");

			$tr.append("<td>"+swings+"</td>");
			$tr.append("<td>"+roundNumber(swings/pitches,3)+"</td>");

		}
	
	}
	function setBoxScores($table)
	{
		"use strict";
		if(currentGame!=null)
		{
			$table.find("tr").remove();
			$table.find("thead").append("<tr/>");
			$table.find("tbody").append("<tr/>").append("<tr/>");
			
			$table.find("thead tr").append("<th>Team</th>");
			$table.find("tbody tr:eq(0)").append("<th>"+currentGame.team2.name+"</th>");
			$table.find("tbody tr:eq(1)").append("<th>"+currentGame.team1.name+"</th>");
			
			$table.find("thead tr").append("<th class='spacer'>&nbsp;</th>");
			$table.find("tbody tr:eq(0)").append("<th class='spacer'>&nbsp;</th>");
			$table.find("tbody tr:eq(1)").append("<th class='spacer'>&nbsp;</th>");
			
			for(var i=0; i<currentGame.halfinnings.length; i++)
			{
				if(currentGame.halfinnings[i].atbats[0].pitches.length===0)
				{ // very start of halfinning - post a 0
					if(i%2===0) //top of inning, add header too
						$table.find("thead tr").append("<th>"+((i/2)+1)+"</th>");
					$table.find("tbody tr:eq("+(i%2)+")").append("<td>0</td>");
					continue;
				}
				if(i%2===0)
				{
					$table.find("thead tr").append("<th>"+((i/2)+1)+"</th>");
					
					$table.find("tbody tr:eq(0)").append("<td>"+getHalfInningScore(currentGame.halfinnings[i])+"</td>");
				}
				else
				{
					$table.find("tbody tr:eq(1)").append("<td>"+getHalfInningScore(currentGame.halfinnings[i])+"</td>");
				}
			}
			if($table.find("tbody tr:eq(0) td, tbody tr:eq(0) th").length>$table.find("tbody tr:eq(1) td,tbody tr:eq(1) th").length)
				$table.find("tbody tr:eq(1)").append("<td>&nbsp;</td>");
			
			$table.find("thead tr").append("<th class='spacer'>&nbsp;</th>");
			$table.find("tbody tr:eq(0)").append("<td class='spacer'>&nbsp;</td>");
			$table.find("tbody tr:eq(1)").append("<td class='spacer'>&nbsp;</td>");
			
			$table.find("thead tr").append("<th>R</th>");
			$table.find("tbody tr:eq(0)").append("<th>"+getTeamScore(currentGame,currentGame.team2)+"</th>");
			$table.find("tbody tr:eq(1)").append("<th>"+getTeamScore(currentGame,currentGame.team1)+"</th>");
			
			
			$table.find("thead tr").append("<th>H</th>");
			$table.find("tbody tr:eq(0)").append("<td>"+getTeamOutcomes(currentGame,currentGame.team2,hitregex)+"</td>");
			$table.find("tbody tr:eq(1)").append("<td>"+getTeamOutcomes(currentGame,currentGame.team1,hitregex)+"</td>");
		
			
			
			$table.find("thead tr").append("<th>E</th>");
			$table.find("tbody tr:eq(0)").append("<td>"+getTeamOutcomes(currentGame,currentGame.team1,errorregex)+"</td>");
			$table.find("tbody tr:eq(1)").append("<td>"+getTeamOutcomes(currentGame,currentGame.team2,errorregex)+"</td>");
		}
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
	