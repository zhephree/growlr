var GROWLR={};

GROWLR.apiKey="76c41bb2dcd6d2fa0b291ab58632f4bf";
GROWLR.foursquareKey="XYHCFEY53U0BFHNKEMPBY4HYLVOR1XQAQUSCF1GXW5T3GN24";
GROWLR.foursquareSecret="KMWFRYHPNTJWADMSI24PFEXY1U34FARG44GGA4U3QBGXWFJI";
GROWLR.Metrix=new Metrix();
GROWLR.relativeTime = function(offset){
	// got this from: http://github.com/trek/thoughtbox/blob/master/js_relative_dates/src/relative_date.js
    var distanceInMinutes = (offset.abs() / 60000).round();
    if (distanceInMinutes == 0) { return 'less than a minute ago'; }
    else if ($R(0,1).include(distanceInMinutes)) { return 'about a minute ago'; }
    else if ($R(2,44).include(distanceInMinutes)) { return Math.round(distanceInMinutes) + ' minutes ago';}
    else if ($R(45,89).include(distanceInMinutes)) { return 'about 1 hour ago';}
    else if ($R(90,1439).include(distanceInMinutes)) { return 'about ' + Math.round((distanceInMinutes / 60)) + ' hours ago'; }
    else if ($R(1440,2879).include(distanceInMinutes)) {return '1 day ago'; }
    else if ($R(2880,43199).include(distanceInMinutes)) {return 'about ' + Math.round((distanceInMinutes / 1440)) + ' days ago'; }
    else if ($R( 43200,86399).include(distanceInMinutes)) {return 'about a month ago' }
    else if ($R(86400,525599).include(distanceInMinutes)) {return 'about ' + Math.round((distanceInMinutes / 43200)) + ' months ago'; }
    else if ($R(525600,1051199).include(distanceInMinutes)) {return 'about a year ago';}
    else return 'over ' + Math.round((distanceInMinutes / 525600)) + ' years ago';
};

GROWLR.isTouchPad=function(){
  Mojo.Log.error(Object.toJSON(Mojo.Environment.DeviceInfo));
	if(Mojo.Environment.DeviceInfo.modelNameAscii.indexOf("ouch")>-1){
		return true;
	}
	if(Mojo.Environment.DeviceInfo.screenWidth==1024){
		 return true;
	}
	if(Mojo.Environment.DeviceInfo.screenHeight==1024){
		 return true;
	}
	
	return false;
};



function make_base_auth(user, pass) {
  var tok = user + ':' + hex_md5(pass);
  var hash = Base64.encode(tok);
  //_globals.auth="Basic " + hash;
  return "Basic " + hash;
}

function logthis(s){
	Mojo.Log.error(s);
}

function untappdGet(that,opts){
	logthis("getting endpoint data...");
	var headers={};
	if(opts!=undefined){
		if(opts.endpoint==undefined){
			logthis("Untappd API Fail: Missing endpoint");
			return false;
		}else{
			if(opts.requiresAuth){
				headers={Authorization: GROWLR.auth};
			}
			if(opts.parameters==undefined){
				opts.parameters={};
			}

			var url = "http://api.untappd.com/v3/"+opts.endpoint+"?key="+GROWLR.apiKey;
			logthis(url);
			var request = new Ajax.Request(url, {
			   method: 'get',
			   evalJSON: 'true',
			   parameters: opts.parameters,
			   requestHeaders: headers,
			   onSuccess: function(r){
			   		if(opts.debug){logthis(r.responseText);}
			   		if(r.status!=0){
			   			if(r.responseJSON.http_code==200){
			   				opts.onSuccess(r);
			   			}else if(r.responseJSON.error!=undefined){
							if(opts.ignoreErrors!=false){
								that.controller.showAlertDialog({
									onChoose: function(value) {opts.onFailure(r);},
									title: $L("Error"),
									message: $L(r.responseJSON.error+"<br/>Endpoint: "+opts.endpoint),
									allowHTMLMessage: true,
									choices:[
										{label:$L('D\'oh!'), value:"OK", type:'primary'}
									]
								});
							}else{
								opts.onFailure(r);
							}
			   			}else if(r.responseJSON.ratelimited!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.ratelimited+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}else if(r.responseJSON.unauthorized!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.unauthorized+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}
			   		}else{
			   			opts.onFailure(r);		   							   		
			   		}
			   },
			   onFailure:  function(r){
			   		if(opts.debug){logthis(r.responseText);}
			   		if(r.status!=0){
			   			logthis("failed");
			   			logthis(r.responseJSON.error);
			   			if(r.responseJSON.error!=undefined){
			   				logthis("error's there");
							if(opts.ignoreErrors!=true){
								logthis("show error");
								logthis("error: "+r.responseJSON.error);
								that.controller.showAlertDialog({
									onChoose: function(value) {opts.onFailure(r);},
									title: $L("Error"),
									message: $L(r.responseJSON.error+"<br/>Endpoint: "+opts.endpoint),
									allowHTMLMessage: true,
									choices:[
										{label:$L('D\'oh!'), value:"OK", type:'primary'}
									]
								});
							}else{
								opts.onFailure(r);
							}
			   			}
			   		}else{
			   			opts.onFailure(r);		   							   		
			   		}
			   }
			 });


		}
	}
};

