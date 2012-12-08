$().ready(function(){
	var isDisplay = false;
	var defaultColor = '#333';
	
	function displayEventList(){
		injectEvents();
		$('#content').css('display','block');
		$('#testEvent a').css('color','#44e');
		isDisplay = true;
	}
	function undisplayEventList(){
		$('#content').css('display','none');
		$('#testEvent a').css('color',defaultColor);
		isDisplay = false;
	}
	function injectEvents(){
		// new data
		$.ajax({
			  url: '/api/v1/events',
			  success: function(data) {
				// inject
				if(typeof(Storage)!=="undefined")
			    {
			    	sessionStorage.eventArray = JSON.stringify(data);
			    }
			    else
			    {
			    	alert("Asdfasdfsd");
			    	/* NEED TO IMPROVE - No web storage support */
			    	/* 1, How to solve "links" changed by "delete_me" function in "Social_Rational_View" */
			    }
				new EJS({url: 'mockData/mobileList.ejs'}).update('contentWrap', {content: data.events});
			  }
			});
			
	}

	function injectTask(){
		$.ajax({
			 url: '/mockData/taskExample.json', success: function(data){

			 new EJS({url: 'mockData/taskTemplate.ejs'}).update('taskWrap', {content : data.task});
		
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
	$('#contentList li').live('click',function(){
		var self = this;
		if ($(this).parent().attr("data-tag") == "events"){
			var o = self;
			var event_id = getEvents.call(o);
			getCheckpoints(event_id);
		}else if ($(this).parent().attr("data-tag") == "checkpoints"){
			getTask();
		}else {
			alert("kiuyiuoy87687687");
		}
	});
	
	function getEvents() {
//		var eventName = $(this).children().text().replace(/ /,"");
		var o = this;
		var event_id = null;
		var eventArray = JSON.parse(sessionStorage.eventArray);
		if(eventArray != null && typeof eventArray != 'undefined'){
			var index = $(o).attr('data-index');
			event_id = eventArray['events'][index]._id;
		}else{
//			TO-DO
			return false;
		}
		return event_id;
	}
	
	function getCheckpoints(event_id){
		// new checkpoints in events
		$.ajax({
			  url: '/api/v1/events/' + event_id + '/checkpoints',
			  success: function(data) {
				// inject
				  if (data.checkpoints.length == 0){
					  var marker_notifier = initialiseNotification();
					  marker_notifier.warning('Sorry, no checkpoints');
					  return false;
				  }else{
					  var callback = new EJS({url: '/mockData/mobileList.ejs'}).update('contentWrap',{content:data.checkpoints});
					  // place all markers that in that event onto the map
					  displayMaker(data.checkpoints);
					  
				  }
			  },
			  error: function(e){
				// get an instance from notification centre
				var marker_notifier = initialiseNotification();
				marker_notifier.error('Sorry, your request cannot be made.');
			  }
			});
	}
	
	function getTask(){
		$.ajax({
			url: '/mockdata/taskExample.json',
			success : function(data){
				//task data is coming here
				 var callback = new EJS({url: '/mockData/taskTemplate.ejs'}).update('taskWrap',{content:data.task});
			},
			error : function(data){
				// get an instance from notification centre
				var marker_notifier = initialiseNotification();
				marker_notifier.error('Sorry, your request cannot be made.');
			}
		});
	}
	
	function displayMaker(checkpoints){
		$.each(checkpoints,function(index,values){
			addMarker(map,[values.location.latitude, values.location.longitude]);
		});
		
	}
	// Facebook sign in addition, worked on local machine on this, not sure how it will function online

	$('#fbSignIn').click(function(){
		fbLogin();
	});	
});