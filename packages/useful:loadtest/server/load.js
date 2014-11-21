var PAGES_PER_PHANTOM = process.env.PAGES_PER_PHANTOM || 10;

Load = {
	_pages: []
	, _loadTimes: []
	, _ddpLoadTimes: []
};

_.extend(Load, {
	new: function(config){
		var self = this;
		this.config = config;
		this._pages = [];
		this._loadTimes = [];
		this._ddpLoadTimes = [];
		this._killAll(function(){
			self._spawnClients(config.url, config.numberOfClients, config.ready);
		});
	}
	, _killAll: function(callback){
		phridge.disposeAll().then(function(){
			// Npm.require('child_process').exec("killall phantomjs");
			callback();
		});
	}
	, _spawnClients: function(url, numberOfClients, callback){
		// right now we spawn 1 phantom for every PAGES_PER_PHANTOM tabs
		var self = this
			, numberOfPhantoms = Math.ceil(numberOfClients / PAGES_PER_PHANTOM)
			, firstConnect = function(url, waitFor, resolve, reject){
				// `this` in this context is the phantomjs page object 

				var page = this
					, start = Date.now()
				 	, loadTime
					, waitFor = eval("("+waitFor+")");

				// page.onConsoleMessage = function(msg) {
				// 	console.log(msg);
				// };

				page.open(url, function(status){
					var page = this;
					if(status !== "success"){
						console.log("could not load url", + url, " status ", status);
						return reject(new Error("Cannot load " + url));
					}
					
					loadTime = Date.now() - start;

					waitFor(function(){
						return page.evaluate(function(){
							return typeof DDP !== "undefined" && DDP._allSubscriptionsReady();
						})
					}, function(result){
						resolve({
							loadTime: loadTime
							, ddpLoadTime: Date.now() - start
						})
					}, 15000); /* 15 second timeout by default for DDP load */
				});
			}
			, onConnected = function(result){
				self._loadTimes.push(result.loadTime);
				self._ddpLoadTimes.push(result.ddpLoadTime);

				console.log(self._loadTimes.length, ' pages ready.');

				if(self._loadTimes.length === numberOfClients){
					// XXX Make isReady reactive and useful
					self._isReady = true;
					// XXX in the future lock down this api, but for now just pass ourselves
					callback(self, self._loadTimes.concat(), self._ddpLoadTimes.concat());
				}
			};

		// connect the desired number of clients
		for(var i = 0; i < numberOfPhantoms; i++){
			phridge.spawn({
				// XXX accept phridge options
				// XXX accept phantom options
				// XXX accept a handler for onConsoleMessage
				loadImages: false
			}).then(function(phantom){
				for(var i = 0; i < PAGES_PER_PHANTOM; i++){
					var page = phantom.createPage();
					self._pages.push(page);
					page.run(url, Load._waitForAsString, firstConnect).then(onConnected);
				}
			});
		}
	}
	, run: function(task){
		var self = this
			, results = []
			, times = []
			, numberOfClients = self._pages.length;

		task.check = task.check.toString();
		task.action = task.action.toString();

		for(var i = 0; i < numberOfClients; i++){
			self._pages[i].run(task, Load._waitForAsString, function(task, waitFor, resolve, reject){
				task.action = eval("("+task.action+")");
				task.check = eval("("+task.check+")");
				waitFor = eval("("+waitFor+")");

				var page = this
					, start = Date.now();

				page.evaluate(task.action);

				waitFor(function(){
					return page.evaluate(task.check);
				}, function(result){
					resolve({
						result: result
						, time: Date.now() - start
					});
				}, task.timeout || 5000);

			}).then(function(result){
				results.push(result.result);
				times.push(result.time);
				if(results.length >= numberOfClients){
					task.done(results, times);
				}

			});
		}
	}
});

// XXX this should have test, ready, failed, timeout
// and should be cleaned up
// it is adapted from https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
waitFor = function(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("waitFor timeout");
                    // phantom.exit(1);
                    clearInterval(interval); //< Stop this interval
                    typeof(onReady) === "string" ? eval(onReady) : onReady({ loadTestError: "task timed out after " + maxtimeOutMillis + " ms." }); //< Do what it's supposed to do once the condition is fulfilled
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    // console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    clearInterval(interval); //< Stop this interval
                    typeof(onReady) === "string" ? eval(onReady) : onReady(condition); //< Do what it's supposed to do once the condition is fulfilled
                }
            }
        }, 100); //< repeat check every 100ms
};

Load._waitForAsString = waitFor.toString();