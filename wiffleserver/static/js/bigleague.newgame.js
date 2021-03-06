/*************** bigleague.newgame.js ***********/


	var newgameinited=false;
	function newGameInit() {
		if(!newgameinited)
		{
			newgameinited=true;
			
			$("#newgameform div.player").each(function(){
				var $this=$(this);
				$this.append(HANDLE_HTML)
				.draggable({
						revert:'invalid',
						axis: "y",
						opacity: .7,
						cursorAt: { left: 0, top:0 },
						handle: ".handle"
				})
				.droppable({
						tolerance: "pointer",
						accept: function(draggable){
							var myRegexp = /.*(team\d).*/g;
							var teamclass = myRegexp.exec($(this).attr("class"))[1];
							return draggable.is("."+teamclass);
						},
						activeClass: "player-active",
						hoverClass: "player-hover",
						drop: function( event, ui ) {  
							var $target = $(this);
							var $source = ui.draggable;
							var val = $target.val();
							
							var teamclass = "."+((/.*(team\d).*/g).exec($target.attr("class"))[1]);
							var $players = $("#newgameform div"+teamclass);
							
							var from = $players.index($source)+1;
							var to = $players.index($target)+1;
							
							var moving = $source.find("input").val();
							
							var id = $source.find("input").attr("id");
							var ind = id.indexOf("_");
							var postfix = "";
							if(ind>=0)
								postfix = id.substring(ind);
							
							if(from<to)
							{//move source down - means move others up
								for(var i=from; i<to; i++)
								{
									$("#player"+i+postfix).val($("#player"+(i+1)+postfix).val());
								}
							}
							else
							{ //  move source up - means move others down
								for(var i=from; i>to; i--)
								{
									$("#player"+i+postfix).val($("#player"+(i-1)+postfix).val());
								}
							}
							$("#player"+to+postfix).val(moving);
							
							$source.css("top","0px");
						}
							
				});
				
			});
			
			$("#swapteams").click(function(e) {
				
				//swap team names
				var team1 = $("#team1").val();
				$("#team1").val($("#team2").val());
				$("#team2").val(team1);
				
				// swap players
				for (var i = 1; i <= CONFIG.maxTeamPlayers; i++) {
					var team1player = $("#player"+i).val();
					$("#player"+i).val($("#player"+i+"_2").val());
					$("#player"+i+"_2").val(team1player);
				}
				
				e.preventDefault();
			});
			
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
	
	
	function bindNewGame()
	{
		"use strict";
		if($("#newgame:visible").length==0)
			return;
		if(!savedgamesloaded)
		{
			doWorkerThread(bindNewGame,100);
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
		doWorkerThread(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}
	
	