$().ready(function(){
	var defaultColour = '#fff';
	//a:visited has been restricted for security reason
	var visitedColour = '#000'; 
	/* ***********************
	 * Initialisation
	 *
	 * ***********************/
	// initialise an event object
	var events = new Events();
    // initialise a status object
	var status = new Status();
    // initialise a checkpoint object
    var checkPoints = null;
	$('#taskListClose').live('click',function(){
		undisplayTaskList();
	});
	$(document).on('click','#contentListClose',function(){
		events.undisplayEventList();
	});	
	$(document).on('click','#status',function(){
		status.initialiseView();
		var e = new Enrolment();
		e.getUserEnrolment(status.updateEnrolment);
	});
	$('#goBack').live('click',function(){
		events.injectEvents.call();
	});
	
	$('#eventList').click(function(){
		events.getEvents(events.injectEvents);
	});

	$(document).on('click','#events li',function(){
		var el = $(this);
        checkPoints = new Checkpoints();
		events.getEventByIndexHelper.call(el);
	});
	events.displayEventList();
	
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
		events.setEnrolment();
	});

    // Starting an Event
	$(document).on('click','#statusEnrollList div span',function(){
		// assigned the current "starting" element
		if (!$.isEmptyObject(status.starting) && status.starting != this){
			status.cancleThisStart();
		}
		if (!$.isEmptyObject(status.starting) && status.starting === this){
			status.cancleThisStart();
			return false;
		}
		status.starting = this;
		status.updateCSS();
        status.startingEvent = new status.StartingEvent();
        status.updateEvent.call(status.startingEvent.startingEvent);
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

	function injectTask(){
		$.ajax({
			 url: '/mockData/taskExample.json', success: function(data){

			 new EJS({url: '/templates/taskTemplate.ejs'}).update('taskWrap', {content : data.task});
		}
		});
	}
	
	function Events() {
		var self = this;
		// a list of events from the server
		self.events = [];
		// a list of new enrolled events for app restart
		self.newEnrolEvents = [];
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
		
		self.setEnrolment = function setEnrolment(){
			var event_id = self.event.currentEvent._id;
			$.ajax({
				type: "POST",
				url: '/api/v2/events/' + event_id + "/enrollments",
				success: function(data) {
					// inject
					self.newEnrolEvents.push(data);
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
			self.displayMaker(o); 
			self.centerScreenWithCheckpoints(o);
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
	
	function Enrolment(){
		var self = this;
		self.enrolments = [];
		self.el = [];
		self.callback = null;
		// get a list of enrolment
		self.getUserEnrolment = function getUserEnrolment(callback){
			if (callback && typeof(callback) === "function"){
				self.callback = callback;
			}
			$.ajax({
				url:"/api/v2/me/enrollments"
			})
			.done(this,self.whenGetUserEnrolmentDone)
			.fail(self.whenGetUserEnrolmentFail);
		}
		// refresh enrolment
		self.refreshEnrolment = function refreshEnrolment(){
			
		}
		self.whenGetUserEnrolmentDone = function (data){
			self.enrolments = data;
			if (self.callback && typeof(self.callback) === "function"){
				self.callback.call(data);
			}
		}
		self.whenGetUserEnrolmentFail = function (data){
			console.log("fail");
		}
		self.fromEnrolmentGetEvent = function(){
			
		}
	}
	
	function Status(){
		var self = this;
		// represents the current element that a user clicks
		self.starting = {};
		self.startClassName = new StartClassName();
        self.startingEvent = null;

        // represents "start" or "starting" elements
		function StartClassName(){
			var _self = this;
			_self.DEFAULT_NAME = 'startEvent';
			_self.BEFORE_START = _self.DEFAULT_NAME;
			_self.STARTING = 'startingEvent';
			
			// return the next status - not start or starting - that it should be
			_self.nextName = function nextName(){
				if (_self.currentName() != _self.BEFORE_START){
					return _self.BEFORE_START;
				}else{
					return _self.STARTING;
				}
			}
			
			//return the current status
			_self.currentName = function currentName(){
				if (!$.isEmptyObject(self.starting)){
					return $(self.starting).attr('class') 
				}else{
					return _self.DEFAULT_NAME;
				}
			}
		}

        // represents the starting event
        self.StartingEvent = function StartingEvent(){
            var _self = this;
            // current selected event id
            _self.startingEventId = $(self.starting).length != 0 ? $(self.starting).siblings("li").attr("data-event-id") : null;
            // current selected event
            _self.startingEvent = typeof(Storage)!=="undefined" ?
                _self.startingEventId != null ?
                    sessionStorage.getItem(_self.startingEventId) != null ?
                        JSON.parse(sessionStorage.getItem(_self.startingEventId))
                        : {} // if no this key
                : {} // if _self.startingEventId is null
            :{}; // if Storage is not defined

            // update event if not found from session storage
            _self.getEvent = (function getEvent(){
                // if no key in the storage
                if ($.isEmptyObject(_self.startingEvent) && _self.startingEventId != null){
                    $.ajax({
                        url:"/api/v2/events/" + _self.startingEventId
                    })
                        .done(function(data, textStatus, jqXHR) {
                            // put into session storage
                            if(typeof(Storage) !== "undefined")
                            {
                                try{
                                    // session storage stored stringified data
                                    if (typeof(data) === "object"){
                                        sessionStorage.setItem(data._id,JSON.stringify(data));
                                        _self.startingEvent = data;
                                    }else if(typeof(data) === "string"){
                                        sessionStorage.setItem(JSON.parse(data)._id,data);
                                        _self.startingEvent = JSON.parse(data);
                                    }
                                }catch (err) {
                                    var marker_notifier = initialiseNotification();
                                    marker_notifier.error('Error: ' + err);
                                }

                            }
                            else
                            {
                                /* -- Out of scope of the project -- */
                            }
                            // update event template in delay


                        })
                        .fail(function(data, textStatus, jqXHR) {
                            var marker_notifier = initialiseNotification();
                            marker_notifier.error('Error: ' + textStatus);
                        });
                }
            })();
        }

        // initialise status view
		self.initialiseView = function initialiseView(){
			new EJS({url: '/templates/statusTemplate.ejs'}).update('contentWrap', {});
		}

        // update status view
		self.updateView = function updateView(){

		}

        // update enrolment list view
		self.updateEnrolment = function updateEnrolment(){
			var o = this;
            // initial update
			new EJS({url: '/templates/enrolmentTemplate.ejs'}).update('enrolmentWrap', {content:this});
            // deeper update
            self.updateEventNameHelper.call(o);
		}
        self.updateEventNameHelper = function updateEventName(){
            var o = this;
            // this is the part that wasn't sure how to design
            var eventNameUpdateWorker = new EventNameUpdateWorker(o);
            eventNameUpdateWorker.eventID = o[0].event;
            eventNameUpdateWorker.onmessageCallback = self.updateEventName;
            eventNameUpdateWorker.tellWorkEventID();
        }
        self.updateEventName = function updateEventName(){
            var o = JSON.parse(this);
            var el = $("#statusEnrollList li[data-event-id=" + o._id +"] a");
            el.text(o.title);
        }

        // update event template
        self.updateEvent = function updateEvent(){
            var o = this;
            // initial update
            new EJS({url: '/templates/startingEventTemplate.ejs'}).update('startedEventWrap', {content:this});
        }

        /**
         * StartClassName member functions
         */
        // update CSS of enrolment start button
        self.updateCSS = function updateCSS() {
			if (!$.isEmptyObject(self.starting)){
				return $(self.starting).attr('class',self.startClassName.nextName)
			}else{
				return false;
			}
		}
		// remove the updated CSS of the enrolment start button and reset the taped "starting" to empty
		self.cancleThisStart = function cancleThisStart() {
			//change the current "starting" to "start"
			self.updateCSS();
			self.starting = {};
		}

	}
	
	// handle notification selections 
	function notifiedWindow(){
		// o = {message, type, buttons, functions} 
		// where message and type are String; buttons and functions are Array
		var o = this;
		if ( (o.buttons.length + 1 ) != o.functions.length) {
			return false;
		}
		//edit default cancel
		o.buttons.push({'data-role': 'cancel', text: 'No', 'class': 'default'});
		// get an instance from notification centre
		var marker_notifier = initialiseNotification();
		// modify notification
		var confirmMsg = marker_notifier.notify({
			message: o.message,
			'type': o.type,
			buttons: o.buttons,
			modal: true,
			ms: 10000,
			opacity : .7
		});
		if (o.buttons.length > 1) {
			o.buttons.forEach(function(button,index,value){
				// attach events
				confirmMsg.on('click:' + button["data-role"],o.functions[index]);
			});
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
    var i = 0 ;
	// web worker
    function EventNameUpdateWorker(events){
        var self = this;
        self.eventID = null;
        self.event = {};
        self.enrolments = typeof(events)!=="undefined" ? events : [];
        self.onmessageCallback = null;
        self.onmessageNumberLimited = Object.prototype.toString.call( self.enrolments ) === '[object Array]' ?
            self.enrolments.length : 0;
        self.i = 1;
        // define a worker
        self.worker = typeof(Worker)!=="undefined" ?
            ( typeof(self.worker)=="undefined" ?
                new Worker('/javascripts/update_event_from_enrolment.js') :
                self.worker ) :
            "undefined";
        // listen on on-coming message
        self.worker.onmessage = typeof(self.worker)!=="undefined" ?
            function(e){
                // update the enrolment view
                // current event
                self.event = e.data;
                // store event in session
                // put into session storage
                if(typeof(Storage) !== "undefined")
                {   try{
                        // session storage stored stringified data
                        sessionStorage.setItem(JSON.parse(self.event)._id,self.event);
                    }catch (err) {
                        var marker_notifier = initialiseNotification();
                        marker_notifier.error('Error: ' + err);
                    }

                }
                else
                {
                    /* -- Out of scope of the project -- */
                }
                // trigger a callback with overwritten "this" to an "event" object
                if (self.onmessageCallback && typeof(self.onmessageCallback) === "function"){
                    self.onmessageCallback.call(self.event);
                }
                // post message to worker
                if (self.i<self.onmessageNumberLimited)
                    self.onMessageHelper(self.enrolments[self.i++]);
            } :
            null;

        // validation function
        (function(){
            if (Object.prototype.toString.call( self.enrolments ) !== '[object Array]'){
                console.log("error: " + events + " is not an array");
                self.enrolments = [];
                return false;
            }
        })();

        // helper function that communicate with the worker
        self.onMessageHelper = function onMessageHelper(e){
            self.eventID = e.event;
            self.tellWorkEventID();
        }

        self.tellWorkEventID = function tellWorkEventID(){

            if(typeof(self.worker)!=="undefined"){
                if (self.eventID != null){
                    self.worker.postMessage(self.eventID);
                }else{
                    return false;
                }
            }
        }

        self.stopWorker = function stopWorker(){
            if(typeof(self.worker)!=="undefined"){
                self.worker.terminate();
            }
        }

    }
});