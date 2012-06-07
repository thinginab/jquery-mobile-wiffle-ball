/*************** bigleague.gamestats.js ***********/

	function bindGameStats()
	{
		"use strict";
		if($("#gamestats:visible").length==0)
			return;
		if(!savedgamesloaded)
		{
			doWorkerThread(bindGameStats,100);
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
	
		doWorkerThread(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}