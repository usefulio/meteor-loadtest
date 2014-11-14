Commands = new Mongo.Collection('commands');

Commands.before.insert(function(userId, doc){
	doc.userId = userId;
	doc.createdAt = new Date();
});