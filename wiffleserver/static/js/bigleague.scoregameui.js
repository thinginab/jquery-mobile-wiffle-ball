/*************** bigleague.scoregameui.js ***********/
	
	var gameinited=false;
	function gameInit() {
		if(!gameinited)
		{
			gameinited=true;
			if(CONFIG.playClick)
			{
				$("ul li,.ui-btn").live(CONFIG.clickEvent,function(){
					
					try
					{
						if(clk==null)
							clk = new Audio(CLICK_URL);
						clk.play();
					}
					catch(exc){}
				});
			}
			
			var pitchulprocessing=false;
			var processultimeout=null;
			var clrultimeout=null;
			$("ul.inplay li a[data-pitch]").live(CONFIG.clickEvent,function () {
				
				if(!pitchulprocessing) // make sure we don't allow double processing/clicks
				{
					if(processultimeout!=null)
					{
						clearTimeout(processultimeout);
						processultimeout = null;
					}
					if(clrultimeout!=null)
					{
						clearTimeout(clrultimeout);
						clrultimeout = null;
					}
					pitchulprocessing=true;
					
					var $this = $(this);
					if(!$this.parent().hasClass(".ui-btn-active"))
						$this.parent().addClass(".ui-btn-active");
					
					if(!CONFIG.isMobile)
					{
						processPitch($this.attr("data-pitch"), $this.attr("data-fielded-by"));
					}
					
					
					processultimeout = setTimeout(function(){
						pitchulprocessing = true;
						processultimeout = null;
						
						var $li = $this.parents("li:first").removeClass("ui-btn-active");
						if(CONFIG.isMobile)
						{
							processPitch($this.attr("data-pitch"), $this.attr("data-fielded-by")); // processing early causes issues if innings/fielders change
						}
						
						if(clrultimeout!=null)
						{
							clearTimeout(clrultimeout);
							clrultimeout = null;
						}
						clrultimeout = setTimeout(function(){	
							clrultimeout = null;	
								
							$this.removeClass("ui-btn-active");
							
							pitchulprocessing = false;
						},CONFIG.clearDelay);
						pitchulprocessing = true;
					},CONFIG.processDelay);
					
					
				
				}
			});
			var pitchulprocessing2=false;
			var processultimeout2=null;
			var clrultimeout2=null;
			$("ul:not(.inplay) li a[data-pitch]").live(CONFIG.clickEvent,function () {
				
				if(!pitchulprocessing2) // make sure we don't allow double processing/clicks
				{
					if(processultimeout2!=null)
					{
						clearTimeout(processultimeout2);
						processultimeout2 = null;
					}
					if(clrultimeout2!=null)
					{
						clearTimeout(clrultimeout2);
						clrultimeout2 = null;
					}
					pitchulprocessing2=true;
					var $this = $(this);
					if(!$this.parent().hasClass(".ui-btn-active"))
						$this.parent().addClass(".ui-btn-active");
					
					if(!CONFIG.isMobile)
					{
						processPitch($this.attr("data-pitch"), $this.attr("data-fielded-by"));
					}
					
					processultimeout2 = setTimeout(function(){
						pitchulprocessing2 = true;
						processultimeout2 = null;
						
						var $li = $this.parents("li:first");
						if(CONFIG.isMobile)
						{
							processPitch($this.attr("data-pitch"), $this.attr("data-fielded-by")); // processing early causes issues if innings/fielders change
						}
						
						if(clrultimeout2!=null)
						{
							clearTimeout(clrultimeout2);
							clrultimeout2 = null;
						}
						clrultimeout2 = setTimeout(function(){	
							clrultimeout2 = null;	
								
							$this.removeClass("ui-btn-active");
							
							pitchulprocessing2 = false;
						},CONFIG.clearDelay);
						pitchulprocessing2 = true;
					},CONFIG.processDelay);
					
				
				}
			});
			var pitchbtnprocessing=false;
			var clrbtntimeout=null;
			var processtimeout=null;
			$("#pitches a[data-pitch]").bind(CONFIG.clickEvent,function () {
				var $this = $(this);
				if(!pitchbtnprocessing ) // make sure we don't allow double processing/clicks
				{
					pitchbtnprocessing = true;
					
					if(processtimeout!=null)
					{
						clearTimeout(processtimeout);
						processtimeout = null;
					}
					if(clrbtntimeout!=null)
					{
						clearTimeout(clrbtntimeout);
						clrbtntimeout = null;
					}
					pitchbtnprocessing = true;
					processtimeout = setTimeout(function(){ //processPitch "threaded" for ui responsiveness
						pitchbtnprocessing = true;
						processtimeout = null;
					
						processPitch($this.attr("data-pitch"), $this.attr("data-fielded-by"));
					
						
						if(clrbtntimeout!=null)
						{
							clearTimeout(clrbtntimeout);
							clrbtntimeout = null;
						}
						clrbtntimeout = setTimeout(function(){	
							clrbtntimeout = null;	
								
							$this.removeClass("ui-btn-active");
							
							pitchbtnprocessing = false;
						},CONFIG.clearDelay);
						pitchbtnprocessing = true;
						
					},CONFIG.processDelay);
				}
			});
			
			

			$("#undo").bind("click",function () {//need to use click because area changes.  ok to be slow.
				
				var $this = $(this);
				if(!$this.hasClass(".ui-btn-active"))
					$this.addClass(".ui-btn-active");
					
				undo();
				setTimeout(function(){
					var $li = $this.parents("li:first").removeClass("ui-btn-active");
				},CONFIG.clearDelay);
			});
			$("#basePath,#basePath_n").bind("click",function(){//need to use click because area changes.  ok to be slow.
				
				var hi = getCurrentHalfInning();
				
				if(hi.atbats.length>1)
				{
					$(".baserunner").empty();
					
					var ab = getCurrentAtBat();
					var lastab = hi.atbats[hi.atbats.length-2];
					
					
					for(var i=0; i<lastab.runnersScored.length; i++)
					{
						$("#runnersscored").append("<li class='runner' data-scored='true' data-scorerindex='"+i+"'>"+lastab.runnersScored[i].name+"</li>");
					}
					for(var i=0; i<ab.bases.length; i++)
					{
						if(ab.bases[i].player!=null)
						{
							$("#runner_"+(i+1)).append("<li class='runner' data-base='"+i+"'>"+ab.bases[i].player.name+"</li>");
						}
					}
					for(var i=0; i<lastab.runnersOut.length; i++)
					{
						$("#runnersout").append("<li class='runner' data-out='true' data-outindex='"+i+"'>"+lastab.runnersOut[i].name+"</li>");
					}
					
					$(".baserunner li.runner").draggable({
						revert:true,
						axis: "y",
						opacity: .7,
						cursorAt: { left: 0, top:0 }
					});
					
					if($(".baserunner").attr("data-inited")!=="true")
					{
						$(".baserunner").droppable({
							tolerance: "touch",
							accept: function(draggable){
								return draggable.is("li.runner") &&
									($(this).has(draggable).length!==0 || $(this).attr("id").indexOf("_")===-1 || !$(this).is(":has(li)"));
								
							},
							activeClass: "baserunner-active",
							hoverClass: "baserunner-hover",
							drop: function( event, ui ) {  
								$(this).prepend(ui.draggable);
							}
								
						});
						$(".baserunner").attr("data-inited","true");
					}
					
					if($("#saverunners").attr("data-inited")!=="true")
					{
						$("#saverunners").bind(CONFIG.clickEvent,function(){
							  $("ul:not(#runnersOut) li.runner,ul#runnersOut li.runner").each(function(){  // do 'runners out' last to prevent accidental skip to next inning
								var $r = $(this);
								var $p = $r.parent();
								if($p.attr("id")==="runnersout")
								{
									if($r.attr("data-out")!=="true")
									{
										if($r.attr("data-base")!=null)
										{
											//remove from base
											if(ab.bases[parseInt($r.attr("data-base"))].player.name==$r.text())
											{
												lastab.runnersOut[lastab.runnersOut.length] = ab.bases[parseInt($r.attr("data-base"))].player;
												ab.bases[parseInt($r.attr("data-base"))].player=null;
											}
										}
										if($r.attr("data-scored")==="true")
										{
											//remove score
											lastab.runsScored--;
											var index = parseInt($r.attr("data-scorerindex"));
											lastab.runnersOut[lastab.runnersOut.length] = lastab.runnersScored[index];
											lastab.runnersScored.remove(index,index+1);
										}
										//new out
										runnerOut();
									}
								}
								else if($p.attr("id")=="runnersscored")
								{
									if($r.attr("data-scored")!=="true")
									{
										//new run
										lastab.runsScored++;
										if($r.attr("data-base")!=null)
										{
											lastab.runnersScored[lastab.runnersScored.length] = ab.bases[parseInt($r.attr("data-base"))].player;
											ab.bases[parseInt($r.attr("data-base"))].player=null;
										}
										if($r.attr("data-out")==="true")
										{
											//remove out
											hi.currentouts--;
											var index = parseInt($r.attr("data-outindex"));
											lastab.runnersScored[lastab.runnersScored.length] = lastab.runnersOut[index];
											lastab.runnersOut.remove(index,index+1);
										}
									}
								}
								else
								{
									
										if($r.attr("data-base")!=null && $r.attr("data-base")!=$p.attr("data-base"))
										{
											//change base
											ab.bases[parseInt($p.attr("data-base"))].player=ab.bases[parseInt($r.attr("data-base"))].player;
											ab.bases[parseInt($r.attr("data-base"))].player=null;
										}
										if($r.attr("data-out")==="true")
										{
											//remove out
											hi.currentouts--;
											var index = parseInt($r.attr("data-outindex"));
											ab.bases[parseInt($p.attr("data-base"))].player = lastab.runnersOut[index];
											lastab.runnersOut.remove(index,index+1);
										}
										if($r.attr("data-scored")==="true")
										{
											//remove score
											lastab.runsScored--;
											var index = parseInt($r.attr("data-scorerindex"));
											ab.bases[parseInt($p.attr("data-base"))].player = lastab.runnersScored[index];
											lastab.runnersScored.remove(index,index+1);
										}
									
								}
							  });
							  hi.atbats[hi.atbats.length-1] = ab;
							  hi.atbats[hi.atbats.length-2] = lastab;
							  currentGame.halfinnings[currentGame.halfinnings.length-1] = hi;
							  $('.ui-dialog').dialog('close');
						});
						$("#saverunners").attr("data-inited","true");
					}
					
					$.mobile.changePage('#baserunning','pop',false,true);
					
				}
			});
			$("#doHalfInningSkip").bind("click",function () {//need to use click because area changes.  ok to be slow.
				
				//var $this = $(this);
				//if(!$this.hasClass(".ui-btn-active"))
				//	$this.addClass(".ui-btn-active");
				
				var score = getHalfInningScore(getCurrentHalfInning());
				$("#runsScored").val(score).attr("min",score);
				$.mobile.changePage('#skipHalfInningDialog','pop',false,true);
				$("#skipHalfInningDialog").find(".ui-header").removeClass("ui-corner-top");
				if($("#setrunsscoredandskip").attr("data-inited")!=="true")
				{
					$("#setrunsscoredandskip").bind(CONFIG.clickEvent,function(){
						  var additionalRuns = parseInt($('#runsScored').val()) - getHalfInningScore(getCurrentHalfInning());
						  var additionalOuts = CONFIG.outsPerInning - getCurrentHalfInning().currentouts;
						  for(var i=0; i<additionalOuts; i++)
						  {
							if(i==0)
								processPitch("out-skip-"+additionalRuns);
							else
								processPitch("out-skip");
						  }
						  $('.ui-dialog').dialog('close');
					});
					$("#setrunsscoredandskip").attr("data-inited","true");
				}
				
				//setTimeout(function(){
				//	var $li = $this.parents("li:first").removeClass("ui-btn-active");
				//},CONFIG.clearDelay);
			});
			
			
			$("#backtolist").bind(CONFIG.clickEvent,function(){
				
				var $this = $(this);
				if(!$this.hasClass(".ui-btn-active"))
					$this.addClass(".ui-btn-active");
				getSavedGames();
			});

			$("#redo").bind("click",function () {//need to use click because area changes.  ok to be slow.
				
				var $this = $(this);
				if(!$this.hasClass(".ui-btn-active"))
					$this.addClass(".ui-btn-active");
				redo();
				setTimeout(function(){
					
					$this.parents("li:first").removeClass("ui-btn-active");
				},CONFIG.clearDelay);
			});
			
			$("table.pitcher").bind(CONFIG.clickEvent,function () {
				
				
				var $this = $(this);
				if(!$this.hasClass(".ui-btn-active"))
					$this.addClass(".ui-btn-active");
					
			
				$.mobile.changePage('#changepitcher','pop',false,true);
				$("#newpitcher li").remove();
				for(var i=0; i<getCurrentTeamFielding().players.length; i++)
				{
					if(i!==getCurrentAtBat().pitcherIndex && getCurrentTeamFielding().players[i].skip!==true)
						$("#newpitcher").append("<li><a href='#' data-player='"+i+"'>"+getCurrentTeamFielding().players[i].name+"</a></li>");
				}
				$("#newpitcher").append("<li><a href='#' data-player='-1'>[sub out "+getCurrentTeamFielding().players[getCurrentAtBat().pitcherIndex].name+"]</a></li>");
				$("#newpitcher").listview("refresh");
				
				$("#changepitcher").find(".ui-header").removeClass("ui-corner-top");
				$("#newpitcher li a").bind(CONFIG.clickEvent,function () {
					var $this = $(this);
					if(!$this.parent().hasClass(".ui-btn-active"))
						$this.parent().addClass(".ui-btn-active");
						
					var newpitcherindex = $(this).attr("data-player");
					
					if(newpitcherindex==-1)
					{
						var newname = prompt("New player name?","");
						if(newname!=null)
						{
							if(currentGame.halfinnings.length%2===1) // team 1 fielding
							{
								substitutePlayer(currentGame.team1,getCurrentAtBat().pitcherIndex,newname);
								getCurrentHalfInning().teamfielding = currentGame.team1;
							}
							else
							{
								substitutePlayer(currentGame.team2,getCurrentAtBat().pitcherIndex,newname);
								getCurrentHalfInning().teamfielding = currentGame.team2;
							}
							
							newpitcherindex = getCurrentAtBat().pitcherIndex;
						}
						else
							return;
					}
					
					getCurrentTeamFielding().currentpitcher = newpitcherindex;
					
					var atbat = getCurrentAtBat();
					atbat.pitcherIndex = newpitcherindex;
					atbat.pitcher = getCurrentTeamFielding().players[newpitcherindex];
					
					saveGames(games);
					bindGame();
					$('.ui-dialog').dialog('close');
				});
				
				
				
				setTimeout(function(){
					
					var $li = $this.removeClass("ui-btn-active");
				},CONFIG.clearDelay);
				
			});
			
			
			$("table.batter").bind(CONFIG.clickEvent,function () {
				var $this = $(this);
				if(!$this.hasClass(".ui-btn-active"))
					$this.addClass(".ui-btn-active");
					
				$.mobile.changePage('#changebatter','pop',false,true);
				$("#newbatter li").remove();
				for(var i=0; i<getCurrentTeamBatting().players.length; i++)
				{
					if(i!==getCurrentAtBat().batterIndex && getCurrentTeamBatting().players[i].skip!==true)
						$("#newbatter").append("<li><a href='#' data-player='"+i+"'>"+getCurrentTeamBatting().players[i].name+"</a></li>");
				}
				$("#newbatter").append("<li><a href='#' data-player='-1'>[sub out "+getCurrentTeamBatting().players[getCurrentAtBat().batterIndex].name+"]</a></li>");
				$("#newbatter").listview("refresh");
				$("#newbatter li a").bind(CONFIG.clickEvent,function () {
					
					var $this = $(this);
					if(!$this.parent().hasClass(".ui-btn-active"))
						$this.parent().addClass(".ui-btn-active");
						
					var newbatterindex = $(this).attr("data-player");
					
					if(newbatterindex==-1)
					{
						var newname = prompt("New player name?","");
						if(newname!=null)
						{
							if(currentGame.halfinnings.length%2===1) // team 2 batting
							{
								substitutePlayer(currentGame.team2,getCurrentAtBat().batterIndex,newname);
								getCurrentHalfInning().teambatting = currentGame.team2;
							}
							else
							{
								substitutePlayer(currentGame.team1,getCurrentAtBat().pitcherIndex,newname);
								getCurrentHalfInning().teambatting = currentGame.team1;
							}
							
							newbatterindex = getCurrentAtBat().batterIndex;
						}
						else
							return;
					}
					
					getCurrentTeamBatting().currentbatter = newbatterindex;
					
					var atbat = getCurrentAtBat();
					atbat.batterIndex = newbatterindex;
					atbat.batter = getCurrentTeamBatting().players[newbatterindex];
					
					
					saveGames(games);
					bindGame();
					$('.ui-dialog').dialog('close');
				});

				$("#changebatter").find(".ui-header").removeClass("ui-corner-top");
				
				setTimeout(function(){
					
					$this.parents("li:first").removeClass("ui-btn-active");
				},CONFIG.clearDelay);
			});

			$(document).delegate("#post",CONFIG.clickEvent,function () {
				var $this = $(this);
				if(!$this.parent().hasClass(".ui-btn-active"))
					$this.parent().addClass(".ui-btn-active");
					
				if(currentGame.season && currentGame.season.length>0)
				{
					post();
				}
				else
				{
					$.mobile.changePage('#setseason','pop',false,true);
					$("#setseason").find(".ui-header").removeClass("ui-corner-top");
					$("#saveseason").bind(CONFIG.clickEvent,function(){
						  currentGame.season = $('#seasonName').val();
						  saveGames(games);
						  $("#server").hide();
						  $('.ui-dialog').dialog('close');
					});
					
				}
					setTimeout(function(){
						
						var $li = $this.parents("li:first").removeClass("ui-btn-active");
					},CONFIG.clearDelay);
			});
			$("#output").bind(CONFIG.clickEvent,function(){
				var $this = $(this);
				if(!$this.parent().hasClass(".ui-btn-active"))
					$this.parent().addClass(".ui-btn-active");
					
				output();
				setTimeout(function(){
					
					var $li = $this.parents("li:first").removeClass("ui-btn-active");
				},CONFIG.clearDelay);
			});
		}
	}
	


	function substitutePlayer(team,playerIndex,newname)
	{
		var curplayer = team.players[playerIndex];
		curplayer.skip = true;
		
		team.players[playerIndex] = new Player();
		team.players[playerIndex].name = newname;
		
		team.players[team.players.length] = curplayer;
	}
	
	
	function setGameViewMode()
	{
		"use strict";
		var width = $(window).width();
		if(viewMode==="wide" && width<480)
		{
			viewMode = "narrow";
			bindGame();
			
		}
		else if(viewMode==="narrow" && width>=480)
		{
			viewMode = "wide";
			bindGame();
		}
		var $basePath = $("#basePath");
		
		if($basePath[0].getContext)
		{
			drawBases($basePath);
			drawBases($("#basePath_n"));
		}
		
		if(viewMode==="wide") /* remove a stat column if "wide" mode is too small for it */
		{
			var $pittable = $("#pitcherstats");
			var pitcherstatwidth = $pittable.parent().width();
			
			if(pitcherstatwidth>=65) 
			{
				$("#pitcherstrikeouts,#pitcherstrikeouts_h").show();
			}
			else
			{
				$("#pitcherstrikeouts,#pitcherstrikeouts_h").hide();
			}
			
			var $battable = $("#batterstats");
			var batterstatwidth = $battable.parent().width();
						
			if(batterstatwidth>=120)
			{
				$("#widescore").removeClass("small");
			}
			else if(batterstatwidth>=90)
			{
				$("#batterwalks,#batterwalks_h").show();
				if(!$("#widescore").hasClass("small"))
					$("#widescore").addClass("small");
			}
			else
			{
				$("#batterwalks,#batterwalks_h").hide();
				if(!$("#widescore").hasClass("small"))
					$("#widescore").addClass("small");
			}
		}
		else if(viewMode==="narrow") // adapt heading sizes to fit
		{
			var paddingamt = 2.5;
			var batterpitchersize = .9;
			var countsize = .8;
			
			
			var fontpx = 22.0;
			var itempadding = paddingamt*fontpx;
			
			$(".scores").css("font-size",fontpx);
			$(".inning").css("font-size",fontpx);
			$("#narrowscore .batter").css("font-size",fontpx*batterpitchersize);
			$("#narrowscore .pitcher").css("font-size",fontpx*batterpitchersize);
			$(".count").css("font-size",fontpx*countsize);
			fontpx--;
			while(($(".scores").width() < ($("#hometeam").width()+itempadding) ||
				$(".scores").width() < ($("#awayteam").width()+itempadding)
				|| $(".inning").parent().width() < ($(".inning th").width()+itempadding)
				|| $("#narrowscore .batter").parent().width() < ($("#narrowscore .batter th").width()+itempadding))
				&& fontpx>=5)
			{
				$(".scores").css("font-size",fontpx);
				$(".inning").css("font-size",fontpx);
				$("#narrowscore .batter").css("font-size",fontpx*batterpitchersize);
				$("#narrowscore .pitcher").css("font-size",fontpx*batterpitchersize);
				$(".count").css("font-size",fontpx*countsize);
				fontpx--;
				itempadding = paddingamt*fontpx;
			}
			
		}
	}
	
	
	function bindGame()
	{
		"use strict";
		if(!savedgamesloaded)
		{
			setTimeout(bindGame,100);
			return;
		}
		if(currentGame==null)
			return;
			
		var atbat = getCurrentAtBat();
		var awayscore = getTeamScore(currentGame,currentGame.team2);
		var homescore = getTeamScore(currentGame,currentGame.team1);
		if(viewMode==="wide")
		{
			$("#batterabs").text(getPlayerOutcomes(currentGame,atbat.batter.name,atbatregex, true,false));
			$("#batterwalks").text(getPlayerOutcomes(currentGame,atbat.batter.name,walkregex, true,false));
			$("#batterhits").text(getPlayerOutcomes(currentGame,atbat.batter.name,hitregex, true,false));
			$("#batterrbi").text((getPlayerOutcomesScore(currentGame,atbat.batter.name,hitregex, true)+getPlayerOutcomesScore(currentGame,atbat.batter.name,walkregex, true)));
			$("#pitcherhits").text(getPlayerOutcomes(currentGame,atbat.pitcher.name,hitregex, false,false));
			$("#pitcherwalks").text(getPlayerOutcomes(currentGame,atbat.pitcher.name,walkregex, false,false));
			$("#pitcherstrikeouts").text(getPlayerOutcomes(currentGame,atbat.pitcher.name,strikeoutregex, false,false));
			$("#pitcherruns").text(getPlayerRunsScored(currentGame,atbat.pitcher.name,false));
			
			
			setBoxScores($("#gameboxscore"));
		
			$("#narrowscore").hide();
			$("#widescore").show();
		}
		else
		{
			$("#homescore").text(homescore);
			$("#awayscore").text(awayscore);
			
			$("#hometeam").text(currentGame.team1.name);
			$("#awayteam").text(currentGame.team2.name);
			
			$("#widescore").hide();
			$("#narrowscore").show();
			
		}
		
		
		$("#game h1").text(currentGame.team2.name + "(" + awayscore + ")" +
			" at " + currentGame.team1.name + "(" + homescore + ")");
		var halfinning = getCurrentHalfInning();
		$("#batter,#batter_n").text(atbat.batter.name);
		$("#pitcher,#pitcher_n").text(atbat.pitcher.name);
		$("#balls,#balls_n").text(atbat.currentballs);
		$("#strikes,#strikes_n").text(atbat.currentstrikes);
		$("#outs,#outs_n").text(halfinning.currentouts);
		$("#inning,#inning_n").text(((halfinning.top)?"top of ":"bottom of ") + halfinning.number);
		
		if(atbat.bases==null)
		{
			atbat.bases=[];
			for(var i=0;i<4; i++)
			{
				atbat.bases[i] = new Base();
				atbat.bases[i].number = i+1;
			}
		}
		var $basePath = $("#basePath");
		
		if($basePath[0].getContext)
		{
			drawBases($basePath,atbat.bases);
			drawBases($("#basePath_n"),atbat.bases);
		}
		else
		{
			if(atbat.bases[0].player==null)
				$("#first,#first_n").text("X");
			else
				$("#first,#first_n").text(atbat.bases[0].player.name);
			if(atbat.bases[1].player==null)
				$("#second,#second_n").text("X");
			else
				$("#second,#second_n").text(atbat.bases[1].player.name);
			if(atbat.bases[2].player==null)
				$("#third,#third_n").text("X");
			else
				$("#third,#third_n").text(atbat.bases[2].player.name);
		}
			
		
		if(undos.length<=1)
			$("#undoli").hide();
		else
			$("#undoli").show();
			
		if(redos.length===0)
			$("#redoli").hide();
		else
			$("#redoli").show();
		
		if((!CONFIG.doublePlayRunnersRequired || atbat.bases[0].player!=null) && halfinning.currentouts<CONFIG.outsPerInning-1)
			$(".dp:not([data-disabled])").show();
		else
			$(".dp:not([data-disabled])").hide();
			
		
		if((atbat.bases[0].player!=null || atbat.bases[1].player!=null || atbat.bases[2].player!=null) && halfinning.currentouts<2)
			$(".sac:not([data-disabled])").show();
		else
			$(".sac:not([data-disabled])").hide();
		
		if((currentGame.season && currentGame.season.length>0) || !window.navigator.onLine || !CONFIG.connectToServer)
			$("#server").hide();	
		else
			$("#server").show();
		
		if($("#other").nextAll("li:visible").length===0)
			$("#other").hide();
		else
			$("#other").show();
		/*
		if(currentGame.halfinnings.length%2 === 0  && currentgame.halfinnings.length/2 >= currentGame.innings
			&& getTeamScore(currentGame,currentGame.team1) !== getTeamScore(currentGame,currentGame.team2) )
		{ // game over!
			$("li:visible:not(#other,#undoli,#redoli,#gameover)").hide();
			$("#gameover").show();
		}
		else
		{
			$("li:visible:not(#other,#undoli,#redoli,#gameover)").show();
			$("#gameover").hide();
		}
		*/
		setTimeout(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}
	
	var draw_current_bases=null;
	function drawBases($canvas, bases)
	{
		"use strict";
		if(bases==null)
			bases = draw_current_bases;
		else
			draw_current_bases = bases;
		
		if(bases==null)
			return;
			
		$canvas.attr("width",1)
			.attr("height",1);
			
		var basePathCw = $canvas.parent().width();
		var basePathCh  = $canvas.parent().parent().height()-4;
		var minSide = Math.min(basePathCw, basePathCh);
		if(minSide>0)
		{
			var diamondsize = minSide*(.7);
			var basesize = diamondsize/4.0;
			
			$canvas.attr("width",basePathCw)
				.attr("height",basePathCh);
			var basePathC = $canvas[0].getContext('2d');
			
			basePathC.strokeStyle = "#947333";
			basePathC.fillStyle = "#D6522C";//"#5E87B0";
			var translateX = (basePathCw-diamondsize)/2.0;
			var translateY = (basePathCh-diamondsize)/2.0;
			
			var tranCenterX = basePathCw/2.0;
			var tranCenterY = basePathCh/2.0;
			
			// draw a set of rotated squares, shifted to center of canvas
			
			// need to do rotation  with upperleft at center of canvas and then go back
			// http://stackoverflow.com/questions/9402631/opengl-translate-down-on-y-and-rotate-on-z-around-element-center-on-android
			basePathC.translate(tranCenterX ,tranCenterY);
			basePathC.rotate(45.0*Math.PI/180.0);
			basePathC.translate(-tranCenterX ,-tranCenterY);
			
			// move it to to center point
			basePathC.translate(translateX,translateY);
			
			//diamond
			basePathC.strokeRect(0,0,diamondsize,diamondsize);
			
			//first base	
			basePathC.strokeRect(diamondsize-basesize,0,basesize,basesize);
			if(bases[0].player!=null)
				basePathC.fillRect(diamondsize-basesize,0,basesize,basesize);
				
			//second base
			basePathC.strokeRect(0,0,basesize,basesize);
			if(bases[1].player!=null)
				basePathC.fillRect(0,0,basesize,basesize);
			
			// third base	
			basePathC.strokeRect(0,diamondsize-basesize,basesize,basesize);
			if(bases[2].player!=null)
				basePathC.fillRect(0,diamondsize-basesize,basesize,basesize);
				
			//home
			basePathC.strokeRect(diamondsize-basesize,diamondsize-basesize,basesize,basesize);
		}
	}
	
	
	function setupRules()
	{
		"use strict";
		if(!CONFIG.doublePlayOnFly)
		{
			$(".fly .dp").hide().attr("data-disabled","");
		}
		else
		{
			$(".fly .dp").show().removeAttr("data-disabled");
		}
		if(!CONFIG.doublePlayOnLine)
		{
			$(".linedrive .dp").hide().attr("data-disabled","");
		}
		else
		{
			$(".linedrive .dp").show().removeAttr("data-disabled");
		}
		if(!CONFIG.ceilingOuts)
		{
			$(".ceiling").hide().attr("data-disabled","");
		}
		else
		{
			$(".ceiling").show().removeAttr("data-disabled");
		}
		if(!CONFIG.flySingles)
		{
			$(".fly .single").hide().attr("data-disabled","");
		}
		else
		{
			$(".fly .single").show().removeAttr("data-disabled","");
		}
		if(!CONFIG.lineSingles)
		{
			$(".linedrive .single").hide().attr("data-disabled","");
		}
		else
		{
			$(".linedrive .single").show().removeAttr("data-disabled");
		}
		if(CONFIG.doublePlayAdvanceOnFailed<=0)
		{
			$(".faileddp").hide().attr("data-disabled","");
		}
		else
		{
			$(".faileddp").show().removeAttr("data-disabled");
		}
		if(!CONFIG.overSpeedWalk)
		{
			$(".overspeed").hide().attr("data-disabled","");
		}
		else
		{
			$(".overspeed").show().removeAttr("data-disabled");
		}
		if(!CONFIG.halfInningSkip)
		{
			$(".halfInningSkip").hide().attr("data-disabled","");
		}
		else
		{
			$(".halfInningSkip").show().removeAttr("data-disabled");
		}
		if(!CONFIG.sacFlys)
		{
			$(".sac").hide().attr("data-disabled","");
		}
		else
		{
			$(".sac").show().removeAttr("data-disabled");
		}
		
		try
		{ // might not be previously init'd
			$("#game ul").listview("refresh");
		}
		catch(exc){
		}
	}
	var setupFieldersRunning=false;
	function setupFielders()
	{
		"use strict";
		
		if($("#game ul.inplay").is(":visible")) //just clicked, hide to prevent extra click
		{
			$("#game ul.inplay").hide();
		}
		try // updating fielders before init screws stuff up.  test for it.
		{ // might not be previously init'd
			$("#game ul.inplay").listview("refresh");
		}
		catch(exc){
			setTimeout(setupFielders,100);
			return;
		}
		if(!setupFieldersRunning)
		{
			setupFieldersRunning=true;
			var fielded = $("li:has(a[data-fielded-by-template])");
			fielded.show();
			//fielded.find("a[data-fielded-by]").attr("data-fielded-by","");
			//fielded.find("span.fieldedby").remove();
			/*
			for(var i=fielded.length; i>=0; i--) // clear previous fielders
			{
				var pitch = fielded.eq(i).find("a[data-fielded-by]").attr("data-pitch");
				
				if(pitch)
				{
					var els = fielded.filter(":has([data-pitch="+pitch+"])").slice(1);
					i-=els.length;
					els.remove();
					fielded = $("li:has(a[data-fielded-by])");
				}
			}
			*/
			//return;
			var changemade=false;
			var teamfielding = getCurrentTeamFielding();
			for(var i=0; i<fielded.length; i++) // dupe fielding items for each fielder
			{
				var item = fielded.eq(i);
				for(var j=0; j<teamfielding.players.length; j++)
				{
					if(item.parent().find("[data-fielded-id='"+item.find("a[data-pitch]").attr("data-pitch")+"-"+teamfielding.players[j].name+"-"+teamfielding.name+"']").size()==0)
					{
						var newi = item.clone();
						newi.find("a[data-fielded-by-template]").attr("data-fielded-by",teamfielding.players[j].name)
							.attr("data-fielded-by-team",teamfielding.name)
							.attr("data-fielded-id",item.find("a[data-pitch]").attr("data-pitch")+"-"+teamfielding.players[j].name+"-"+teamfielding.name)
							.append("<span class='fieldedby'> By "+teamfielding.players[j].name+"</span>").removeAttr("data-fielded-by-template");
						
						item.after(newi);
						changemade=true;
					}
				}
			}
			
			$("li:has(a[data-fielded-by-team='"+teamfielding.name+"'])").show();
			$("li:has(a[data-fielded-by-team='"+getCurrentTeamBatting().name+"'])").hide();
			fielded.hide();
			if(changemade)
				$("#game ul.inplay").listview("refresh");
			setupFieldersRunning=false;
		}
	}
	
	
	function post()
	{
		"use strict";
		if(CONFIG.connectToServer && window.navigator.onLine)
		{
			if(currentGame && currentGame.season && currentGame.season.length>0)
			{
				var gamename = currentGame.team2.name + " at " + currentGame.team1.name;
				$.post(POST_URL, 
					{
						json: JSON.stringify(currentGame), 
						name: gamename, 
						id: currentGame.id,
						season: currentGame.season
					},
					function(data){
						
						if(data.id)
						{
							currentGame.id=data.id;
						}
					});
			}
		}
	}
	function output()
	{
		"use strict";
		console.log(currentGame);
		console.log(JSON.stringify(currentGame));
	}
	