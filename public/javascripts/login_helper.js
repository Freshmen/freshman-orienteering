function updateTemplate_Devices(){
	var o = this;
	if (typeof o.devices === "undefined"){
		// no devices
		
	}else{
		// has devices
		return new EJS({url: '/mockData/login_status.ejs'}).update('contentWrap', {content: o});
	}
}
