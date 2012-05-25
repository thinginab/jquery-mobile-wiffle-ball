/*************** bigleague.home.js ***********/

	function bindHome()
	{
		"use strict";
		if(games.length===0)
			$("a[href='#continue']").hide();
		else
			$("a[href='#continue']").show();
		
		
		if(games.length===0 && !CONFIG.connectToServer)
			$("a[href='#stats']").hide();
		else
			$("a[href='#stats']").show();
			
		setTimeout(function(){	
			hidePageLoadingMsg();
		},CONFIG.clearDelay);
	}
	function setHomeViewMode()
	{
		"use strict";
		var width = $(window).width();
		if(width<480)
		{
			var backsize='auto 50px';
			$("#home").css("-moz-background-size",backsize)
				.css("-webkit-background-size",backsize)
				.css("-o-background-size",backsize)
				.css("background-size",backsize);
			$("#home div.ui-content:first").css("padding-top","50px");
		}
		else
		{
			var backsize='auto 75px';
			$("#home").css("-moz-background-size",backsize)
				.css("-webkit-background-size",backsize)
				.css("-o-background-size",backsize)
				.css("background-size",backsize);
			$("#home div.ui-content:first").css("padding-top","75px");
		}
	}