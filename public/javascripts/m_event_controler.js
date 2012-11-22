$().ready(function(){
	var isDisplay = false;
	var defaultColor = '#333';
	function displayEventList(){
		$('#listContent').css('display','block');
		$('#testEvent a').css('color','#44e');
		isDisplay = true;
	}
	function undisplayEventList(){
		$('#listContent').css('display','none');
		$('#testEvent a').css('color',defaultColor);
		isDisplay = false;
	}
	$('#testEvent').click(function(){
		if(!isDisplay){
			displayEventList();
		}else{
			undisplayEventList();
		}
		
	});
});