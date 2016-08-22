Meteor.startup(function(){
	// code to run on server at startup
	if(!Documents.findOne()){//no document yet
		Documents.insert({title: "My first document", isPrivate:false});
	}
});

Meteor.publish("documents", function(){
	return Documents.find({
		$or:[
			{isPrivate: false},
			{owner: this.userId}
		]}
	);
});

Meteor.publish("editingUsers", function(){
	return EditingUsers.find();
});