/*************** bigleague.seasonstats.js ***********/

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
			doWorkerThread(bindSeasonStats,100);
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
		
		doWorkerThread(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}
	
	