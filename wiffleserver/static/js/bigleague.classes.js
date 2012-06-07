
/**************** bigleague.classes.js ****************/

	function Game (type) {
		"use strict";
		this.team1 = new Team();
		this.team2 = new Team();
		this.id = "";
		this.season = "";
		this.innings = CONFIG.inningsPerGame;
		
		this.halfinnings = [];
		this.type = "Game";
		this.guid = newGuid();
		
	};
	function Base(type){
		"use strict";
		this.number = 0;
		this.player = null;
		this.type = "Base";
	};
	function Team(type){
		"use strict";
		this.name = "";
		this.players = [];
		this.currentbatter = -1;
		this.currentpitcher = -1;
		this.type = "Team";
	};
	
	function Player(type){
		"use strict";
		this.name = "";
		this.skip = false;
		this.type = "Player";
	};
	function HalfInning(type){
		"use strict";
		this.teamFielding = null;
		this.teamBatting = null;
		this.number = 1;
		this.top = true;
		this.currentouts = 0;
		this.atbats = [];
		this.type = "HalfInning";
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
		this.type = "AtBat";
	};
	
	function newBaseArray()
	{
		var bases = [];
		for(var i=0;i<4; i++)
		{
			bases[i] = new Base();
			bases[i].number = i+1;
		}
		return bases;
	}
	
	function gameReviver(key, value)
	{
		"use strict";
		
		// set types where missing
		
		if(value!=null && value.type==null && value.halfinnings!=null)
		{
			value.type = "Game";
		}
		else if(value!=null && value.type==null && value.pitcher!=null
			 && value.batter!=null)
		{
			value.type = "AtBat";
		}
		else if(value!=null && value.type==null && value.name!=null && value.players!=null)
		{
			value.type = "Team";
		}
		else if(value!=null && value.type==null && value.name!=null)
		{
			value.type = "Player";
		}
		else if(value!=null && value.type==null && value.number!=null && value.currentouts!=null && value.top!=null)
		{
			value.type = "HalfInning";
		}
		else if(value!=null && value.type==null && value.number!=null)
		{
			value.type = "Base";
		}
		
		//set missing properties and functions to defaults
		
		if(value!=null && value.type==="Game")
		{
			if(value.innings==null)
				value.innings = CONFIG.inningsPerGame;
				
			if(value.guid==null)
				value.guid = newGuid();
		}
		
		if(value!=null && value.type==="Team")
		{
			if(value.getId==null)
			{
				value.getId = function(){
					
					var id = this.name;
					for(var i=0;i<this.players.length; i++)
						id += this.players[i].name;
					return id;
				};
			}
		}
		
		if(value!=null && value.type==="AtBat")
		{
			if(value.runnersOut==null)
				value.runnersOut = [];
				
			if(value.runnersScored==null)
				value.runnersScored = [];
			
			if(value.batterIndex==null)
				value.batterIndex = 0;
			
			if(value.pitcherIndex==null)
				value.pitcherIndex = 0;
		}
		
		if(value!=null && value.type==="Player")
		{
			if(value.addedToField==null)
				value.addedToField = false;
			if(value.skip==null)
				value.skip = false;
		}
			
		return value;
	}