/*************** bigleague.gamelist.js ***********/

	var isloading=false;
	function bindGames()
	{
		"use strict";
		if($("#continue:visible,#stats:visible").length==0)
			return;
		if(!savedgamesloaded)
		{
			doWorkerThread(bindGames,100);
			
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
					
					resetFielders();
					
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
						saveGame(currentGameIndex);

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
		doWorkerThread(function(){	
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
	
	function updateGameStorage()
	{
		"use strict";
		if(localStorage["games"]!=null && localStorage["games"]!="null")   // update to new individual game storage method
		{
			var allgames = JSON.parse(localStorage["games"],gameReviver);
			var gameids = [];
			for(var i=0; i<allgames.length; i++)
			{
				localStorage["game_"+allgames[i].guid] = JSON.stringify(allgames[i]);
				gameids[gameids.length] = allgames[i].guid;
			}
			localStorage["gameids"] = JSON.stringify(gameids);
			localStorage["games"] = null;
		}
	}
	function getGame(index)
	{
		"use strict";
		updateGameStorage();
		
		var gameids = getGameIds();
		
		return JSON.parse(localStorage["game_"+gameids[index]], gameReviver);
	}
	function getGameIds()
	{
		if(localStorage["gameids"]==null)
			return [];
		
		return JSON.parse(localStorage["gameids"]);
	}
	function getGames()
	{
		"use strict";
		
		updateGameStorage();
		
		var gameids = getGameIds();
		
		var games = [];
		
		for(var i=0; i<gameids.length; i++)
			games[games.length] = getGame(i);
			
		return games;
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
				doWorkerThread(function(){	
					hidePageLoadingMsg();
				},CONFIG.clearDelay);
			})
			.error(function(jqXHR, textStatus, errorThrown) {
				//console.log("error " + textStatus);
				//console.log("incoming Text " + jqXHR.responseText);
				savedGames = [];
				savedgamesloaded=true;
				doWorkerThread(function(){	
					hidePageLoadingMsg();
				},CONFIG.clearDelay);
			})
			;
		}
    }
	function saveGame(index, saveundo)
	{
		"use strict";
		
		if(saveundo==null)
			saveundo = true;
		
		if(savedgamesloaded)
			post();
			
		var curGame = JSON.stringify(currentGame);
		
		if(saveundo)
			undos[undos.length] = curGame;		
		
		var gameids = getGameIds();
		
		if(gameids.length>index)
			localStorage["game_"+gameids[index]]=curGame;
	}
	function saveGames(games)
	{
		"use strict";
		
		saveGame(currentGameIndex);
		
		var gameids = [];
		for(var i=0; i<games.length; i++)
		{
			gameids[gameids.length] = games[i].guid;
			localStorage["game_"+games[i].guid] = JSON.stringify(games[i]);
		}
		localStorage["gameids"] = JSON.stringify(gameids);
	}