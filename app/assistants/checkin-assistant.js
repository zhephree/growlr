function CheckinAssistant(p) {
	this.params=p;
	
	this.beer=this.params.beer;
	
	this.gmt_offset=checkTimeZone();
	this.twitter='off';
	this.facebook='off';
	this.foursquare='off';
	this.gowalla='off';
	this.rating=0;
}

CheckinAssistant.prototype.setup = function() {
	this.controller.setupWidget('goConfirm', this.attributes = {type:Mojo.Widget.activityButton}, this.loginBtnModel = {label:'Confirm Your Brew', disabled:false});
	this.onCheckinTappedBound=this.onCheckinTapped.bind(this);
	Mojo.Event.listen(this.controller.get("goConfirm"), Mojo.Event.tap, this.onCheckinTappedBound);

	this.controller.setupWidget('addLocation', this.attributes = {}, this.locationBtnModel = {label:'Add Your Location?', disabled:false});
	this.onLocationTappedBound=this.onLocationTapped.bind(this);
	Mojo.Event.listen(this.controller.get("addLocation"), Mojo.Event.tap, this.onLocationTappedBound);


	this.controller.setupWidget('shout', this.attributes = {hintText:'Add a comment... (Optional)',textCase: Mojo.Widget.steModeLowerCase}, this.shoutModel = {value:'', disabled:false});

	this.onFacebookTappedBound=this.onFacebookTapped.bind(this);
	this.onTwitterTappedBound=this.onTwitterTapped.bind(this);
	this.onFoursquareTappedBound=this.onFoursquareTapped.bind(this);
	this.onGowallaTappedBound=this.onGowallaTapped.bind(this);
	Mojo.Event.listen(this.controller.get("share-facebook"), Mojo.Event.tap, this.onFacebookTappedBound);
	Mojo.Event.listen(this.controller.get("share-twitter"), Mojo.Event.tap, this.onTwitterTappedBound);
	Mojo.Event.listen(this.controller.get("share-foursquare"), Mojo.Event.tap, this.onFoursquareTappedBound);
	Mojo.Event.listen(this.controller.get("share-gowalla"), Mojo.Event.tap, this.onGowallaTappedBound);

	Mojo.Event.listen(this.controller.get("rating1"), Mojo.Event.tap, function(){this.setRating(1);}.bind(this));
	Mojo.Event.listen(this.controller.get("rating2"), Mojo.Event.tap, function(){this.setRating(2);}.bind(this));
	Mojo.Event.listen(this.controller.get("rating3"), Mojo.Event.tap, function(){this.setRating(3);}.bind(this));
	Mojo.Event.listen(this.controller.get("rating4"), Mojo.Event.tap, function(){this.setRating(4);}.bind(this));
	Mojo.Event.listen(this.controller.get("rating5"), Mojo.Event.tap, function(){this.setRating(5);}.bind(this));



	this.controller.get("beer-name").innerHTML=this.beer.beer_name;
	this.controller.get("beer-brewery").innerHTML=this.beer.brewery_name;
	this.controller.get("beer-image").src=this.beer.beer_stamp;

 if(GROWLR.isTouchPad()){
    this.controller.get("goConfirm").addClassName("touchpad");
    
  }
		var setupMenu=GROWLR.setupMenu.bind(this);
		setupMenu('',GROWLR.isTouchPad());
};

CheckinAssistant.prototype.setRating = function(rating) {
	this.rating=rating;
	
	this.controller.get("rating1").addClassName("faded");
	this.controller.get("rating2").addClassName("faded");
	this.controller.get("rating3").addClassName("faded");
	this.controller.get("rating4").addClassName("faded");
	this.controller.get("rating5").addClassName("faded");
	
	for(var s=1;s<=rating;s++){
		this.controller.get("rating"+s).removeClassName("faded");
	}
};

CheckinAssistant.prototype.onCheckinTapped = function(event) {
	untappdPost(this,{
		endpoint: 'checkin',
		requiresAuth: true,
		parameters: {
			gmt_offset: this.gmt_offset,
			bid: this.beer.beer_id,
			foursquare_id: this.venueId,
			user_lat: GROWLR.lat,
			user_lng: GROWLR.lng,
			shout: this.shoutModel.value,
			facebook: this.facebook,
			twitter: this.twitter,
			foursquare: this.foursquare,
			gowalla: this.gowalla,
			rating_value: this.rating
		},
		onSuccess: this.checkinSuccess.bind(this),
		onFailure: this.checkinFailed.bind(this),
		ignoreErrors: false,
		debug: true
	});
};

CheckinAssistant.prototype.checkinSuccess = function(r) {
	this.controller.stageController.swapScene('checkin-result',{result:r.responseJSON});
};

CheckinAssistant.prototype.checkinFailed = function(event) {
	this.controller.get("goConfirm").mojo.deactivate();
};

CheckinAssistant.prototype.onLocationTapped = function(event) {
	this.controller.stageController.pushScene({name:'venue-search',transition:Mojo.Transition.zoomFade});
};

CheckinAssistant.prototype.onFacebookTapped = function(event) {
	if(this.facebook=='off'){
		this.facebook='on';
		this.controller.get("share-facebook").addClassName("pressed");
	}else{
		this.facebook='off';
		this.controller.get("share-facebook").removeClassName("pressed");	
	}
};

CheckinAssistant.prototype.onTwitterTapped = function(event) {
	if(this.twitter=='off'){
		this.twitter='on';
		this.controller.get("share-twitter").addClassName("pressed");
	}else{
		this.twitter='off';
		this.controller.get("share-twitter").removeClassName("pressed");	
	}
};

CheckinAssistant.prototype.onFoursquareTapped = function(event) {
	if(this.foursquare=='off'){
		this.foursquare='on';
		this.controller.get("share-foursquare").addClassName("pressed");
	}else{
		this.foursquare='off';
		this.controller.get("share-foursquare").removeClassName("pressed");	
	}
};

CheckinAssistant.prototype.onGowallaTapped = function(event) {
	if(this.gowalla=='off'){
		this.gowalla='on';
		this.controller.get("share-gowalla").addClassName("pressed");
	}else{
		this.gowalla='off';
		this.controller.get("share-gowalla").removeClassName("pressed");	
	}
};

CheckinAssistant.prototype.activate = function(param) {
	if(param){
		if(param.id){ //got a venue
			this.controller.get("beer-location").innerHTML='<img src="'+param.category+'" width="16" height="16"> '+param.name;
			this.controller.get("share-foursquare").show();
			this.controller.get("share-gowalla").show();
			this.venueId=param.id;
		}
	}
};

CheckinAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

CheckinAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
