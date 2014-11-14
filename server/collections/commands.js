Commands.allow({
  insert: function (userId, doc) {
    return User.hasAccess(userId, doc);
  },
  update: function (userId, doc, fieldNames, modifier) {
  	return User.hasAccess(userId, doc);
  },
  remove: function (userId, doc) {
    return User.hasAccess(userId, doc);
  }
});