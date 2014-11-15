Package.describe({
	name: 'useful:loadtest',
	summary: 'Write live load tests with full Meteor clients',
	version: '1.0.0',
	git: ''
});

Npm.depends({
	'phridge': '1.0.7'
});

Package.onUse(function(api) {

	api.use('underscore');

	api.use('gadicohen:phantomjs');

	api.versionsFrom('1.0');

	api.addFiles(['server/phridge.js','server/load.js', 'server/test.js'], ['server']);

	api.export('phridge');
	api.export('Load');
	api.export('Test');
});

Package.onTest(function(api) {
	api.use('tinytest');
	api.use('useful:loadtest');
	api.addFiles('loadtest-tests.js');
});
