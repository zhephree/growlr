function ViewCheckinAssistant(p) {
	this.checkin=p.checkin;
}

ViewCheckinAssistant.prototype.setup = function() {

	untappdGet(this,{
		endpoint: 'details',
		parameters: {id: this.checkin.checkin_id},
		requiresAuth: true,
		onSuccess: this.checkinSuccess.bind(this),
		onFailure: this.checkinFailed.bind(this),
		ignoreErrors: false,
		debug: true
	});
	this.controller.setupWidget('comment', this.attributes = {hintText:'Add comment...'}, this.commentModel = {value:'', disabled:false});
	this.controller.setupWidget('goComment', this.attributes = {type:Mojo.Widget.activityButton}, this.loginBtnModel = {label:'Add Comment', disabled:false});

	this.resultsModel = {items: [], listTitle: $L('Results')};
	this.controller.setupWidget('comments-list', 
					      this.resultsAttributes={itemTemplate:'templates/commentItem',formatters:{created_at: this.fixDate.bind(this)}},
					      this.resultsModel);


	this.toastTappedBound=this.toastTapped.bind(this);
	Mojo.Event.listen(this.controller.get("toast-this"),Mojo.Event.tap,this.toastTappedBound);

	this.commentTappedBound=this.commentTapped.bind(this);
	Mojo.Event.listen(this.controller.get("goComment"),Mojo.Event.tap,this.commentTappedBound);
};

