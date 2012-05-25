
/**************** bigleague.classes.js ****************/

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