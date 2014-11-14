Router.configure({
	notFoundTemplate: 'NotFound'
	, loadingTemplate: 'Loading'
	, templateNameConverter: 'upperCamelCase'
	, routeControllerNameConverter: 'upperCamelCase'
    , layoutTemplate: 'MasterLayout'
});

Router.map(function () {

	this.route('home', { path: '/' });
	
});