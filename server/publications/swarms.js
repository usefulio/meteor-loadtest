Meteor.publish('/swarms', function(){
	return Swarms.find({userId: this.userId});
});