function untappdPost(that,opts){
	logthis("getting endpoint data...");
	var headers={};
	if(opts!=undefined){
		if(opts.endpoint==undefined){
			logthis("Untappd API Fail: Missing endpoint");
			return false;
		}else{
			if(opts.requiresAuth){
				headers={Authorization: GROWLR.auth};
			}
			if(opts.parameters==undefined){
				opts.parameters={};
			}

			var url = "http://api.untappd.com/v3/"+opts.endpoint+"?key="+GROWLR.apiKey;
			logthis(url);
			var request = new Ajax.Request(url, {
			   method: 'post',
			   evalJSON: 'true',
			   parameters: opts.parameters,
			   requestHeaders: headers,
			   onSuccess: function(r){
			   		if(opts.debug){logthis(r.responseText);}
			   		if(r.status!=0){
			   			if(r.responseJSON.http_code==200){
			   				opts.onSuccess(r);
			   			}else if(r.responseJSON.error!=undefined){
							if(opts.ignoreErrors!=false){
								that.controller.showAlertDialog({
									onChoose: function(value) {opts.onFailure(r);},
									title: $L("Error"),
									message: $L(r.responseJSON.error+"<br/>Endpoint: "+opts.endpoint),
									allowHTMLMessage: true,
									choices:[
										{label:$L('D\'oh!'), value:"OK", type:'primary'}
									]
								});
							}else{
								opts.onFailure(r);
							}
			   			}else if(r.responseJSON.ratelimited!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.ratelimited+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}else if(r.responseJSON.unauthorized!=undefined){
							that.controller.showAlertDialog({
								onChoose: function(value) {opts.onFailure(r);},
								title: $L("Error"),
								message: $L(r.responseJSON.unauthorized+"<br/>Endpoint: "+opts.endpoint),
								allowHTMLMessage: true,
								choices:[
									{label:$L('D\'oh!'), value:"OK", type:'primary'}
								]
							});
			   			}
			   		}else{
			   			opts.onFailure(r);		   							   		
			   		}
			   },
			   onFailure:  function(r){
			   		if(opts.debug){logthis(r.responseText);}
			   		if(r.status!=0){
			   			logthis("failed");
			   			logthis(r.responseJSON.error);
			   			if(r.responseJSON.error!=undefined){
			   				logthis("error's there");
							if(opts.ignoreErrors!=true){
								logthis("show error");
								logthis("error: "+r.responseJSON.error);
								that.controller.showAlertDialog({
									onChoose: function(value) {opts.onFailure(r);},
									title: $L("Error"),
									message: $L(r.responseJSON.error+"<br/>Endpoint: "+opts.endpoint),
									allowHTMLMessage: true,
									choices:[
										{label:$L('D\'oh!'), value:"OK", type:'primary'}
									]
								});
							}else{
								opts.onFailure(r);
							}
			   			}
			   		}else{
			   			opts.onFailure(r);		   							   		
			   		}
			   }
			 });


		}
	}
};





	/* Define the number of snowflakes to be used in the animation */
	const SNOWFLAKES = 10;
 
	function bubble_init(doc) {
		
		/* Fill the empty container with freshly driven snow */
		var first = true;
		for (var i = 0; i < SNOWFLAKES; i++) {
			doc.body.appendChild(createASnowflake(first,doc));
			first = false;
		}
	}
 
	/*
		Receives the lowest and highest values of a range and
		returns a random integer that falls within that range.
	*/
	function randomInteger(low, high) {
		return low + Math.floor(Math.random() * (high - low));
	}
 
	/*
	   Receives the lowest and highest values of a range and
	   returns a random float that falls within that range.
	*/
	function randomFloat(low, high) {
		return low + Math.random() * (high - low);
	}
 
	function randomItem(items) {
		return items[randomInteger(0, items.length - 1)]
	}
 
	/* Returns a duration value for the falling animation.*/
	function durationValue(value) {
		return value + 's';
	}
 
	function createASnowflake(is_first,doc) {
		var flakes = ['274D'];/*['2746', '2745', '2744', '2733'];*/
		var superFlakes = ['274D'];//['2746', '2745', '2744', 'fc7', '274b', '2749', '2747', '2746', '273c', '273b', '2734', '2733', '2732', '2731', '2725'];
		var sizes = ['tiny', 'tiny', 'tiny', 'small', 'small', 'small', 'small', 'medium', 'medium', 'medium', 'medium', 'medium', 'medium', 'large', 'massive'];
 
		/* Start by creating a wrapper div, and an empty span  */
		var snowflakeElement = doc.createElement('div');
		snowflakeElement.className = 'snowflake ' + randomItem(sizes);
 
		var snowflake = doc.createElement('span');
		snowflake.innerHTML = '<img src="images/bubble.png">';//'&#x' + randomItem(flakes) + ';';
 
		snowflakeElement.appendChild(snowflake);
 
		/* Randomly choose a spin animation */
		var spinAnimationName = (Math.random() < 0.5) ? 'clockwiseSpin' : 'counterclockwiseSpin';
 
		 /* Randomly choose a side to anchor to, keeps the middle more dense and fits liquid layout */
		 var anchorSide = (Math.random() < 0.5) ? 'left' : 'right';
 
		/* Figure out a random duration for the fade and drop animations */
		var fadeAndDropDuration = durationValue(randomFloat(1, 5));
 
		/* Figure out another random duration for the spin animation */
		var spinDuration = durationValue(randomFloat(4, 8));
 
		// how long to wait before the flakes arrive
		var flakeDelay = is_first ? 0 : durationValue(randomFloat(0, 10));
 
		snowflakeElement.style.webkitAnimationName = 'fade, drop';
		snowflakeElement.style.webkitAnimationDuration = fadeAndDropDuration + ', ' + fadeAndDropDuration;
		snowflakeElement.style.webkitAnimationDelay = flakeDelay;
 
		/* Position the snowflake at a random location along the screen, anchored to either the left or the right*/
		snowflakeElement.style[anchorSide] = randomInteger(0, 60) + '%';
 
		snowflake.style.webkitAnimationName = spinAnimationName;
		snowflake.style.webkitAnimationDuration = spinDuration;
 
 
		/* Return this snowflake element so it can be added to the document */
		return snowflakeElement;
	}
	
