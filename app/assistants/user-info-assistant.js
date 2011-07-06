function UserInfoAssistant(p) {
	this.params=p;
	if(this.params==undefined){
		this.params={
			userId: ''
		};
	}
	if(this.params.userId==undefined || this.params.userId==""){
		this.self=true;
		this.params.userId="";
	}
}

UserInfoAssistant.prototype.setup = function() {
	var setupMenu=GROWLR.setupMenu.bind(this);
	setupMenu('goProfile');
	
	if(this.self){
		this.controller.get("profile-title").innerHTML='PROFILE';
	}
	
	untappdGet(this,{
		endpoint: 'user',
		parameters: {user: this.params.userId},
		requiresAuth: true,
		ignoreErrors: false,
		debug: true,
		onSuccess: this.userSuccess.bind(this),
		onFailure: this.userFailed.bind(this)
	});
};

UserInfoAssistant.prototype.userSuccess=function(r){
	this.controller.get("venueScrim").hide();
	var bubbles=this.controller.document.querySelectorAll(".snowflake");
	for(var s=0;s<bubbles.length;s++){
		this.controller.document.body.removeChild(bubbles[s]);
	}

	var j=r.responseJSON.results;
	
	var firstName=j.user.first_name;
	var lastName=j.user.last_name || '';
	this.controller.get("user-name").innerHTML=firstName+" "+lastName;
	
	this.controller.get("user-image").src=j.user.user_avatar;
	this.controller.get("user-location").innerHTML=j.user.location || '';
	this.controller.get("user-bio").innerHTML=j.user.bio || '';
	
	this.controller.get("unique-beers").innerHTML=j.user.total_beers+" different beers consumed";
	this.controller.get("total-checkins").innerHTML=j.user.total_checkins+" total beers drank";
	this.controller.get("created-beers").innerHTML=j.user.total_created_beers+" beers created";
	
};

UserInfoAssistant.prototype.userFailed=function(r){

};

UserInfoAssistant.prototype.activate = function(event) {
	   bubble_init(this.controller.document);
};

UserInfoAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

UserInfoAssistant.prototype.cleanup = function(event) {
	var bubbles=this.controller.document.querySelectorAll(".snowflake");
	for(var s=0;s<bubbles.length;s++){
		this.controller.document.body.removeChild(bubbles[s]);
	}
};
