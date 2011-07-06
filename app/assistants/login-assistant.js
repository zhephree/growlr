function LoginAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

LoginAssistant.prototype.setup = function() {
	this.controller.setupWidget('username', this.attributes = {hintText:'Untappd Username',textCase: Mojo.Widget.steModeLowerCase}, this.usernameModel = {value:'', disabled:false});
	this.controller.setupWidget('password', this.attributes = {hintText:'Password'}, this.passwordModel = {value:'', disabled:false});
	this.controller.setupWidget('goLogin', this.attributes = {type:Mojo.Widget.activityButton}, this.loginBtnModel = {label:'Log In', disabled:false});
	this.controller.setupWidget('goSignup', this.attributes = {}, this.signupBtnModel = {label:'Need an account? Sign up!', disabled:false});
	
	
	this.onSignupTappedBound=this.onSignupTapped.bind(this);
	Mojo.Event.listen(this.controller.get("goSignup"), Mojo.Event.tap, this.onSignupTappedBound);
	
	this.onLoginTappedBound=this.onLoginTapped.bind(this);
	Mojo.Event.listen(this.controller.get("goLogin"), Mojo.Event.tap, this.onLoginTappedBound);



	this.savedLogin=false;
	this.cookieData=new Mojo.Model.Cookie("login");
	var credentials=this.cookieData.get();
	if(credentials){ //have saved info
		GROWLR.username=credentials.username;
		GROWLR.password=credentials.password;
		this.usernameModel.value=credentials.username;
		this.controller.modelChanged(this.usernameModel);
		this.passwordModel.value=credentials.password;
		this.controller.modelChanged(this.passwordModel);
		this.savedLogin=true;
		this.doLogin=true;
	}
};

LoginAssistant.prototype.onSignupTapped = function(event){
			this.controller.serviceRequest('palm://com.palm.applicationManager', {
				 method: 'open',
				 parameters: {
					 target: "http://m.untappd.com"
				 }
			});
	Mojo.Controller.getAppController().showBanner("Tap 'CREATE NEW ACCOUNT'", {source: 'notification'});

};

LoginAssistant.prototype.onLoginTapped = function(event){
	GROWLR.auth=make_base_auth(this.usernameModel.value,this.passwordModel.value);
	
	this.cookieData=new Mojo.Model.Cookie("login");
	this.cookieData.put({
		username: this.usernameModel.value,
		password: this.passwordModel.value
	});

	
	logthis("auth="+GROWLR.auth);
	
	untappdGet(this,{
		endpoint: 'user',
		parameters: {},
		requiresAuth: true,
		onSuccess: this.loginSuccess.bind(this),
		onFailure: this.loginFailed.bind(this),
		ignoreErrors: false,
		debug: true
	});
};

LoginAssistant.prototype.loginSuccess = function(r){
	this.controller.stageController.swapScene("beer-search");
};

LoginAssistant.prototype.loginFailed = function(r){
	this.controller.get("goLogin").mojo.deactivate();
};

LoginAssistant.prototype.activate = function(event) {
	if(this.savedLogin && this.doLogin){
		this.doLogin=false;
		this.controller.get("goLogin").mojo.activate();
		this.onLoginTappedBound();
	}
};

LoginAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

LoginAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get("goSignup"), Mojo.Event.tap, this.onSignupTappedBound);
	Mojo.Event.stopListening(this.controller.get("goLogin"), Mojo.Event.tap, this.onLoginTappedBound);
};