ViewCheckinAssistant.prototype.fixDate = function(value,model) {
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

ViewCheckinAssistant.prototype.commentTapped = function(r) {
	if(this.commentModel.value!=''){
		untappdPost(this,{
			endpoint: 'add_comment',
			requiresAuth: true,
			parameters: {
				checkin_id: this.checkin.checkin_id,
				comment: this.commentModel.value
			},
			onSuccess: function(r){
					this.controller.get("goComment").mojo.deactivate();
					var results=r.responseJSON.results;
					
					var weekday=new Array(7);
					weekday[0]="Sun";
					weekday[1]="Mon";
					weekday[2]="Tue";
					weekday[3]="Wed";
					weekday[4]="Thu";
					weekday[5]="Fri";
					weekday[6]="Sat";
					

					var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
					logthis("setup arrays");
										
					var now=new Date;
					var thedate=weekday[now.getDay()] + ", "+now.getDate()+" "+months[now.getMonth()]+" "+now.getFullYear()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds()+" +"+(now.getTimezoneOffset()/60);
					logthis("new date="+thedate);
					
					
					var comment={
						user: {img: results.user_details.img,
							first_name: results.user_details.name,
							last_name:'',
							id: results.user_details.id
						},
						comment_id: results.comment_details.comment_id,
						text: results.comment_details.comment_text,
						created_at: thedate
					};
					
					logthis("set up object");
					
					var listLength=this.controller.get("comments-list").mojo.getLength();	
					this.controller.get("comments-list").mojo.noticeAddedItems(listLength,[comment]);
					
					logthis("updated list");
					
					this.commentModel.value='';
					this.controller.modelChanged(this.commentModel);
				
			}.bind(this),
			onFailure: this.checkinFailed.bind(this),
			ignoreErrors: false,
			debug: true
		});		
	}
};

ViewCheckinAssistant.prototype.toastTapped = function(r) {
	if(!this.untoast){
		untappdPost(this,{
			endpoint: 'toast',
			requiresAuth: true,
			parameters: {
				checkin_id: this.checkin.checkin_id,
			},
			onSuccess: function(r){
					var results=r.responseJSON;
					if(results.like_count==1){
						this.controller.get("toast-message").update("You're the only one whose toasted this. Untoast?");	
						this.controller.get("toast-this").addClassName("untoast");
						this.untoast=true;
					}else if(results.like_count>1){
						this.controller.get("toast-message").update(results.toast_count+" other people have toasted this. Untoast?");	
						this.controller.get("toast-this").addClassName("untoast");		
						this.untoast=true;
					}
				
			}.bind(this),
			onFailure: this.checkinFailed.bind(this),
			ignoreErrors: false,
			debug: true
		});
	
	}else{
		untappdPost(this,{
			endpoint: 'delete_toast',
			requiresAuth: true,
			parameters: {
				checkin_id: this.checkin.checkin_id,
			},
			onSuccess: function(r){
					var results=r.responseJSON;
					if(results.like_count==1){
						this.controller.get("toast-message").update("Toast this? 1 other person has.");
						this.controller.get("toast-this").removeClassName("untoast");		
						this.untoast=false;
					}else if(results.like_count>1){
						this.controller.get("toast-message").update("Toast this? "+results.toast_count+" other people have.");
						this.controller.get("toast-this").removeClassName("untoast");		
						this.untoast=false;
					}else if(results.like_count==0){
						this.controller.get("toast-message").update("Be the first to toast this!");
						this.controller.get("toast-this").removeClassName("untoast");		
						this.untoast=false;
					}				
			}.bind(this),
			onFailure: this.checkinFailed.bind(this),
			ignoreErrors: false,
			debug: true
		});
	
	}
};

ViewCheckinAssistant.prototype.checkinSuccess = function(r) {
	var user=r.responseJSON.results.user;
	var results=r.responseJSON.results;

	this.controller.get("user-name").update(user.first_name+" "+user.last_name);
	this.controller.get("user-city").update(user.location);
	if(user.url!==null){this.controller.get("user-website").update(user.url.link());}
	logthis("did url");
	this.controller.get("user-photo").update('<img src="'+user.user_avatar+'" width="64">');

	logthis("set DIVs");	
	var checkin={
		beer_stamp: results.beer_stamp,
		beer_name: results.beer_name,
		brewery_name: results.brewery_name,
		created_atFormatted: this.fixDate(results.created_at),
		check_in_comment: results.check_in_comment,
		rating: this.fixRating(results.user_rating),
		thin: 'thin'
	};
	
	logthis("built checkin");
	
	this.controller.get("checkin-info").update(Mojo.View.render({object: checkin, template: 'templates/checkinInfo'}));
	
	
	if(results.toast_count==1 && results.you_toast==false){
		this.controller.get("toast-message").update("Toast this? 1 other person has.");
		this.untoast=false;
	}else if(results.toast_count>1 && results.you_toast==false){
		this.controller.get("toast-message").update("Toast this? "+results.toast_count+" other people have.");
		this.untoast=false;
	}else if(results.toast_count==0 && results.you_toast==false){
		this.controller.get("toast-message").update("Be the first to toast this!");
		this.untoast=false;
	}else if(results.toast_count==1 && (results.you_toast==true || results.you_toast==1)){
		this.controller.get("toast-message").update("You're the only one whose toasted this. Untoast?");	
		this.controller.get("toast-this").addClassName("untoast");
		this.untoast=true;
	}else if(results.toast_count>1 && (results.you_toast==true || results.you_toast==1)){
		this.controller.get("toast-message").update(results.toast_count+" other people have toasted this. Untoast?");	
		this.controller.get("toast-this").addClassName("untoast");		
		this.untoast=true;
	}else if(results.toast_count==0 && (results.you_toast==true || results.you_toast==1)){
		this.controller.get("toast-message").update("You're the only one whose toasted this. Untoast?");	
		this.controller.get("toast-this").addClassName("untoast");		
		this.untoast=true;
	}
	
	var comments=results.comments;
	this.resultsModel.items=results.comments;
	this.controller.modelChanged(this.resultsModel);
};

ViewCheckinAssistant.prototype.checkinFailed = function(r) {


};

ViewCheckinAssistant.prototype.fixRating = function(avgRating){
	var avgStars='';
	for(var r=0;r<avgRating;r++){
		avgStars+='<img src="images/star-bright.png" width="16">';
	}
	for(var d=0;d<(5-avgRating);d++){
		avgStars+='<img src="images/star-bright.png" class="faded" width="16">';
	}
	
	logthis("made stars");

	return avgStars;
};

ViewCheckinAssistant.prototype.fixDate = function(value,model){
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

ViewCheckinAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

ViewCheckinAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ViewCheckinAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
