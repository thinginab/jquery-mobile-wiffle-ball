
/**************** bigleague.config.js ****************/

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
	var HANDLE_HTML = "<span class='handle'><div class='bar'/><div class='bar'/><div class='bar'/></span><div class='clear' />";
	var CANVAS =  (!!document.createElement('canvas').getContext);
	var WEB_WORKERS = (!!window.Worker);
	var ISMOBILE = ('ontouchstart' in document.documentElement);
	
	
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
		
		
		if(!ISMOBILE)
		{
			config.processDelay = 0;
			//CONFIG.clearDelay = 0;
		}
			
		return config;
    }
	function saveConfig()
	{
		"use strict";
		localStorage["config"] = JSON.stringify(CONFIG);
	}
	
	function bindConfig()
	{
		"use strict";
		if($("#config:visible").length==0)
			return;
		if(!savedgamesloaded)
		{
			doWorkerThread(bindConfig,100);
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
		
		
		doWorkerThread(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}
