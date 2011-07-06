function BeerSearchAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

BeerSearchAssistant.prototype.setup = function() {
	this.controller.setupWidget('q', this.attributes = {hintText:'Beer Name...',textCase: Mojo.Widget.steModeLowerCase}, this.qModel = {value:'', disabled:false});

	this.controller.setupWidget('goSearch', this.attributes = {type:Mojo.Widget.activityButton}, this.loginBtnModel = {label:'Search', disabled:false});

	this.resultsModel = {items: [], listTitle: $L('Results')};

	this.controller.setupWidget('beer-list', 
					      this.resultsAttributes={itemTemplate:'templates/beerItems',dividerFunction: this.groupBeers,dividerTemplate: 'templates/dividerTemplate'},
					      this.resultsModel);


	this.onSearchTappedBound=this.onSearchTapped.bind(this);
	Mojo.Event.listen(this.controller.get("goSearch"), Mojo.Event.tap, this.onSearchTappedBound);

	this.listTappedBound=this.listTapped.bind(this);
	Mojo.Event.listen(this.controller.get("beer-list"), Mojo.Event.listTap, this.listTappedBound);

	var setupMenu=GROWLR.setupMenu.bind(this);
	setupMenu('goBeer');



	this.beerList=[];
	
	untappdGet(this,{
		endpoint: 'user_feed',
		parameters: {},
		requiresAuth: true,
		onSuccess: this.feedSuccess.bind(this),
		onFailure: this.feedFailed.bind(this),
		ignoreErrors: false,
		debug: true
	});

};

BeerSearchAssistant.prototype.feedSuccess = function(r) {
	var j=r.responseJSON;
	var checkins=j.results;
	
	if(j.returned_results>3){
		var max=3;
	}else{
		var max=j.returned_results;
	}
	
	for(var b=0;b<max;b++){
		var beer={
			beer_stamp: checkins[b].beer_stamp,
			beer_name: checkins[b].beer_name,
			brewery_name: checkins[b].brewery_name,
			beer_id: checkins[b].beer_id,
			grouping: 'Recent Brews'
		};
		
		this.beerList.push(beer);
	}
	
	untappdGet(this,{
		endpoint: 'trending',
		parameters: {},
		requiresAuth: true,
		onSuccess: this.trendingSuccess.bind(this),
		onFailure: this.feedFailed.bind(this),
		ignoreErrors: false,
		debug: true
	});

};

BeerSearchAssistant.prototype.trendingSuccess = function(r) {
	var j=r.responseJSON.results;
	
	for(var b=0;b<j.length;b++){
		var beer={
			beer_stamp: j[b].img,
			beer_name: j[b].beer_name,
			brewery_name: j[b].brewery_name,
			beer_id: j[b].beer_id,
			grouping: 'Trending Brews'
		};
		
		this.beerList.push(beer);
	}


	this.resultsModel.items=this.beerList;
	this.controller.modelChanged(this.resultsModel);
	
};

BeerSearchAssistant.prototype.feedFailed = function(event) {

};

BeerSearchAssistant.prototype.onSearchTapped = function(event) {
	untappdGet(this,{
		endpoint: 'beer_search',
		parameters: {q: this.qModel.value},
		requiresAuth: true,
		onSuccess: this.searchSuccess.bind(this),
		onFailure: this.searchFailed.bind(this),
		ignoreErrors: false,
		debug: true
	});
};

BeerSearchAssistant.prototype.searchSuccess = function(r) {
	var beers=r.responseJSON.results;

	this.controller.get("goSearch").mojo.deactivate();
	
	this.resultsModel.items=beers;
	this.controller.modelChanged(this.resultsModel);
	
	if(beers.length==0){
		this.controller.get("no-results").show();
	}else{
		this.controller.get("no-results").hide();
	}
};

BeerSearchAssistant.prototype.groupBeers = function(data) {
	if(data.grouping){
		return data.grouping;
	}else{
		return 'Search Results';
	}
};

BeerSearchAssistant.prototype.searchFailed = function(r) {
	this.controller.get("goSearch").mojo.deactivate();
};

BeerSearchAssistant.prototype.listTapped = function(event){
	this.controller.stageController.pushScene({name:"beer-info", transition: Mojo.Transition.zoomFade},{beer:event.item});
};

BeerSearchAssistant.prototype.activate = function(event) {
	this.controller.window.setTimeout(function(){
		var setupScrollbar=GROWLR.addScrollbar.bind(this);
		setupScrollbar();
	}.bind(this),2000);
};

BeerSearchAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

BeerSearchAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
