// initialise an EventThread object
var eventThread = new EventThread();

// worker listens on on-coming message from the main thread
self.addEventListener('message', function(e) {
    eventThread.setEnrolmentID(e.data);
    if(eventThread.enrolmentID){
        eventThread.getEvent();
    }else{
        postMessage("error: enrolment id is null");
    }
}, false);

function EventThread(){
    var _self = this;
    _self.enrolmentID = null;
    _self.xhr = new XMLHttpRequest();

    // register an AJAX listener on ready stay changes
    _self.xhr.onreadystatechange = function()
    {
        // on success, for status referencing, please check http://www.w3.org/TR/2006/WD-XMLHttpRequest-20060405/
        if (_self.xhr.readyState==4 && _self.xhr.status==200)
        {
            _self.updateEnrolmentToMain(_self.xhr.responseText);
        }
    }

    // set enrolment ID
    _self.setEnrolmentID = function setEnrolmentID(id){
        _self.enrolmentID = id;
    }

    // download event by ID asynchronously
    _self.getEvent = function getEvent(){
        try {
            _self.xhr.open('GET','/api/v2/events/' + _self.enrolmentID,true);
            _self.xhr.setRequestHeader("Content-type","application/json");
            _self.xhr.send();

        } catch (e) {
            postMessage("error: " + e.message);
        }
    }

    // post message back to the main thread with given message
    _self.updateEnrolmentToMain = function updateEnrolmentToMain(message){
        postMessage(message);
    }
}
