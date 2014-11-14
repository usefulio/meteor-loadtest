HomeController = RouteController.extend({
	waitOn: function () {
		return [
			this.subscribe('/swarms')
			, this.subscribe('/commands')
		];
	}
	, data: function(){
		return {
			swarms: Swarms.find()
		};
	}
});
