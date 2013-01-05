$().ready(function (){
	$("#signin").live('click',function(){
		login();
	});
	console.log(loggedInToFacebook);
});

function updateTemplate_Login(){
	var o = this;
	if (typeof o.response === "undefined"){
		//not logged in
		new EJS({url: '/mockData/login_status.ejs'}).update('contentWrap', {});
	}else{
		//loged in
		new EJS({url: '/mockData/login_status.ejs'}).update('contentWrap', {content: o});
	}
}
