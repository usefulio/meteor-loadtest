Users = Meteor.users;

Users.hasAccess = function(userId, doc){
	if(doc.userId) doc = doc.userId;
	return userId === doc;
};