function CheckinResultAssistant(p) {
	this.params=p;
}

CheckinResultAssistant.prototype.setup = function() {
	var r=this.params.result;
	
	logthis(Object.toJSON(r.social_results.foursquare));
	
	/*this.controller.get("beer-image").src=r.beer_details.img;
	this.controller.get("beer-name").innerHTML=r.beer_details.beer_name;
	this.controller.get("beer-brewery").innerHTML=r.beer_details.beer_brewery;
	this.controller.get("beer-location").innerHTML='<img src="'+r.foursquare_details.foursquare_img+'" width="16" height="16"> '+r.foursquare_details.venue_name;*/
	
	var msg="You're having your <i>"+r.checkin_total.beer+"</i> <b>"+r.beer_details.beer_name+"</b> from "+r.beer_details.brewery_name;
	if(r.foursquare_details.venue_name!=undefined){
		msg+=" while you're at <b>"+r.foursquare_details.venue_name+"</b>";
	}
	msg+=". This is the <i>"+r.checkin_total.beer_month+"</i> time you've had this beer this month.";

	this.controller.get("checkin-counts").innerHTML=msg;
	
	if(r.badges==undefined || r.badges.length==0){
		this.controller.get("badge-fields").hide();
	}else{
		this.controller.get("badge-fields").show();
		if(r.badges.length==undefined){
			r.badges=[r.badges];
		}
	
		var badges = Mojo.View.render({collection: r.badges, template: 'templates/badgeItem'});
	}

	this.controller.get("badges").innerHTML=badges;
	
	this.resultsModel = {items: r.recommendations, listTitle: $L('Results')};

	this.controller.setupWidget('beer-list', 
					      this.resultsAttributes={itemTemplate:'templates/beerItems2'},
					      this.resultsModel);
	this.listTappedBound=this.listTapped.bind(this);
	Mojo.Event.listen(this.controller.get("beer-list"), Mojo.Event.listTap, this.listTappedBound);


	//handle any foursquare data
	if(r.social_results!=undefined){
		if(r.social_results.foursquare!=undefined){
			var notifs=r.social_results.foursquare;
			this.badgeHTML='';
			this.mayorHTML='';
			this.scoresHTML='';
			for(var n=0;n<notifs.length;n++){
				switch(notifs[n].type){
					case "message":
						//this.controller.get('checkin-display').innerHTML=notifs[n].item.message;
						break;
					case "mayorship":
						this.nomayor=false;
						//handle different mayrship notification types
						switch(notifs[n].item.type){
							case "nochange":						
								break;
							case "new":
								break;
							case "stolen":
								break;
						}
						//test days behind
		//				notifs[n].item.daysBehind=10;
						
						this.mayorHTML = '<div class="result row" style="padding:0; padding-bottom: 7px; padding-top: 3px;"><img src="'+notifs[n].item.image+'" width="50" height="50"  class="friend-avatar" style="float: left; padding-top:0px;margin-left: 5px;"/><div style="float: left;margin-left: 3px; width: 180px; padding-top: 0px; padding-bottom:0px;font-size:16px;">'+notifs[n].item.message+'	</div><br class="breaker"/></div>';
						if(notifs[n].item.daysBehind){
							this.mayorHTML += '<div class="result row" style="padding:0; padding-bottom: 7px; padding-top: 3px;"><div class="days-away" style="float: left; padding-top:18px;margin-left: 5px;width:48px;height:30px;font-size: 20px;color:#000;text-align:center;background:url(images/calendar.png) no-repeat left top;">'+notifs[n].item.daysBehind+'</div><div style="float: left;margin-left: 10px; width: 180px; padding-top: 0px; padding-bottom:0px;font-size:16px;">You are now '+notifs[n].item.daysBehind+' days away from becoming the Mayor!</div><br class="breaker"/></div>';
						}
						break;
					case "score": //{"type":"score","item":{"scores":[{"points":1,"icon":"/img/scoring/2.png","message":"First stop today"}],"total":1}}
						var scores=notifs[n].item.scores;
						var totalpoints=notifs[n].item.total;
						this.noscores=false;
						break;
					case "badge":
						var badge=notifs[n].item.badge;
						var badge_name=badge.name;
						var badge_icon=badge.image.prefix+badge.image.sizes[0]+badge.image.name;
						var badge_text=badge.description;
						this.badgeHTML += 	'<div class="result row" style="padding:0; padding-bottom: 7px; padding-top: 3px;"><img src="'+badge_icon+'" width="32" height="32"  class="friend-avatar" style="float: left; padding-top:0px;margin-left: 5px;"/><div style="float: left;margin-left: 3px; width: 195px; padding-top: 0px; padding-bottom:0px;font-size:16px;">'+badge_name+': '+badge_text+'	</div><br class="breaker"/></div>';
						
						break;
					case "tipAlert":
						this.notip=false;
						this.tip=notifs[n].item.tip;
						break;
				}
			}
		
			
			//set the individual scores - handle changes in JSON response...
			if(scores != undefined) {
				//var totalpoints=0;
				for(var i = 0; i < scores.length; i++) {
					if (scores[i] != undefined) { 
						var imgpath = (scores[i].icon.indexOf("http://")!=-1)? scores[i].icon: "http://foursquare.com"+scores[i].icon;
						var msg = '+' + scores[i].points + ' ' +scores[i].message;
						this.scoresHTML += '<div class="result row" style="padding:0; padding-bottom: 7px; padding-top: 3px;"><img src="'+imgpath+'" width="20" height="20" style="float: left; padding-top:0px;margin-left: 5px;"/><div style="float: left;margin-left: 3px; width: 260px; padding-top: 0px; padding-bottom:0px;font-size:16px;">'+msg+'	</div><br class="breaker"/></div>';
		//'<div class="palm-row single"><div class="checkin-score-item"><img src="'+imgpath+'" /> <span>'+msg+'</span></div></div>';
					}
				}
				var totalPts = (totalpoints != 1)? totalpoints+' pts': totalpoints+' pt';
				this.controller.get('foursquare-title').innerHTML = "FOURSQUARE (" + totalPts+")";
			}else{
				this.noscores=true;
			}
			
			this.controller.get("foursquare").update(this.mayorHTML+this.scoresHTML+this.badgeHTML);
			this.controller.get("foursquare-fields").show();
		
		}
	}
};

CheckinResultAssistant.prototype.listTapped = function(event){
	this.controller.stageController.pushScene({name:"beer-info", transition: Mojo.Transition.zoomFade},{beer:event.item});
};

CheckinResultAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

CheckinResultAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

CheckinResultAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
