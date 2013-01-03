var Fori = Fori || {};

Fori.Track = function(name, location, owner) {
	this.name = name;
	this.location = location;
	this.checkpoints = [];
	this.owner = owner;
}

Fori.Checkpoint = function(name, location) {
	this.name = name;
	this.location = location;
	this.tasks = [];
}

Fori.Task = function(name, description) {
	this.name = name;
	this.description = description;
}

Fori.User = function(name) {
	this.name = name;
}