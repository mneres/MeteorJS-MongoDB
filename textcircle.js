this.Documents = new Mongo.Collection("documents");

if (Meteor.isClient){

	Template.editor.helpers({
		docid: function(){
			return Documents.findOne()._id;
		},
		config: function(){
			return function(editor){
				editor.on("change", function(cm_editor, info){
					console.log(cm_editor.getValue());
					$("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
				});
			}
		},
	});
}

if (Meteor.isServer){
	Meteor.startup(function(){
		// code to run on server at startup
		if(!Documents.findOne()){//no document yet
			Documents.insert({title: "My first document"});
		}
	});
}