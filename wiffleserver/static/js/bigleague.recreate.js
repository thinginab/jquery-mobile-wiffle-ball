
/**************** bigleague.recreate.js ****************/

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
	