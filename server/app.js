// XXX extend beyond average to do distributions
// e.g. 50% finished in X ms, 90% finished in Y ms
function average(durations){
	var result = 0;
	for(var i = 0; i < durations.length; i++){
		result += durations[i];
	}
	return result / durations.length;
}

// XXX Note that only one "load" can be created at a time.
// e.g. calling Load.new will kill the previously set
// up swarm of phantomjs instances and their tabs
// all params are required
Load.new({
	// url you want to connect to
	url: "http://localhost:4000" 
	// number of clients you want to connect, only works in blocks of 50
	, numberOfClients: 50
	// handler for when the swarm is connected
	// {swarm} is your interface to controlling the swarm
	// {loadTimes} is an array of numbers that represent the page (not meteor client) load time of each client in milliseconds
	, ready: function(swarm, loadTimes){
		var averageLoadTime = average(loadTimes);
		console.log('Average load time of ', averageLoadTime, 'ms for ', loadTimes.length, ' clients.');

		// execute a test, all params are required
		swarm.run({
			// the function that you want each client to run
			action: function(){
				// e.g. call a function on the remote server
				// from the phantomjs client
				Meteor.call('pingy', function(err, result){
					if(err){
						Session.set('myConnectionId', err.reason);
					}
					Session.set('myConnectionId', result);
				});
			}
			// the function that checks whether the action was completed
			, check: function(){
				// e.g. check to see that the method call completed successfully
				return Session.get('myConnectionId');
			}
			// the amount of time in milliseconds to wait for the action to complete
			, timeout: 3000
			// the callback for when all the clients have completed the action, successfully or not
			// {results} array of results (anything JSON serializable) returned from the check function
			// {durations} array of numbers that represent the time in milliseconds for each client to complete the action 
			, done: function(results, durations){
				console.log('Action average time of ', average(durations), 'ms for ', results.length, ' clients.');
				console.log(results);
				var errorCount = 0;
				for(var i = 0; i < results.length; i++){
					// if the action timed out for a specific client
					// the result for that client will be an object
					// with one property: loadTestError whose
					// value will be the error encountered
					if(results[i].loadTestError){
						errorCount++;
					}
				}
				console.log('Number of Errors: ', errorCount);
				console.log('Number of Results: ', results.length);
			}
		});
	}
});