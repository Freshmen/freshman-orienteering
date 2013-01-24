$().ready(function(){
	var defaultColour = '#fff';
	//a:visited has been restricted for security reason
	var visitedColour = '#000'; 
	/* ***********************
	 * Initialisation
	 *
	 * ***********************/
	// initialize an event object
	var events = new Events();

	$('#taskListClose').live('click',function(){
		undisplayTaskList();
	});
	$(document).on('click','#contentListClose',function(e){
		events.undisplayEventList();
	});	
	$("#status").live('click',function(){
		$.ajax({
	    	  url: "/mockData/",
	    	  type: "POST",
	    	  data: {"task": "asdfadsfsdaf"},
	    	  dataType: "json",
	    	  contentType: "application/json",
	    	  success : function(data){
	    		  console.log(log);
	    	  },
	    	  error : function(data){
	    		  console.log(data);
	    	  }
	    	});
	});
	$('#goBack').live('click',function(){
		events.injectEvents.call();
	});
	
	
	$('#eventList').click(function(){
		events.getEvents(events.injectEvents);

		/*
		if(!isDisplay){
			displayEventList();
		}else{
			undisplayEventList();
		}	
		*/

	});

//	$(document).on('click','#events li',getEventByIndexHelper);
	$(document).on('click','#events li',function(){
		var el = $(this);
		events.getEventByIndexHelper.call(el);
	});
	events.displayEventList();
//	displayEventList();
	
	// initialise a checkpoint object
	var checkPoints = new Checkpoints();
	
	$('#showCheckpoints').live('click',function(){
		// if hasn't been shown
		if (!checkPoints.isShown){
			// show checkpoints
			checkPoints.getCheckpointsHelper($(this).attr("data-tag"));
			// isShown = true
			checkPoints.setCheckpoints(true);
			// if it is shown
			if(checkPoints.isShown){
				// change text to "hide"
				$(this).children().text("Hide Checkpoints");
			}
		}else{
			// hide the checkpoints
			checkPoints.hideCheckpointsByCallback(hideCheckpoints);
			// change text to "show"
			$(this).children().text("Show Checkpoints");
			// isShown to false
			checkPoints.setCheckpoints(false);
		}
		
	});
	
	// initialise a task object
	var task = new Task();
	$(document).on('click','#checkPointWrap li',function(e){
		console.log(this);
	});

	// Enroll button in the even template
	$(document).on('click','#enrol',function(){
//		var index = parseInt(sessionStorage.currentEvent);
		events.setEnrollment();
	});

	// End Initialisation
	
	/* ***********************
	 * functions
	 *
	 * ***********************/
	
	function hideCheckpoints(){
		$("#checkPointWrap").children().remove();
	}
	
	
	function displayTaskList(){
		/* -- Nothing to do yet-- */
	}

	function undisplayTaskList(){
		$('#taskContent').css('display','none');
	}

//	function getEvents(){
//		// new data
//		$.ajax({
//			  url: '/api/v2/events',
//			  success: function(data) {
//				// inject
//				if(typeof(Storage)!=="undefined")
//			    {
//			    	//sessionStorage.eventArray = JSON.stringify(data.db);
//			    	sessionStorage.eventArray = JSON.stringify(data); // mock data version
//			    }
//			    else
//			    {
//			    	// NEED TO IMPROVE - No web storage support 
//			    }
//				injectEvents.call(data);
//			  },
//			  error : function(data){
//				  console.log(data);//return error if the JSON is not valid
//			  }
//			});
//			
//	}

//	function setEnrollment(index){
//		var events = JSON.parse(sessionStorage.eventArray);
//		var eventId = events[index]._id;
//
//		$.ajax({
//			type: "POST",
//			url: '/api/v2/events/' + eventId + "/enrollments",
//			  success: function(data) {
//				// inject
//				console.log(data)
//			  },
//
//			  error : function(data){
//			  	console.log("Error")
//				console.log(data);//return error if the JSON is not valid
//			  }
//			});
//	}

	function injectTask(){
		$.ajax({
			 url: '/mockData/taskExample.json', success: function(data){

			 new EJS({url: '/templates/taskTemplate.ejs'}).update('taskWrap', {content : data.task});
		}
		});
	}

//	function getEventByIndexHelper(){
//		var self = this;
//
//		// Hack to make the Enrollment work by: Jukka
//		if($(this).attr("id") == "enrol" ){
//			return
//		}
//		//////
//
//		if ($(this).parent().attr("data-tag") == "events"){
//			var o = self;
//			var event = getEventByIndex.call(o);
//			// show Event's description
//			showEventDescription(event);
//		}else if ($(this).parent().attr("data-tag") == "checkpoints"){
//			getTask();
//		}else if ($(this).parent().attr("data-tag") == "event_description"){
//			var o = self;
//			var event = getEventByIndex.call(o);
//		}
//	}
	
//	function getEventByIndex() {
//		var o = this;
//		var event_id = null;
//		var eventArray = JSON.parse(sessionStorage.eventArray);
//		if(eventArray != null && typeof eventArray != 'undefined'){
//			var index = $(o).attr('data-index');
//			/// Added by Jukka
//			sessionStorage.currentEvent = index;
//			return eventArray[index];
//		}else{
//			// TO-DO
//			return false;
//		}		
//	}


//	function injectEvents(){
//		var o = {};
//		if (this.events){
//			o = this;
//		}else{
//			if (sessionStorage.eventArray){
//				o = JSON.parse(sessionStorage.eventArray);
//			}else{
//				return false;
//			}
//		}
//	  	new EJS({url: '/templates/mobileList.ejs'}).update('contentWrap', {content: o});
//	}

//	function showEventDescription(event){
//		var html = new EJS({url: '/templates/mobileList.ejs'}).update('contentWrap',{content:event});
//	}
	
	/// Event enclosure

	function Events() {
		var self = this;
		// a list of events from the server
		self.events = [];
		// a list of enrolled events
		self.enrolEvents = [];
		// is the event list shown to user or not
		self.isDisplay = false;
		// create an instance of one event
		self.event = new Event();
		
		// one event
		function Event(){
			var _self = this;
			// current event
			_self.currentEvent = {};
			// show current event description 
			_self.showEventDescription = function showEventDescription(event){
				var html = new EJS({url: '/templates/mobileList.ejs'}).update('contentWrap',{content:event});
			}
		}
		
		// get event list from the server
		self.getEvents = function getEvents(){
			$.ajax({
			  url: '/api/v2/events',
			  success: function(data) {		    	
			    	self.events = data;
			    	self.injectEvents();
			  },
			  error : function(data){
				  console.log(data);//return error if the JSON is not valid
			  }
			});
		}
		
		// update the event list to the template which will then show to the user 
		self.injectEvents = function injectEvents(){
			var o = {};
			if (!$.isEmptyObject(self.events)){
				o = self.events;
			}else{
				return false;
			}
			new EJS({url: '/templates/mobileList.ejs'}).update('contentWrap', {content: o});
		}
		
		// get the event index where user tap on
		self.getEventByIndex = function getEventByIndex() {
			var o = this;
			var event_id = null;
			var eventArray = self.events;
			if(eventArray != null && typeof eventArray != 'undefined'){
				var index = $(o).attr('data-index');
				return eventArray[index];
			}else{
				// TO-DO
				return false;
			}		
		}
		
		self.getEventByIndexHelper = function getEventByIndexHelper(){
			var _self = this;

			if ($(this).parent().attr("data-tag") == "events"){
				var o = _self;
//				var event = self.getEventByIndex.call(o);
				self.event.currentEvent = self.getEventByIndex.call(o);
				// show Event's description
				self.event.showEventDescription(self.event.currentEvent);
			}else if ($(this).parent().attr("data-tag") == "checkpoints"){
				getTask();
			}else if ($(this).parent().attr("data-tag") == "event_description"){
				var o = _self;
				var event = self.getEventByIndex.call(o);
			}
		}
		
		self.setEnrollment = function setEnrollment(){
//			var events = JSON.parse(sessionStorage.eventArray);
			var event_id = self.event.currentEvent._id;

			$.ajax({
				type: "POST",
				url: '/api/v2/events/' + event_id + "/enrollments",
				  success: function(data) {
					// inject
					console.log(data)
				  },

				  error : function(data){
				  	console.log("Error")
					console.log(data);//return error if the JSON is not valid
				  }
				});
		}
		
		self.displayEventList = function displayEventList(){
			self.getEvents();
			$('#content').css('display','block');
			$('#eventList a').css('color',visitedColour);
			self.isDisplay = true;
		}
		
		self.undisplayEventList = function undisplayEventList(){
			$('#content').css('display','none');
			$('#eventList a').css('color',defaultColour);
			self.isDisplay = false;
		}

	}


	function Checkpoints(){
		var self = this;
		self.isShown = false;
		self.checkpoints = {};
		
		self.setCheckpoints = function setCheckpoints(b){
			if (typeof(b) === "boolean")
				self.isShown = b;
			else return false;
		}
		
		self.hideCheckpointsByCallback = function hideCheckpoints(callback){
			if(callback && typeof(callback) === "function"){
				// how you want to hide it
				callback();
			}
		}
		
		self.getCheckpointsHelper = function getCheckpointsHelper(event_id,callback){
			if ($.isEmptyObject(self.checkpoints)){
				if (callback && typeof(callback) === "function"){
					self.getCheckpoints(event_id,callback);
				}else{
					self.getCheckpoints(event_id,self.injectCheckpoints);
				}
			}else{
				self.injectCheckpoints();
			}
		}
		
		self.injectCheckpoints = function injectCheckpoints(){
			var o = {};
			if (!$.isEmptyObject(this.checkpoints)){
				o = this.checkpoints;
			}else{
				if (self.checkpoints.length != 0){
					o = self.checkpoints;
				}else{
					return false;
				}
			}
			var callback = new EJS({url: '/templates/checkpointTemplate.ejs'}).update('checkPointWrap',{content:o});
			checkPoints.isShown = true;
			// place all markers that in that event onto the map
//			self.displayMaker(o); having error
//			self.centerScreenWithCheckpoints(o);
		}
		
		self.getCheckpoints = function getCheckpoints(event_id,callback){
			// new checkpoints in events
			$.ajax({
				  url: '/api/v2/events/' + event_id + '/checkpoints',
				  success: function(data) {
					// inject
					  if (data.length == 0){
						  var marker_notifier = initialiseNotification();
						  marker_notifier.warning('Sorry, no checkpoints');
						  return false;
					  }else{
						  if(typeof(Storage)!=="undefined")
						    {
						    	//sessionStorage.eventArray = JSON.stringify(data.db);
//						    	sessionStorage.checkpointsArray = JSON.stringify(data); // mock data version
						    	self.checkpoints = data;
						    }
						    else
						    {
						    }
						  if (callback && typeof(callback) === "function"){
							  callback.call(data);
						  }
					  }
				  },
				  error: function(e){
					// get an instance from notification centre
					var marker_notifier = initialiseNotification();
					marker_notifier.error('Sorry, your request cannot be made.');
				  }
				});
		}
		self.displayMaker = function displayMaker(checkpoints){
			$.each(checkpoints,function(index,values){
				mobileAddCheckpointMarker(map, values);
			});
		}
		self.centerScreenWithCheckpoints = function centerScreenWithCheckpoints(checkpoints){
			var len = checkpoints.length;
			var meanLon = 0.0;
			var meanLat = 0.0;
			for(var i = 0; i < len; i++){
			  	meanLon += checkpoints[i].location.longitude;
			  	meanLat += checkpoints[i].location.latitude;
			  }

			  meanLon = meanLon/len;
			  meanLat = meanLat/len;
			  
			  setZoom(map, 14); // 14 is default for street level
			  centerMapToCoordinate(map, meanLat, meanLon);
			  
		}
	}

	function Task(){
		var self = this;
		self.checkpoint_id = null;
		self.event_id = null;
		self.task = {};
		self.taskAlarm = false;
		
		self.getTaskHelper = function getTaskHelper(event_id,checkpoint_id,callback){
			if ($.isEmptyObject(self.task)){
				if (callback && typeof(callback) === "function"){
					self.getTask(self.event_id,self.checkpoint_id,callback);
				}else{
					self.getCheckpoints(self.event_id,self.injectTask);
				}
			}else{
				self.injectTask();
			}
		}
		
		self.getTask = function getTask(event_id,checkpoint_id,callback){
			$.ajax({
				url: '/api/v2/events/' + event_id + '/checkpoints/' + checkpoint_id,
				success : function(data){
					//task data is coming here
					self.task = data;
					if (callback && typeof(callback) === "function"){
						  callback.call(data);
					}
				},
				error : function(data){
					// get an instance from notification centre
					var marker_notifier = initialiseNotification();
					marker_notifier.error('Sorry, your request cannot be made.');
				}
			});
		}
		
		self.injectTask = function injectTask(){
			var o = {};
			if (!$.isEmptyObject(this.task)){
				o = this.task;
			}else{
				if (self.task.length != 0){
					o = self.task;
				}else{
					return false;
				}
			}
			new EJS({url: '/templates/taskTemplate.ejs'}).update('taskWrap', {content : data.task});
		}
	}
	
	/* ***********************
	 * Testing functions
	 *
	 * ***********************/
	function handleFileSelect(evt) {
	    var files = evt.target.files; // FileList object

	    // Loop through the FileList and render image files as thumbnails.
	    for (var i = 0, f; f = files[i]; i++) {

	      // Only process image files.
	      if (!f.type.match('image.*')) {
	        continue;
	      }

	      var reader = new FileReader();

	      // Closure to capture the file information.
	      reader.onload = (function(theFile) {
	        return function(e) {
	          // Render thumbnail.
	          var span = document.createElement('span');
	          span.innerHTML = ['<img class="thumb" src="', e.target.result,
	                            '" title="', escape(theFile.name), '"/>'].join('');
	          document.getElementById('list').insertBefore(span, null);
	        };
	      })(f);

	      // Read in the image file as a data URL.
	      reader.readAsDataURL(f);
	      console.log(f);
//	      $.ajax({
//	    	  
//	      });
	    }
	  }
	  
});