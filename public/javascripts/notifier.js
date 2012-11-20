function initialiseNotification() {
	var notifier = new Backbone.Notifier({
		ms : 2000, // milliseconds before hiding, (null || false => no timeout)
	});
	return notifier;
}