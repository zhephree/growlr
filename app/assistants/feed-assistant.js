function FeedAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

FeedAssistant.prototype.setup = function() {

	var setupMenu=GROWLR.setupMenu.bind(this);
	setupMenu('goFeed');
	
	this.firstLoadDone=false;

	this.resultsModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('feed-list', 
					      this.resultsAttributes={itemTemplate:'templates/feedItems',formatters:{venue_name:this.fixVenue.bind(this), created_at: this.fixDate.bind(this)}},
					      this.resultsModel);

	this.controller.setupWidget('goLoad', this.attributes = {type:Mojo.Widget.activityButton}, this.loadBtnModel = {label:'Load More', disabled:false});
	this.onLoadTappedBound=this.onLoadTapped.bind(this);
	Mojo.Event.listen(this.controller.get("goLoad"), Mojo.Event.tap, this.onLoadTappedBound);

	this.onListTappedBound=this.onListTapped.bind(this);
	Mojo.Event.listen(this.controller.get("feed-list"), Mojo.Event.listTap, this.onListTappedBound);

	untappdGet(this,{
		endpoint: 'feed',
		parameters: {},
		requiresAuth: true,
		onSuccess: this.feedSuccess.bind(this),
		onFailure: this.feedFailed.bind(this),
		ignoreErrors: false,
		debug: true
	});

	untappdGet(this,{
		endpoint: 'user_feed',
		parameters: {},
		requiresAuth: true,
		onSuccess: this.userFeedSuccess.bind(this),
		onFailure: this.feedFailed.bind(this),
		ignoreErrors: false,
		debug: true
	});

};
FeedAssistant.prototype.userFeedSuccess = function(r) {
	var j=r.responseJSON.results;
	
	var mostrecent=j[0];
	
	mostrecent.venue_nameFormatted=this.fixVenue(mostrecent.venue_name);
	mostrecent.created_atFormatted=this.fixDate(mostrecent.created_at);
	mostrecent.thin="-thin";
	
	this.controller.get("most-recent").update(Mojo.View.render({object: mostrecent, template:'templates/feedItems'}));
};

FeedAssistant.prototype.feedSuccess = function(r) {
	logthis("feedsuccess");
	var j=r.responseJSON.results;
	this.nextPage=r.responseJSON.next_page.replace("http://api.untappd.com/v3/","").split("=")[1];
	
	logthis("j.length="+j.length);

	this.resultsModel.items=j;
	this.controller.modelChanged(this.resultsModel);
	logthis(this.resultsModel.items.length);
};

FeedAssistant.prototype.feedSuccessMore = function(r) {
	logthis("load more feedsuccess");
	var j=r.responseJSON.results;
	
	logthis("j.length="+j.length);

	this.controller.get("goLoad").mojo.deactivate();
//	this.resultsModel.items=this.resultsModel.items.concat(j);
//	logthis("new length="+this.resultsModel.items.length);
//	this.controller.modelChanged(this.resultsModel);

	var listLength=this.controller.get("feed-list").mojo.getLength();
	logthis("old len="+listLength);
	this.controller.get("feed-list").mojo.noticeAddedItems(listLength,j);

	this.nextPage=r.responseJSON.next_page.replace("http://api.untappd.com/v3/","").split("=")[1];

};

FeedAssistant.prototype.feedFailed = function(r) {

};
FeedAssistant.prototype.onLoadTapped = function(r) {
	logthis("nextpage="+this.nextPage);
	untappdGet(this,{
		endpoint: 'feed',
		parameters: {offset: this.nextPage},
		requiresAuth: true,
		onSuccess: this.feedSuccessMore.bind(this),
		onFailure: this.feedFailed.bind(this),
		ignoreErrors: false,
		debug: true
	});

};

FeedAssistant.prototype.onListTapped = function(event) {
	this.controller.stageController.pushScene("view-checkin",{checkin: event.item});
};

FeedAssistant.prototype.fixVenue = function(value,model) {
	if(value!='' && value!=undefined){
		return 'at <b>'+value+'</b>';
	}else{
		return '';
	}
};

FeedAssistant.prototype.fixDate = function(value,model) {
	if(value!='' && value!=undefined){
		var now=new Date;
		var tz=now.getTimezoneOffset();
		logthis("tz="+tz);
		
		//Sun, 22 May 2011 21:07:06 +0000
		logthis("value="+value);
		var dateParts=value.split(" ");
		logthis("splitted");
		var dayp=dateParts[0];
		logthis("1");
		var datep=dateParts[1];
		logthis("2");
		var monthp=dateParts[2];
		logthis("3");
		var yearp=dateParts[3];
		logthis("4");
		var timep=dateParts[4];
		logthis("5");
		var tzonep=dateParts[5];
		
		logthis("parsed date");

		var created=new Date(monthp+" "+datep+", "+yearp+" "+timep);
		logthis("created="+created);
		
		//now add or subtract our diff
		var diff=parseInt(tz)*-60*1000; //convert minutes to milliseconds
		var seconds=created.getTime();
		seconds=seconds+diff;
		var nd=new Date(seconds);
		logthis("got date diff");
		
		var offset=now.getTime()-seconds;
		logthis("got offset");
		
		return GROWLR.relativeTime(offset);
	}
};

FeedAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

FeedAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

FeedAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
