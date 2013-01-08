function updateTemplate_Login(){
	var o = this;
	if (typeof o.response === "undefined"){
		//not logged in
		return new EJS({url: '/templates/login_status.ejs'}).update('contentWrap', {});
	}else{
		//loged in
		return new EJS({url: '/templates/login_status.ejs'}).update('contentWrap', {content: o});
	}
}
