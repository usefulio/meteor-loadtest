Swarms = new Mongo.Collection('swarms');

Swarms.before.insert(function(userId, doc){
	doc.userId = userId;
	doc.createdAt = new Date();
});