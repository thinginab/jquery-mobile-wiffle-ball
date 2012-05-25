/*************** bigleague.scoregamelogic.js ***********/



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