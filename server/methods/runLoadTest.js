function average(durations){
	var result = 0;
	for(var i = 0; i < durations.length; i++){
		result += durations[i];
	}
	return result / durations.length;
}

Meteor.methods({
	runLoadTest: function(url, numberOfClients){
		console.log('running load test against ', url, ' with ', numberOfClients);
		Load.new({
			// url you want to connect to
			url: url
			// number of clients you want to connect, only works in blocks of 50
			, numberOfClients: numberOfClients
			// handler for when the swarm is connected
			// {swarm} is your interface to controlling the swarm
			// {loadTimes} is an array of numbers that represent the page (not meteor client) load time of each client in milliseconds
			, ready: Meteor.bindEnvironment(function(swarm, loadTimes, ddpLoadTimes){
				var averageLoadTime = average(loadTimes);
				console.log('Average load time of ', averageLoadTime, 'ms for ', loadTimes.length, ' clients.');
				var averageDDPLoadTime = average(ddpLoadTimes);
				console.log('Average DDP load time of ', averageDDPLoadTime, 'ms for ', ddpLoadTimes.length, ' clients.');
				Commands.insert({
					url: url
					, pagesPerPhantom: process.env.PAGES_PER_PHANTOM || 10
					, numberOfClients: numberOfClients
					, loadTimes: loadTimes
					, averageLoadTime: averageLoadTime
					, ddpLoadTimes: ddpLoadTimes
					, averageDDPLoadTime: averageDDPLoadTime
				});
			})
		});
	}
});