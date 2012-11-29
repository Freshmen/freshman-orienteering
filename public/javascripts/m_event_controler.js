$().ready(function(){
	var isDisplay = false;
	var defaultColor = '#333';
	function displayEventList(){
		injectEvents();
		$('#listContent').css('display','block');
		$('#testEvent a').css('color','#44e');
		isDisplay = true;
	}
	function undisplayEventList(){
		$('#listContent').css('display','none');
		$('#testEvent a').css('color',defaultColor);
		isDisplay = false;
	}
	function injectEvents(){
		// new data



		$.ajax({
			  url: '/api/v1/events',
			  success: function(data) {
				// inject
					console.log(data);
				  new EJS({url: 'mockData/mobileList.ejs'}).update('contentWrap', {content: data.events});
			  }
			});
			
	}
	$('#testEvent').click(function(){
		if(!isDisplay){
			displayEventList();
		}else{
			undisplayEventList();
		}
		
	});
	$('#eventList li').live('click',function(){
		var eventName = $(this).children().text().replace(/ /,"");
		// new data
		$.ajax({
			  url: '/mockData/' + eventName + '.json',
			  success: function(data) {
				// inject
				var callback = new EJS({url: '/mockData/mobileList.ejs'}).update('contentWrap',{content:data.checkpoints});
			  },
			  error: function(e){
				// get an instance from notification centre
				var marker_notifier = initialiseNotification();
				marker_notifier.error('Sorry, your request cannot be made.');
			  }
			});
		
	});

	// Facebook sign in addition, worked on local machine on this, not sure how it will function online

	$('#fbSignIn').click(function(){
		fbLogin();
	});	
});