function(doc) {
	if (doc.type === "Event")
		emit (doc.title, doc);
}

function(doc) {
	if (doc.type === "Checkpoint")
		emit (doc.title, doc);
}

