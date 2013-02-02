function postBack(){
//	try {
//		var xhr = new XMLHttpRequest();
//		xhr.open('GET',)
//	} catch (e) {
//		postMessage("error: " + e.message);
//	}
	postMessage("I am here");
}
function testsetset(){
	
}

self.addEventListener('message', function(e) {
	postMessage(e.data + " modified");
}, false);
testsetset();
postBack();