function BeerInfoAssistant(p) {
	this.params=p;
	this.beer=this.params.beer;
}

BeerInfoAssistant.prototype.setup = function() {


	this.controller.setupWidget('goCheckin', this.attributes = {}, this.loginBtnModel = {label:'Check-in to this Brew', disabled:false});
	this.onCheckinTappedBound=this.onCheckinTapped.bind(this);
	Mojo.Event.listen(this.controller.get("goCheckin"), Mojo.Event.tap, this.onCheckinTappedBound);

	this.controller.setupWidget('goWishlist', this.attributes = {}, this.wishBtnModel = {label:'Add to Wishlist', disabled:false});
	this.onWishTappedBound=this.onWishTapped.bind(this);
	Mojo.Event.listen(this.controller.get("goWishlist"), Mojo.Event.tap, this.onWishTappedBound);

	this.onBreweryTappedBound=this.onBreweryTapped.bind(this);
	Mojo.Event.listen(this.controller.get("beer-brewery"), Mojo.Event.tap, this.onBreweryTappedBound);


	this.controller.get("beer-name").innerHTML=this.beer.beer_name;
	this.controller.get("beer-brewery").innerHTML=this.beer.brewery_name+' <img src="images/arrow.png">';
	this.controller.get("beer-image").src=this.beer.beer_stamp || this.beer.img;
	
	untappdGet(this,{
		endpoint: 'beer_info',
		parameters: {bid: this.beer.beer_id},
		requiresAuth: true,
		onSuccess: this.infoSuccess.bind(this),
		onFailure: this.infoFailed.bind(this),
		ignoreErrors: false,
		debug: true
	});
	
 if(GROWLR.isTouchPad()){
    this.controller.get("goCheckin").addClassName("touchpad");
    this.controller.get("goWishlist").addClassName("touchpad");
  }
		var setupMenu=GROWLR.setupMenu.bind(this);
		setupMenu('',GROWLR.isTouchPad());
};

BeerInfoAssistant.prototype.infoSuccess = function(r) {
	var j=r.responseJSON.results;
	
	this.brewery_id=j.brewery_id;
	
	this.controller.get("beer-name").innerHTML=j.name;
	this.controller.get("beer-brewery").innerHTML=j.brewery+' <img src="images/arrow.png">';
	this.controller.get("beer-image").src=j.beer_stamp || j.img;

	if(j.is_had==true){ //not in wish list
		this.wishBtnModel.label='Remove from Wishlist';
		this.controller.modelChanged(this.wishBtnModel);
		this.wishMode='remove';
	}else{
		this.wishMode='add';
	}

	this.controller.get("beer-style").innerHTML=j.type;
	var abv=parseFloat(j.beer_abv)/100;
	this.controller.get("beer-abv").innerHTML=abv.numberFormat("0.0%");
	this.controller.get("beer-stat-total").innerHTML=j.total_count;
	this.controller.get("beer-stat-unique").innerHTML=j.unique_count;
	this.controller.get("beer-stat-monthly").innerHTML=j.monthly_count;
	this.controller.get("beer-stat-you").innerHTML=(this.beer.your_count)? this.beer.your_count: '?';
	
	var avgRating=j.avg_rating;
	var yourRating=j.your_rating;
	var avgStars='';
	var yourStars='';
	
	for(var r=0;r<avgRating;r++){
		avgStars+='<img src="images/star-bright.png">';
	}
	for(var d=0;d<(5-avgRating);d++){
		avgStars+='<img src="images/star-bright.png" class="faded">';
	}
	
	for(var r=0;r<yourRating;r++){
		yourStars+='<img src="images/star-bright.png">';
	}
	for(var d=0;d<(5-yourRating);d++){
		yourStars+='<img src="images/star-bright.png" class="faded">';
	}
	
	this.controller.get("beer-average-rating").innerHTML='Average Rating:<br>'+avgStars;
	this.controller.get("beer-your-rating").innerHTML='Your Rating:<br>'+yourStars;
	
};

BeerInfoAssistant.prototype.infoFailed = function(event) {

};

BeerInfoAssistant.prototype.onCheckinTapped = function(event) {
	this.controller.stageController.pushScene({name: 'checkin',transition: Mojo.Transition.zoomFade},{beer:this.beer});
};


BeerInfoAssistant.prototype.onBreweryTapped = function(event) {
	this.controller.stageController.pushScene({name: 'brewery-info',transition: Mojo.Transition.zoomFade},{brewery:this.brewery_id});
};


BeerInfoAssistant.prototype.onWishTapped = function(event) {
	if(this.wishMode=='add'){
		untappdPost(this,{
			endpoint: 'add_to_wish',
			requiresAuth: true,
			parameters: {
				bid: this.beer.beer_id
			},
			onSuccess: this.wishSuccess.bind(this),
			onFailure: this.wishFailed.bind(this),
			ignoreErrors: false,
			debug: true
		});
		
	}
	if(this.wishMode=='remove'){
		untappdPost(this,{
			endpoint: 'remove_from_wish',
			requiresAuth: true,
			parameters: {
				bid: this.beer.beer_id
			},
			onSuccess: this.wishSuccess.bind(this),
			onFailure: this.wishFailed.bind(this),
			ignoreErrors: false,
			debug: true
		});
		
	}
};

BeerInfoAssistant.prototype.wishSuccess = function(event) {
	if(this.wishMode=='add'){
		this.wishBtnModel.label='Remove from Wishlist';
		this.controller.modelChanged(this.wishBtnModel);
		this.wishMode='remove';	
	}else{
		this.wishBtnModel.label='Add to Wishlist';
		this.controller.modelChanged(this.wishBtnModel);
		this.wishMode='add';	
	}
};

BeerInfoAssistant.prototype.wishFailed = function(event) {
	
};


BeerInfoAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

BeerInfoAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

BeerInfoAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
