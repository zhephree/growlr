function VenueSearchAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

VenueSearchAssistant.prototype.setup = function() {
	this.controller.setupWidget('q', this.attributes = {hintText:'Search Locations...',textCase: Mojo.Widget.steModeLowerCase}, this.qModel = {value:'', disabled:false});

	this.controller.setupWidget('goSearch', this.attributes = {type:Mojo.Widget.activityButton}, this.loginBtnModel = {label:'Search', disabled:false});

	this.resultsModel = {items: [], listTitle: $L('Results')};

	this.controller.setupWidget('venue-list', 
					      this.resultsAttributes={itemTemplate:'templates/venueItems',dividerFunction: this.groupVenues,dividerTemplate: 'templates/dividerTemplate'},
					      this.resultsModel);


	this.onSearchTappedBound=this.onSearchTapped.bind(this);
	Mojo.Event.listen(this.controller.get("goSearch"), Mojo.Event.tap, this.onSearchTappedBound);

	this.listTappedBound=this.listTapped.bind(this);
	Mojo.Event.listen(this.controller.get("venue-list"), Mojo.Event.listTap, this.listTappedBound);

	this.gpsSuccessBound=this.gpsSuccess.bind(this);
	this.gpsFailedBound=this.gpsFailed.bind(this);

	this.gotGPS=false;
};

VenueSearchAssistant.prototype.groupVenues = function(data) {
	return data.grouping;
};

VenueSearchAssistant.prototype.onSearchTapped = function(event) {	
	this.searchFoursquare();
};

VenueSearchAssistant.prototype.listTapped = function(event) {
	this.controller.stageController.popScene(event.item);
};


VenueSearchAssistant.prototype.gpsSuccess = function(event) {
	this.gotGPS=true;
	logthis("got gps");
	GROWLR.lat=event.latitude;
	GROWLR.lng=event.longitude;
	
	GROWLR.Metrix.ServiceRequest.request('palm://com.palm.location', {
		method: "getReverseLocation",
		parameters: {latitude: GROWLR.lat, longitude:GROWLR.lng},
		onSuccess: function(address){
			//logthis("reversing loc");
			var nearness="Near "+address.substreet+" "+address.street+" "+address.city+", "+address.state;
			this.controller.get("accuracy").innerHTML=nearness;
		}.bind(this),
		onFailure: function(){		logthis("reverse loc failed");}.bind(this)
	});
	
	this.searchFoursquare();

};


VenueSearchAssistant.prototype.searchFoursquare = function(event) {
 	var request = new Ajax.Request("https://api.foursquare.com/v2/venues/search?client_id="+GROWLR.foursquareKey+"&client_secret="+GROWLR.foursquareSecret, {
	   method: 'get',
	   evalJSON: 'true',
	   parameters: {
	   		ll: GROWLR.lat+","+GROWLR.lng,
	   		intent: 'checkin',
	   		query: this.qModel.value
	   },
	   onSuccess: this.venueSuccess.bind(this)
	 });

};

VenueSearchAssistant.prototype.venueSuccess = function(event) {
	logthis("got venues");
//	logthis(event.responseText);
	
	
	var j=event.responseJSON.response;
	var venues=[];
	
	for(var g=0;g<j.groups.length;g++){
		var groupName=j.groups[g].name;
		var itm={};
		
		for(var v=0;v<j.groups[g].items.length;v++){
			itm=j.groups[g].items[v];
			itm.grouping=groupName;
			
			if(itm.categories){
				if(itm.categories.length>0){
					var c=itm.categories[0].icon;
				}else{
					var c='images/no-cat.png';
				}
			}else{
				var c='images/no-cat.png';
			}
			itm.category=c;
			
			venues.push(itm);
		}
	}
	venues.sort(function(a, b){return (a.location.distance - b.location.distance);});
	
	var len=this.controller.get("venue-list").mojo.getLength();
	if(len>0){
		this.controller.get("venue-list").mojo.noticeUpdatedItems(0,venues);
		this.controller.get("goSearch").mojo.deactivate();
	}else{
		this.resultsModel.items=venues;
		this.controller.modelChanged(this.resultsModel);
	}
	var bubbles=this.controller.document.querySelectorAll(".snowflake");
	for(var s=0;s<bubbles.length;s++){
		this.controller.document.body.removeChild(bubbles[s]);
	}
	
	this.controller.get("venueScrim").hide();

};


