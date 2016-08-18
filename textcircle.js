this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient){
	Template.editor.helpers({
		docid: function(){
			setupCurrentDocument();
			return Session.get("docid");
		},
		config: function(){
			return function(editor){
				editor.setOption("lineNumbers", true);
				editor.setOption("theme", "cobalt");
				editor.on("change", function(cm_editor, info){
					$("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
					Meteor.call("addEditingUser");
				});
			}
		},
	});

	Template.editingUsers.helpers({
		users: function(){
			var doc, eusers, users;
			doc = Documents.findOne();
			if(!doc){return;} //give up
			eusers = EditingUsers.findOne({docid: doc._id});
			if(!eusers){return;} //give up
			users = new Array();
			var i = 0;
			for(var user_id in eusers.users){
				users[i] = fixObjectKeys(eusers.users[user_id]);
				i++;
			}
			return users;
		}
	});

	Template.navbar.helpers({
		documents: function(){
			return Documents.find({});
		}
	});

	Template.docMeta.helpers({
		document: function(){
			return Documents.findOne({_id: Session.get("docid")});
		}
	});

	Template.editableText.helpers({
		userCanEdit: function(doc, Collection){
			//can edit if the current doc owned by me.
			doc = Documents.findOne({_id: Session.get("docid"), owner: Meteor.userId()});
			if(doc){
				return true;
			}return false;

		}
	});

	////////
	/// EVENTS
	////////
	Template.navbar.events({
		"click .js-add-doc":function(event){
			event.preventDefault();
			console.log("Add a new Doc");
			if(!Meteor.user()){//user not available
				alert("You need to login first");
			}else{
				Meteor.call("addDoc", function(err, res){
					if(!err){// all good
						console.log("event callback receive id: " + res);
						Session.set("docid", res);
					}
				});
			}
		},
		"click .js-load-doc":function(event){
			console.log(this);
			Session.set("docid", this._id);
		}
	})
}//end up meteor client


if (Meteor.isServer){
	Meteor.startup(function(){
		// code to run on server at startup
		if(!Documents.findOne()){//no document yet
			Documents.insert({title: "My first document"});
		}
	});
}

Meteor.methods({
	addDoc: function(){
		var doc;
		if(!this.userId){//not logged in
			return;
		}else{
			doc = {owner: this.userId, createdOn: new Date(), title: "my new doc"};
			var id = Documents.insert(doc);
			console.log("adddoc method: got an id" + id);
			return id;

		}

	},
	addEditingUser: function(){
		var doc, user, eusers;
		doc = Documents.findOne();
		if(!doc){return;} //no doc give up
		if(!this.userId){return;}//no logged in user give up
		//now I have a doc and possibly a user
		user = Meteor.user().profile;
		eusers = EditingUsers.findOne({docid:doc._id});
		if(!eusers){
			eusers = {
				docid:doc._id,
				users:{},
			};
		}
		user.lastEdit = new Date();
		eusers.users[this.userId] = user;
		EditingUsers.upsert({_id:eusers._id}, eusers);
	}
})

function setupCurrentDocument(){
	var doc;
	if(!Session.get("docid")){//no doc id set yet
		doc = Documents.findOne();
		if(doc){
			Session.set("docid", doc._id);
		}
	}
}


function fixObjectKeys(obj){
	var newObj = {};
	for(key in obj){
		var key2 = key.replace("-", "");
		newObj[key2] = obj[key];
	}
	return newObj;
}