function removeElement(parentDiv, childDiv,doc){
     if (childDiv == parentDiv) {
          alert("The parent div cannot be removed.");
     }
     else if (doc.getElementById(childDiv)) {     
          var child = doc.getElementById(childDiv);
          var parent = doc.getElementById(parentDiv);
          parent.removeChild(child);
     }
     else {
          alert("Child div has already been removed or does not exist.");
          return false;
     }
}


GROWLR.setupMenu=function(currentScene,backOnly){
  if(backOnly==true){
  	    var menuModel = {
  	        visible: true,
  	        items: [ 
 		            { icon: "back", command: "goBack"}
  	        ]
  	    } ;   
  }else{
  	    var menuModel = {
  	        visible: true,
  	        items: [ 
  	        	{items: [
  	        		{},
  		            { iconPath: "images/menu/beer.png", command: "goBeer"},
  		            { iconPath: 'images/menu/friends.png', command: 'goFeed'},
  		            { iconPath: 'images/menu/profile.png', command: 'goProfile'},
  		            {}
  		         ],
  		         toggleCmd: currentScene
  		       }
  	        ]
  	    };
  	
  
  }

  if(currentScene!='' || backOnly==true){
  	this.controller.setupWidget(Mojo.Menu.commandMenu,
  	    this.attributes = {
  	        spacerHeight: 0,
  	        menuClass: 'no-fade'
  	    },
  		menuModel
  	);
  	
  	GROWLR.currentScene=currentScene;
  }
  	
	this.handleCommand = GROWLR.handleCommand.bind(this);
};

