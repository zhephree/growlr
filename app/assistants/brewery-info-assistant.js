function BreweryInfoAssistant(p) {
	this.params=p;
	this.brewery=this.params.brewery;
}

BreweryInfoAssistant.prototype.setup = function() {
	this.resultsModel = {items: [], listTitle: $L('Results')};

	this.controller.setupWidget('beer-list', 
					      this.resultsAttributes={itemTemplate:'templates/beerItemsTop',dividerFunction: this.groupBeers,dividerTemplate: 'templates/dividerTemplate'},
					      this.resultsModel);

	this.beerList=[];

	this.listTappedBound=this.listTapped.bind(this);
	Mojo.Event.listen(this.controller.get("beer-list"), Mojo.Event.listTap, this.listTappedBound);


	untappdGet(this,{
		endpoint: 'brewery_info',
		parameters: {brewery_id: this.brewery},
		requiresAuth: true,
		onSuccess: this.infoSuccess.bind(this),
		onFailure: this.infoFailed.bind(this),
		ignoreErrors: false,
		debug: true
	});
};

BreweryInfoAssistant.prototype.listTapped = function(event){
	this.controller.stageController.pushScene({name:"beer-info", transition: Mojo.Transition.zoomFade},{beer:event.item});
};


BreweryInfoAssistant.prototype.infoSuccess = function(r) {
	var j=r.responseJSON.results;


	this.controller.get("beer-name").innerHTML=j.name;
	this.controller.get("beer-image").src=j.img;

	
	this.controller.get("beer-style").innerHTML=j.country;
	logthis(j.twitter_handle);
	if(j.twitter_handle!=""){
		this.controller.get("brewery-twitter").innerHTML='<a href="http://m.twitter.com/'+j.twitter_handle+'">@'+j.twitter_handle+'</a>';
	}
	this.controller.get("beer-stat-total").innerHTML=j.total_count;
	this.controller.get("beer-stat-unique").innerHTML=j.unique_count;
	this.controller.get("beer-stat-monthly").innerHTML=j.monthly_count;
	this.controller.get("beer-stat-you").innerHTML=j.weekly_count;
	
	logthis("topbeers count="+j.top_beers.length);
	
	for(var b=0;b<j.top_beers.length;b++){
		var beer={
			beer_stamp: '',
			beer_name: j.top_beers[b].beer_name,
			beer_type: j.top_beers[b].beer_type,
			brewery_name: '',
			beer_id: j.top_beers[b].beer_id,
			grouping: 'Top Brews'
		};
		
		this.beerList.push(beer);
	}
	logthis("beerlist count="+this.beerList.length);

	this.resultsModel.items=this.beerList;
	this.controller.modelChanged(this.resultsModel);
	

};

BreweryInfoAssistant.prototype.groupBeers = function(data) {
	if(data.grouping){
		return data.grouping;
	}else{
		return 'Search Results';
	}
};

BreweryInfoAssistant.prototype.infoFailed = function(event) {

};


BreweryInfoAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

BreweryInfoAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

BreweryInfoAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
