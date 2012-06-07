
/**************** bigleague.stats.js ****************/
	
	
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
					
					if(outcome!=null && outcome.indexOf("-skip")===-1) //don't count inning skips for/against player stats
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
					
					
					if(outcome!=null && outcome.indexOf("-skip")===-1) //don't count inning skips for/against player stats
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
	