GROWLR.handleCommand = function(event){
	if (event.type === Mojo.Event.command) {
    	switch (event.command) {
    		case 'goBeer':
    			if(GROWLR.currentScene!='goBeer'){
    				this.controller.stageController.swapScene({name: 'beer-search', transition: Mojo.Transition.crossFade});
    			}
    			break;
    		case 'goProfile':
    			if(GROWLR.currentScene!='goProfile'){
    				this.controller.stageController.swapScene({name: 'user-info', transition: Mojo.Transition.crossFade});
    			}
    			break;
    		case 'goFeed':
    			if(GROWLR.currentScene!='goFeed'){
    				this.controller.stageController.swapScene({name: 'feed', transition: Mojo.Transition.crossFade});
    			}
    			break;
    		case 'goBack':
    		  this.controller.stageController.popScene();
    		  break;
    	}
    }
};

GROWLR.addScrollbar = function(){
	return false;
	this.scrollbar=this.controller.document.createElement("div");
	this.scrollbar.style.position="fixed";
	this.scrollbar.style.width="12px";
	this.scrollbar.style.borderRadius="6px";
	this.scrollbar.style.backgroundColor="rgba(0,0,0,0.6)";
	this.scrollbar.style.right="0px";
	this.scrollbar.style.top="0px";
	this.scrollbar.id="scrollbar";
	
	var scene=this.controller.sceneName;
	var scroller=this.controller.get("mojo-scene-"+scene+"-scene-scroller");
	this.viewableHeight=scroller.getHeight();
	var innerDiv=this.controller.get("mojo-scene-"+scene);
	var sdim=innerDiv.getDimensions();
	this.scrollableHeight=sdim.height;
	
	//determine percent of height
	if(this.scrollableHeight>this.viewableHeight){
		var pct=this.viewableHeight/this.scrollableHeight;
		
		this.scrollbar.style.height=Math.round(pct*this.viewableHeight)-45+"px";
		this.scrollbarHeight=Math.round(pct*this.viewableHeight)-45;
	}
	
	var currentScene=this.controller.stageController.activeScene();
	var construct=currentScene.constructor;
	
	this.moved= (function(stopped,position) {
		logthis("stopped="+Object.toJSON(stopped));
		logthis("position="+Object.toJSON(position));
		
		var y=position.y*-1;
		
		if(y>this.viewableHeight-this.scrollbarHeight){
			y=this.viewableHeight-this.scrollbarHeight;
		}
		if(y<0){
			y=0;
		}

		
		this.controller.get("scrollbar").style.top=y+'px';

	}).bind(this);

	
	this._scrollStart = (function(event) {
		logthis("scroll start");
		event.addListener(this);
	}).bind(this);
	

	Mojo.Event.listen(this.controller.getSceneScroller(),Mojo.Event.scrollStarting, this._scrollStart);

	
	
	this.controller.document.body.appendChild(this.scrollbar);
};
