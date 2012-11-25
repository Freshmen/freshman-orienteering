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
//		var eventName = $(this).children().text().replace(/ /,"");
		// new data
		$.ajax({
			  url: '/mockData/eventExample.json',
			  success: function(data) {
				// inject
				  new EJS({url: 'mockData/mobileList.ejs'}).update('contentWrap', {content: data.db});
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
				  alert(e);
			  }
			});
		
	});
});