VenueSearchAssistant.prototype.gpsFailed = function(event) {
	logthis("gps failed");
};

VenueSearchAssistant.prototype.getLocation = function(event){
	this.trackGPSObjA = new Mojo.Service.Request('palm://com.palm.location', {
		method: 'startTracking',
		parameters: {
			subscribe: true
		},
		onSuccess: function(event){
			if (event.errorCode==undefined){
				//--> This is simply our 'returnValue: true' call. No data here.
			}else{
				if (event.errorCode != 0){
					this.gpsFailedBound(event);
					if (event.errorCode == 5){
						//--> Alert user that location services are off	
					}else if (event.errorCode == 4){
						//--> Alert user that GPS Permanent Failure (reboot device is the advice).
					}
				}else{
					//--> Got a GPS Response, cache it for later!
					GROWLR.gps = event;
					
					//--> Do your other stuff here
					/*		... code		*/
					this.gpsSuccessBound(event);
					
					//--> Stop tracking
					this.trackGPSObjA.cancel();
				}
			}
		}.bind(this),
		onFailure: function(event){
			Mojo.Log.error("*** trackGPSObj FAILURE: " + event.errorCode + " [" + gps.errorCodeDescription(event.errorCode) + "]");
		}.bind(this)
	});

	//--> Launch a second tracking to 'unstick' GPS
	this.trackGPSObjB = new Mojo.Service.Request('palm://com.palm.location', {
		method: 'startTracking',
		parameters: {
			subscribe: true
		},
		onSuccess: function(event){
			if (event.errorCode){
				this.trackGPSObjB.cancel();		//--> Stop tracking
			}
		}.bind(this),
		onFailure: function(event){
			//Mojo.Log.error("*** trackGPSObjB FAILURE: " + event.errorCode + " [" + gps.errorCodeDescription(event.errorCode) + "]");
		}.bind(this)
	});
	
	//--> Launch a third tracking to 'unstick' GPS
	this.trackGPSObjC = new Mojo.Service.Request('palm://com.palm.location', {
		method: 'startTracking',
		parameters: {
			subscribe: true
		},
		onSuccess: function(event){
			if (event.errorCode){
				this.trackGPSObjC.cancel();		//--> Stop tracking
			}
		}.bind(this),
		onFailure: function(event){
			//Mojo.Log.error("*** trackGPSObjC FAILURE: " + event.errorCode + " [" + gps.errorCodeDescription(event.errorCode) + "]");
		}.bind(this)
	});
};

VenueSearchAssistant.prototype.getLocationClearAll = function(event){
	try{
		this.trackGPSObj.cancel();
	}catch(e){}
	try{
		this.trackGPSObjA.cancel();
	}catch(e){}
	try{
		this.trackGPSObjB.cancel();
	}catch(e){}
};

VenueSearchAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	if(this.gotGPS==false){
		logthis("getting gps...");
		/*GROWLR.Metrix.ServiceRequest.request('palm://com.palm.location', {
		    method:"getCurrentPosition",
		    parameters:{accuracy:1, maximumAge: 0, responseTime: 1},
		    onSuccess: this.gpsSuccessBound,
		    onFailure: this.gpsFailedBound
		    }
		);*/
		
		this.getLocation(); 
	  //window.setTimeout(function(){bubble_init(this.controller.document);}.bind(this),20);
	}	   
};

VenueSearchAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

VenueSearchAssistant.prototype.cleanup = function(event) {
	var bubbles=this.controller.document.querySelectorAll(".snowflake");
	for(var s=0;s<bubbles.length;s++){
		this.controller.document.body.removeChild(bubbles[s]);
	}
};
